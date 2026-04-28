import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation, Trans } from "react-i18next";
import _ from "lodash";
import inquiriesService from "../../services/inquiriesService";
import getTimeAgo from "../../utils/getTimeAgo";

import Pagination from "../../common/Pagination";
import { useSearchParams } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

// Date filters
const DATE_FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const getDateRange = (filter) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (filter) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setDate(now.getDate() - now.getDay()); // Sunday
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      return { startDate: null, endDate: null };
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

// ─── ManageInquiries ────────────────────────────────────────────
const ManageInquiries = ({ searchQuery }) => {
  const { t } = useTranslation();
  const [searchParam] = useSearchParams();
  const q = searchParam.get("q");

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [dateFilter, setDateFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState({
    path: "created_at",
    order: "desc",
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [trigger, setTrigger] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(dateFilter);
      const params = {
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
        sortBy: sortColumn.path,
        order: sortColumn.order,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
      const res = await inquiriesService.getAll(params);
      setInquiries(res?.data);
      setTotalItems(res?.pagination?.totalItems);
    } catch (err) {
      toast.error(t("manageInquiries.errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on filter/pagination/sort changes
  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, dateFilter, sortColumn, trigger]);

  // Handle global search
  useEffect(() => {
    if (!String(q || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await inquiriesService.getAll({ search: q });
        setInquiries(res?.data);
        setTotalItems(res?.pagination?.totalItems);
      } catch {
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  const handleValidation = async (inq) => {
    const originalInquiries = [...inquiries];

    setInquiries((prev) =>
      prev.map((item) =>
        item.id === inq.id ? { ...item, is_treated: !item.is_treated } : item
      )
    );
    try {
      await inquiriesService.update(inq.id, { is_treated: !inq.is_treated });
      toast.success(`Inquiry updated successfully!`);
    } catch (error) {
      console.log("Error: ", error);
      toast.error(`Error updating inquiry!`);
      setInquiries(originalInquiries);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await inquiriesService.deleteOne(deleteModal.id);
      setInquiries((prev) => prev.filter((i) => i.id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success(t("manageInquiries.toasts.deleted"));
      setDeleteModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("manageInquiries.errors.deleteFailed")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSort = (path) => {
    const order =
      sortColumn.path === path && sortColumn.order === "asc" ? "desc" : "asc";
    setSortColumn({ path, order });
    setPageNumber(1);
  };

  const sorted = _.orderBy(inquiries, [sortColumn.path], [sortColumn.order]);

  // Stats
  const todayCount = inquiries?.filter((i) => {
    const today = new Date().toDateString();
    return new Date(i.created_at).toDateString() === today;
  }).length;
  const weekCount = inquiries?.filter((i) => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return new Date(i.created_at) >= weekAgo;
  }).length;

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          {t("manageInquiries.admin")}
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t("manageInquiries.title")}
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {t("manageInquiries.inquiriesSubmitted", { count: totalItems })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-envelope",
            label: t("manageInquiries.stats.total"),
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-calendar-day",
            label: t("manageInquiries.stats.today"),
            value: todayCount,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-calendar-week",
            label: t("manageInquiries.stats.week"),
            value: weekCount,
            color: "from-blue-400 to-indigo-500",
            ring: "ring-blue-200",
          },
          {
            icon: "fa-reply-all",
            label: t("manageInquiries.stats.avgResponse"),
            value: "—",
            color: "from-purple-400 to-pink-500",
            ring: "ring-purple-200",
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

      {/* Date Filter Tabs */}
      <div className='flex items-center gap-2 mb-5'>
        {DATE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setDateFilter(f.key);
              setPageNumber(1);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${
              dateFilter === f.key
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {t(`manageInquiries.filters.${f.key}`)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-20 rounded-2xl' />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-inbox text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>
            {t("manageInquiries.empty.noInquiries")}
          </p>
          <p className='text-sm text-stone-400'>
            {t("manageInquiries.empty.tryDifferentFilter")}
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  {[
                    t("manageInquiries.table.fullName"),
                    t("manageInquiries.table.email"),
                    t("manageInquiries.table.phone"),
                    t("manageInquiries.table.subject"),
                    t("manageInquiries.table.message"),
                    t("manageInquiries.table.date"),
                    t("manageInquiries.table.status"),
                    t("manageInquiries.table.actions"),
                  ].map((h, idx) => (
                    <th
                      key={h}
                      onClick={() => {
                        const sortable = [
                          "full_name",
                          "email",
                          "created_at",
                          "is_treated",
                        ];
                        if (
                          sortable.includes(
                            [
                              "full_name",
                              "email",
                              "subject",
                              "created_at",
                              "is_treated",
                            ][idx]
                          )
                        ) {
                          handleSort(
                            [
                              "full_name",
                              "email",
                              "subject",
                              "created_at",
                              "is_treated",
                            ][idx]
                          );
                        }
                      }}
                      className='px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap cursor-pointer hover:text-stone-600'
                    >
                      {h}
                      {sortColumn.path ===
                        [
                          "full_name",
                          "email",
                          "subject",
                          "created_at",
                          "is_treated",
                        ][idx] && (sortColumn.order === "asc" ? " ↑" : " ↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-50'>
                {sorted.map((inq) => (
                  <tr
                    key={inq.id}
                    className='hover:bg-stone-50 transition-colors'
                  >
                    <td className='px-4 py-4'>
                      <p className='font-semibold text-stone-700 text-sm'>
                        {inq.full_name}
                      </p>
                    </td>
                    <td className='px-4 py-4'>
                      <a
                        href={`mailto:${inq.email}`}
                        className='text-xs text-amber-600 hover:underline'
                      >
                        {inq.email}
                      </a>
                    </td>
                    <td className='px-4 py-4 text-xs text-stone-500'>
                      {inq.phone || "—"}
                    </td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex px-2 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold'>
                        {inq.subject}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <p className='text-xs text-stone-500 max-w-[220px] line-clamp-2 leading-relaxed'>
                        {inq.message}
                      </p>
                    </td>
                    <td className='px-4 py-4 text-xs text-stone-400 whitespace-nowrap'>
                      {getTimeAgo(inq.created_at)}
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                          inq.is_treated
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inq.is_treated ? "Done" : "Not yet"}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => setViewModal(inq)}
                          title={t("manageInquiries.tooltips.view")}
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-eye text-xs' />
                        </button>
                        <button
                          onClick={() => handleValidation(inq)}
                          title={t("manageInquiries.tooltips.markTreated")} // Fixed title
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-50 hover:text-green-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-check text-xs' />
                        </button>
                        <button
                          onClick={() => setDeleteModal(inq)}
                          title={t("manageInquiries.tooltips.delete")}
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

      {/* View Modal */}
      {viewModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-lg overflow-hidden'>
            <div className='h-1 bg-linear-to-r from-amber-400 to-orange-500' />
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <h3
                  className='font-black text-stone-800 text-xl'
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t("manageInquiries.modal.viewTitle")}
                </h3>
                <button
                  onClick={() => setViewModal(null)}
                  className='text-stone-400 hover:text-stone-600'
                >
                  <i className='fa fa-times' />
                </button>
              </div>
              <div className='space-y-4'>
                <div>
                  <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                    {t("manageInquiries.modal.fullName")}
                  </p>
                  <p className='text-stone-800 font-medium'>
                    {viewModal.full_name}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                    {t("manageInquiries.modal.email")}
                  </p>
                  <a
                    href={`mailto:${viewModal.email}`}
                    className='text-amber-600 hover:underline'
                  >
                    {viewModal.email}
                  </a>
                </div>
                {viewModal.phone && (
                  <div>
                    <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                      {t("manageInquiries.modal.phone")}
                    </p>
                    <p className='text-stone-800'>{viewModal.phone}</p>
                  </div>
                )}
                <div>
                  <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                    {t("manageInquiries.modal.subject")}
                  </p>
                  <p className='text-stone-800 font-medium'>
                    {viewModal.subject}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                    {t("manageInquiries.modal.message")}
                  </p>
                  <div className='bg-stone-50 p-3 rounded-xl text-stone-700 text-sm whitespace-pre-wrap'>
                    {viewModal.message}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-bold text-stone-400 uppercase tracking-wider'>
                    {t("manageInquiries.modal.submitted")}
                  </p>
                  <p className='text-stone-500 text-sm'>
                    {new Date(viewModal.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='mt-6 flex justify-end'>
                <button
                  onClick={() => setViewModal(null)}
                  className='px-5 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors'
                >
                  {t("manageInquiries.modal.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
                {t("manageInquiries.modal.deleteTitle")}
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                <Trans
                  i18nKey='manageInquiries.modal.deleteDescription'
                  values={{ name: deleteModal.full_name }}
                >
                  This will permanently remove the inquiry from{" "}
                  <strong>{{ name }}</strong>. This action cannot be undone.
                </Trans>
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageInquiries.modal.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {deleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageInquiries.modal.deleting")}
                    </>
                  ) : (
                    t("manageInquiries.modal.delete")
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

export default ManageInquiries;
