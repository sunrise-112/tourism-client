import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import reviewService from "../../services/reviewService";
import getTimeAgo from "../../utils/getTimeAgo";

import Pagination from "../../common/Pagination";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const StarRating = ({ rating }) => (
  <div className='flex items-center gap-0.5'>
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={`fa fa-star text-[10px] ${
          s <= rating ? "text-amber-400" : "text-stone-200"
        }`}
      />
    ))}
  </div>
);

const FILTERS = ["All", "Approved", "Pending"];

// ─── ManageReviews ────────────────────────────────────────────
const ManageReviews = ({ searchQuery }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState({
    path: "created_at",
    order: "desc",
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [trigger, setTrigger] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: pageSize,
        ...(filter === "Approved" && { approve: true }),
        ...(filter === "Pending" && { approve: false }),
        ...(filter === "All" && { approve: "all" }),
      };
      const res = await reviewService.getAll(params);
      setReviews(res?.data);
      setTotalItems(res?.pagination?.totalItems);
    } catch {
      toast.error("Failed to fetch reviews!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, filter, trigger]);

  useEffect(() => {
    if (!String(searchQuery || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await reviewService.getAll({ q: searchQuery });
        setReviews(res?.data);
        setTotalItems(res?.pagination?.totalItems);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchQuery]);

  const handleApprove = async (review) => {
    const approved = review?.approve;
    const originalReviews = [...reviews];
    try {
      setApprovingId(review.id);
      await reviewService.approve(review.id, !approved);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, approve: !approved } : r))
      );
      toast.success(`Review ${!approved ? "approved" : "disapproved"}!`);
    } catch (err) {
      setReviews(originalReviews);
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${!approved ? "approved" : "disapproved"} Review!`
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await reviewService.deleteOne(deleteModal.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success("Review deleted!");
      setDeleteModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete review!");
    } finally {
      setDeleting(false);
    }
  };

  const sorted = _.orderBy(reviews, [sortColumn.path], [sortColumn.order]);
  const approved = reviews.filter((r) => r.approve).length;
  const pending = reviews.filter((r) => !r.approve).length;
  const avgRating = reviews.length
    ? (
        reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : "—";

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
          Manage Reviews
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {totalItems} reviews submitted
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-comments",
            label: "Total Reviews",
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-check-circle",
            label: "Approved",
            value: approved,
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
            icon: "fa-star",
            label: "Avg Rating",
            value: avgRating,
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
      <div className='flex items-center gap-2 mb-5'>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPageNumber(1);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${
              filter === f
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-20 rounded-2xl' />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-star text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No reviews found</p>
          <p className='text-sm text-stone-400'>Try a different filter.</p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  {[
                    "Reviewer",
                    "Tour",
                    "Rating",
                    "Review",
                    "Status",
                    "Date",
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
                {sorted.map((r) => (
                  <tr
                    key={r.id}
                    className='hover:bg-stone-50 transition-colors'
                  >
                    {/* Reviewer */}
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {r.user?.avatar ? (
                            <img
                              src={`${import.meta.env.VITE_BACK_END_URL}${
                                r.user.avatar
                              }`}
                              alt={r.user_name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold'>
                              {r.user_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className='font-semibold text-stone-700 text-xs whitespace-nowrap'>
                            {r.user_name || "Anonymous"}
                          </p>
                          <p className='text-stone-400 text-[10px]'>
                            {r.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Tour */}
                    <td className='px-4 py-4'>
                      <p className='text-xs font-semibold text-amber-600 max-w-[140px] truncate'>
                        {r.tour_title || "—"}
                      </p>
                    </td>
                    {/* Rating */}
                    <td className='px-4 py-4'>
                      <div className='flex flex-col gap-0.5'>
                        <StarRating rating={r.rating} />
                        <span className='text-[10px] text-stone-400 font-bold'>
                          {r.rating}/5
                        </span>
                      </div>
                    </td>
                    {/* Comment */}
                    <td className='px-4 py-4'>
                      <p className='text-xs text-stone-500 max-w-[220px] line-clamp-2 leading-relaxed'>
                        {r.comment || r.message || "—"}
                      </p>
                    </td>
                    {/* Status */}
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          r.approve
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.approve ? "bg-emerald-400" : "bg-yellow-400"
                          }`}
                        />
                        {r.approve ? "Approved" : "Pending"}
                      </span>
                    </td>
                    {/* Date */}
                    <td className='px-4 py-4 text-xs text-stone-400 whitespace-nowrap'>
                      {r.created_at ? getTimeAgo(r.created_at) : "—"}
                    </td>
                    {/* Actions */}
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        {
                          <button
                            onClick={() => handleApprove(r)}
                            title='Approve'
                            disabled={approvingId === r.id}
                            className='w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors disabled:opacity-60'
                          >
                            {approvingId === r.id ? (
                              <i className='fa fa-spinner fa-spin text-xs' />
                            ) : (
                              <i className='fa fa-check text-xs' />
                            )}
                          </button>
                        }
                        <button
                          onClick={() => setDeleteModal(r)}
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

      {/* Delete modal */}
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
                Delete Review?
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                This will permanently remove the review by{" "}
                <strong>{deleteModal?.user?.name}</strong>. This action cannot
                be undone.
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

export default ManageReviews;
