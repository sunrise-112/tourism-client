import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import notificationService from "../../../services/notificationService";
import Pagination from "../../../common/Pagination";
import getTimeAgo from "../../../utils/getTimeAgo";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const TYPE_STYLES = {
  info: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
    icon: "fa-info-circle",
  },
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    icon: "fa-check-circle",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: "fa-exclamation-triangle",
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
    icon: "fa-times-circle",
  },
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLES[type] || TYPE_STYLES.info;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {type || "info"}
    </span>
  );
};

const ReadBadge = ({ is_read }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
      is_read
        ? "bg-stone-50 text-stone-400 border-stone-200"
        : "bg-violet-50 text-violet-700 border-violet-200"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        is_read ? "bg-stone-300" : "bg-violet-400"
      }`}
    />
    {is_read ? "Read" : "Unread"}
  </span>
);

const TYPE_FILTERS = ["All", "info", "success", "warning", "error"];
const READ_FILTERS = ["All", "Unread", "Read"];

const EMPTY_FORM = { title: "", message: "", type: "info" };

// ─── ManageNotifications ──────────────────────────────────────
const ManageNotifications = ({ searchQuery }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [trigger, setTrigger] = useState(false);

  // create / edit modal
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
        ...(typeFilter !== "All" && { type: typeFilter }),
        ...(readFilter === "Unread" && { is_read: false }),
        ...(readFilter === "Read" && { is_read: true }),
      };
      const res = await notificationService.getAll(params);
      setNotifications(res?.data || []);
      setTotalItems(res?.pagination?.totalItems || res?.data?.length || 0);
    } catch {
      toast.error("Failed to fetch notifications!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, readFilter, pageNumber, pageSize, trigger]);

  // ── Stats ────────────────────────────────────────────────────
  const unread = notifications.filter((n) => !n.is_read).length;
  const total = totalItems;

  // ── Selection ────────────────────────────────────────────────
  const onSelect = (id) =>
    setSelectedItems((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
  const toggleAll = () =>
    setSelectedItems(
      selectedItems.length === notifications.length
        ? []
        : notifications.map((n) => n.id)
    );

  // ── Mark read (single) ───────────────────────────────────────
  const handleMarkRead = async (n) => {
    if (n.is_read) return;
    try {
      await notificationService.markRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      );
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  // ── Mark all read ────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
      toast.success("All notifications marked as read!");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  // ── Delete one ───────────────────────────────────────────────
  const handleDelete = async () => {
    const original = [...notifications];
    try {
      setDeleting(true);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteModal.id));
      await notificationService.deleteOne(deleteModal.id);
      setTotalItems((c) => c - 1);
      toast.success("Notification deleted!");
      setDeleteModal(null);
    } catch (err) {
      setNotifications(original);
      toast.error(err?.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Bulk delete ──────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const original = [...notifications];
    try {
      setNotifications((prev) =>
        prev.filter((n) => !selectedItems.includes(n.id))
      );
      await notificationService.deleteMany(selectedItems);
      setTotalItems((c) => c - selectedItems.length);
      setSelectedItems([]);
    } catch {
      setNotifications(original);
      toast.error("Bulk delete failed.");
    }
  };

  // ── Form helpers ─────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormModal(true);
  };
  const openEdit = (n) => {
    setEditTarget(n);
    setForm({
      title: n.title,
      message: n.message,
      type: n.type,
    });
    setFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editTarget) {
        const updated = await notificationService.update(editTarget.id, form);
        setNotifications((prev) =>
          prev.map((n) => (n.id === editTarget.id ? { ...n, ...updated } : n))
        );
      } else {
        await notificationService.create(form);
        setTrigger((t) => !t);
      }
      setFormModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700";

  const sorted = _.orderBy(notifications, ["created_at"], ["desc"]);

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className='mb-8 flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
            Admin
          </p>
          <h1
            className='text-3xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Manage Notifications
          </h1>
          <p className='text-stone-400 text-sm mt-1'>
            {totalItems} notifications total
          </p>
        </div>
        <div className='flex gap-2 flex-wrap'>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className='inline-flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors px-4 py-2.5 rounded-xl'
            >
              <i className='fa fa-check-double text-xs' /> Mark all read
            </button>
          )}
          <button
            onClick={openCreate}
            className='inline-flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-amber-200'
          >
            <i className='fa fa-bell text-xs' /> Send Notification
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-bell",
            label: "Total",
            value: total,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-envelope",
            label: "Unread",
            value: unread,
            color: "from-violet-400 to-purple-500",
            ring: "ring-violet-200",
          },
          {
            icon: "fa-check",
            label: "Read",
            value: notifications.filter((n) => n.is_read).length,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-eye",
            label: "This Page",
            value: sorted.length,
            color: "from-stone-400 to-stone-500",
            ring: "ring-stone-200",
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

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className='flex items-center gap-2 mb-3 flex-wrap'>
        <div className='flex gap-1.5 flex-wrap'>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setTypeFilter(f);
                setPageNumber(1);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border capitalize transition-colors ${
                typeFilter === f
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {f !== "All" && (
                <i
                  className={`fa ${TYPE_STYLES[f]?.icon} mr-1.5 text-[10px]`}
                />
              )}
              {f}
            </button>
          ))}
        </div>
        <div className='w-px h-5 bg-stone-200 mx-1' />
        <div className='flex gap-1.5 flex-wrap'>
          {READ_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setReadFilter(f);
                setPageNumber(1);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                readFilter === f
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {selectedItems.length > 0 && (
          <div className='ml-auto flex items-center gap-2'>
            <span className='text-xs text-stone-500 font-semibold'>
              {selectedItems.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className='text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors'
            >
              <i className='fa fa-trash mr-1.5 text-[10px]' /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-16 rounded-2xl' />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-bell text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>
            No notifications found
          </p>
          <p className='text-sm text-stone-400'>
            Try a different filter or send a new notification.
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  <th className='px-4 py-3.5'>
                    <input
                      type='checkbox'
                      checked={
                        selectedItems.length === notifications.length &&
                        notifications.length > 0
                      }
                      onChange={toggleAll}
                      className='w-4 h-4 rounded border-stone-300 accent-amber-400 cursor-pointer'
                    />
                  </th>
                  {[
                    "Notification",
                    "Type",
                    "Status",
                    "Sent",
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
                {sorted.map((n) => (
                  <tr
                    key={n.id}
                    className={`hover:bg-stone-50 transition-colors ${
                      selectedItems.includes(n.id) ? "bg-amber-50/40" : ""
                    } ${!n.is_read ? "border-l-2 border-l-violet-300" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className='px-4 py-3'>
                      <input
                        type='checkbox'
                        checked={selectedItems.includes(n.id)}
                        onChange={() => onSelect(n.id)}
                        className='w-4 h-4 rounded border-stone-300 accent-amber-400 cursor-pointer'
                      />
                    </td>
                    {/* Notification */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            TYPE_STYLES[n.type]?.bg || "bg-stone-100"
                          }`}
                        >
                          <i
                            className={`fa ${
                              TYPE_STYLES[n.type]?.icon || "fa-bell"
                            } ${
                              TYPE_STYLES[n.type]?.text || "text-stone-400"
                            } text-xs`}
                          />
                        </div>
                        <div>
                          <p className='font-semibold text-stone-700 text-xs'>
                            {n.title}
                          </p>
                          <p className='text-stone-400 text-xs mt-0.5 max-w-[200px] truncate'>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className='px-4 py-3'>
                      <TypeBadge type={n.type} />
                    </td>
                    {/* Read status */}
                    <td className='px-4 py-3'>
                      <ReadBadge is_read={n.is_read} />
                    </td>

                    {/* Sent */}
                    <td className='px-4 py-3 text-xs text-stone-400 whitespace-nowrap'>
                      {n.created_at ? getTimeAgo(n.created_at) : "—"}
                    </td>
                    {/* Actions */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n)}
                            title='Mark as read'
                            className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-violet-50 hover:text-violet-600 flex items-center justify-center text-stone-400 transition-colors'
                          >
                            <i className='fa fa-check text-xs' />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(n)}
                          title='Edit'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-pen text-xs' />
                        </button>
                        <button
                          onClick={() => setDeleteModal(n)}
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

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      {formModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-md overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
            <div className='p-6'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center'>
                  <i
                    className={`fa ${
                      editTarget ? "fa-pen" : "fa-bell"
                    } text-amber-500 text-sm`}
                  />
                </div>
                <div>
                  <h3
                    className='font-black text-stone-800 text-lg'
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {editTarget ? "Edit Notification" : "Send Notification"}
                  </h3>
                  <p className='text-xs text-stone-400'>
                    {editTarget
                      ? `Editing #${editTarget.id}`
                      : "Broadcast or target a user"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                      Title *
                    </label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder='Notification title'
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                      Type *
                    </label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, type: e.target.value }))
                      }
                      className={inputClass}
                    >
                      {["info", "success", "warning", "error"].map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder='Notification body...'
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                {/* Preview pill */}
                <div
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
                    TYPE_STYLES[form.type]?.bg
                  } ${TYPE_STYLES[form.type]?.border}`}
                >
                  <i
                    className={`fa ${TYPE_STYLES[form.type]?.icon} ${
                      TYPE_STYLES[form.type]?.text
                    } text-xs`}
                  />
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        TYPE_STYLES[form.type]?.text
                      }`}
                    >
                      {form.title || "Title preview"}
                    </p>
                    <p className='text-[11px] text-stone-400 truncate max-w-xs'>
                      {form.message || "Message preview..."}
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 pt-1'>
                  <button
                    type='button'
                    onClick={() => setFormModal(false)}
                    className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={saving}
                    className='flex-1 py-2.5 rounded-xl text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors'
                  >
                    {saving ? (
                      <>
                        <i className='fa fa-spinner fa-spin mr-1.5' />
                        Saving...
                      </>
                    ) : editTarget ? (
                      "Save Changes"
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ────────────────────────────────────────── */}
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
                Delete Notification?
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                Permanently delete <strong>"{deleteModal?.title}"</strong>? This
                cannot be undone.
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

export default ManageNotifications;
