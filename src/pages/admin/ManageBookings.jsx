import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import bookingService from "../../services/bookingService";
import Pagination from "../../common/Pagination";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const STATUS_STYLES = {
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  completed: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const STATUSES = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

// ─── Status Modal ─────────────────────────────────────────────
const StatusModal = ({ booking, onConfirm, onClose, loading }) => {
  const [selected, setSelected] = useState(booking?.status || "pending");
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-sm overflow-hidden'>
        <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
        <div className='p-6'>
          <h3
            className='font-black text-stone-800 text-lg mb-1'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Update Status
          </h3>
          <p className='text-sm text-stone-400 mb-5'>
            Change status for{" "}
            <span className='font-semibold text-stone-600'>
              {booking?.tour?.title}
            </span>
          </p>
          <div className='grid grid-cols-2 gap-2 mb-6'>
            {["pending", "confirmed", "completed", "cancelled"].map((s) => {
              const style = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                    selected === s
                      ? `${style.bg} ${style.text} ${style.border} ring-2 ring-offset-1 ${style.border}`
                      : "border-stone-200 text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  {s}
                </button>
              );
            })}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selected)}
              disabled={loading}
              className='flex-1 py-2.5 rounded-xl text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors'
            >
              {loading ? (
                <>
                  <i className='fa fa-spinner fa-spin mr-1.5' />
                  Saving...
                </>
              ) : (
                "Save Status"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ManageBookings ───────────────────────────────────────────
const ManageBookings = ({ searchQuery }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState({
    path: "created_at",
    order: "desc",
  });
  const [statusModal, setStatusModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: pageSize,
        ...(statusFilter !== "All" && { status: statusFilter.toLowerCase() }),
      };
      const res = await bookingService.getAll(params);
      setBookings(res?.data?.bookings || res?.data || []);
      setTotalItems(res?.data?.total || 0);
    } catch {
      toast.error("Failed to fetch bookings!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, statusFilter, trigger]);

  useEffect(() => {
    if (!String(searchQuery || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getAll({ q: searchQuery });
        setBookings(res?.data?.bookings || res?.data || []);
        setTotalItems(res?.data?.total || 0);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchQuery]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await bookingService.updateStatus(statusModal.id, newStatus);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === statusModal.id ? { ...b, status: newStatus } : b
        )
      );
      toast.success("Booking status updated!");
      setStatusModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await bookingService.deleteById(deleteModal.id);
      setBookings((prev) => prev.filter((b) => b.id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success("Booking deleted!");
      setDeleteModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete booking!");
    } finally {
      setDeleting(false);
    }
  };

  const sorted = _.orderBy(bookings, [sortColumn.path], [sortColumn.order]);

  // Stats
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const revenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price || 0), 0);

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Admin
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Manage Bookings
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {totalItems} bookings in total
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-suitcase",
            label: "Total",
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-check-circle",
            label: "Confirmed",
            value: confirmed,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-clock",
            label: "Pending",
            value: pending,
            color: "from-yellow-400 to-amber-500",
            ring: "ring-yellow-200",
          },
          {
            icon: "fa-dollar-sign",
            label: "Revenue",
            value: `$${revenue.toLocaleString()}`,
            color: "from-blue-400 to-indigo-500",
            ring: "ring-blue-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className='bg-white rounded-2xl border border-stone-100 p-5'
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm ring-4 ${s.ring}`}
            >
              <i className={`fa ${s.icon} text-white text-xs`} />
            </div>
            <p className='text-xl font-black text-stone-800'>
              {loading ? "—" : s.value}
            </p>
            <p className='text-xs text-stone-400 font-medium mt-0.5'>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────── */}
      <div className='flex items-center gap-2 mb-5 flex-wrap'>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPageNumber(1);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${
              statusFilter === s
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-16 rounded-2xl' />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-calendar-times text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No bookings found</p>
          <p className='text-sm text-stone-400'>
            Try a different filter or search term.
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  {[
                    "Tour",
                    "Customer",
                    "Date",
                    "Duration",
                    "Total",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-50'>
                {sorted.map((b) => (
                  <tr
                    key={b.id}
                    className='hover:bg-stone-50 transition-colors group'
                  >
                    {/* Tour */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-9 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {b.tour?.cover_image ? (
                            <img
                              src={b.tour.cover_image}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-stone-300'>
                              <i className='fa fa-image text-xs' />
                            </div>
                          )}
                        </div>
                        <p className='font-semibold text-stone-700 max-w-[160px] truncate text-xs'>
                          {b.tour?.title || "—"}
                        </p>
                      </div>
                    </td>
                    {/* Customer */}
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-stone-700 text-xs'>
                        {b.user?.name || "—"}
                      </p>
                      <p className='text-stone-400 text-[10px]'>
                        {b.user?.email}
                      </p>
                    </td>
                    {/* Date */}
                    <td className='px-4 py-3 whitespace-nowrap text-xs text-stone-500'>
                      {b.booking_date
                        ? new Date(b.booking_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    {/* Duration */}
                    <td className='px-4 py-3 text-xs text-stone-500 whitespace-nowrap'>
                      {b.tour?.duration_days ? `${b.tour.duration_days}d` : "—"}
                    </td>
                    {/* Total */}
                    <td className='px-4 py-3'>
                      <span className='font-black text-amber-600 text-sm'>
                        ${Number(b.total_price || 0).toLocaleString()}
                      </span>
                    </td>
                    {/* Status */}
                    <td className='px-4 py-3'>
                      <StatusBadge status={b.status} />
                    </td>
                    {/* Actions */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => setStatusModal(b)}
                          title='Update Status'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-exchange-alt text-xs' />
                        </button>
                        <button
                          onClick={() => setDeleteModal(b)}
                          title='Delete'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-trash text-xs' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='border-t border-stone-100 px-6 py-4'>
            <Pagination
              itemsCount={totalItems}
              pageNumber={pageNumber}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPageNumber(1);
              }}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      )}

      {statusModal && (
        <StatusModal
          booking={statusModal}
          onConfirm={handleUpdateStatus}
          onClose={() => setStatusModal(null)}
          loading={updatingStatus}
        />
      )}

      {deleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-sm overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-red-400 to-rose-500' />
            <div className='p-6'>
              <div className='w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4'>
                <i className='fa fa-exclamation-triangle text-red-500' />
              </div>
              <h3
                className='font-black text-stone-800 text-lg mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Delete Booking?
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                This will permanently remove the booking for{" "}
                <strong>{deleteModal?.tour?.title}</strong>.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {deleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
