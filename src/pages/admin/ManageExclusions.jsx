import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Services
import exclusionService from "../../services/exclusionsService";

// Commons
import Pagination from "../../common/Pagination";

// Utils
import { exclusionKeyMap } from "../../utils/exclusionKeyMap";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

// ─── ManageExclusions ─────────────────────────────────────────
const ManageExclusions = ({ searchQuery }) => {
  const { t } = useTranslation();
  const [exclusions, setExclusions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("All");
  const [trigger, setTrigger] = useState(false);

  // ── Modals / in-flight state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // ── Form modal (create / edit)
  const [formModal, setFormModal] = useState(null); // null | { mode: "create" | "edit", data?: exclusion }
  const [formValue, setFormValue] = useState({
    text: "",
    is_active: true,
  });
  const [formSaving, setFormSaving] = useState(false);

  const FILTERS = ["All", "Active", "Inactive"];

  // ─── Fetch ────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
        ...(filter === "Active" && { is_active: true }),
        ...(filter === "Inactive" && { is_active: false }),
      };
      const res = await exclusionService.getAll(params);
      setExclusions(res?.data ?? []);
      setTotalItems(res?.pagination?.totalItems ?? 0);
    } catch {
      toast.error(t("manageExclusions.errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, filter, trigger]);

  const translatedExclusiosn = exclusions?.map((cat) => ({
    ...cat,
    label: exclusionKeyMap[cat?.text]
      ? t(`manageExclusions.exclusions.${exclusionKeyMap[cat?.text]}`)
      : cat?.text,
  }));

  // ── Search
  useEffect(() => {
    if (!String(searchQuery || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await exclusionService.getAll({ search: searchQuery });
        setExclusions(res?.data ?? []);
        setTotalItems(res?.pagination?.totalItems ?? 0);
      } catch {
        setExclusions([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchQuery]);

  // ─── Selection ────────────────────────────────────────────
  const allSelected =
    exclusions.length > 0 && selectedIds.length === exclusions.length;

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : exclusions.map((e) => e.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ─── Toggle active ────────────────────────────────────────
  const handleToggleActive = async (exclusion) => {
    const original = [...exclusions];
    try {
      setTogglingId(exclusion.id);
      await exclusionService.update(exclusion.id, {
        is_active: !exclusion.is_active,
      });
      setExclusions((prev) =>
        prev.map((e) =>
          e.id === exclusion.id ? { ...e, is_active: !e.is_active } : e
        )
      );
      toast.success(
        exclusion.is_active
          ? t("manageExclusions.toasts.deactivated")
          : t("manageExclusions.toasts.activated")
      );
    } catch (err) {
      setExclusions(original);
      toast.error(
        err?.response?.data?.message ||
          t("manageExclusions.errors.updateFailed")
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Delete one ───────────────────────────────────────────
  const handleDeleteOne = async () => {
    try {
      setDeleting(true);
      await exclusionService.deleteOne(deleteModal.id);
      setExclusions((prev) => prev.filter((e) => e.id !== deleteModal.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success(t("manageExclusions.toasts.deleteSuccess"));
      setDeleteModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t("manageExclusions.errors.deleteFailed")
      );
    } finally {
      setDeleting(false);
    }
  };

  // ─── Delete many ──────────────────────────────────────────
  const handleDeleteMany = async () => {
    try {
      setBulkDeleting(true);
      await exclusionService.deleteMany(selectedIds);
      setExclusions((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setTotalItems((n) => n - selectedIds.length);
      setSelectedIds([]);
      setBulkDeleteModal(false);
      toast.success(t("manageExclusions.toasts.bulkDeleteSuccess"));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t("manageExclusions.errors.bulkDeleteFailed")
      );
    } finally {
      setBulkDeleting(false);
    }
  };

  // ─── Form (create / edit) ─────────────────────────────────
  const openCreate = () => {
    setFormValue({ text: "", is_active: true });
    setFormModal({ mode: "create" });
  };

  const openEdit = (exclusion) => {
    setFormValue({
      text: exclusion.text,
      is_active: exclusion.is_active,
    });
    setFormModal({ mode: "edit", data: exclusion });
  };

  const handleFormSave = async () => {
    if (!formValue.text.trim())
      return toast.error(t("manageExclusions.errors.nameRequired"));
    try {
      setFormSaving(true);
      if (formModal.mode === "create") {
        const created = await exclusionService.create(formValue);
        setExclusions((prev) => [created, ...prev]);
        setTotalItems((n) => n + 1);
        toast.success(t("manageExclusions.toasts.createSuccess"));
      } else {
        const updated = await exclusionService.update(
          formModal.data.id,
          formValue
        );
        setExclusions((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
        toast.success(t("manageExclusions.toasts.updateSuccess"));
      }
      setFormModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("manageExclusions.errors.saveFailed")
      );
    } finally {
      setFormSaving(false);
    }
  };

  // ─── Derived stats ────────────────────────────────────────
  const activeCount = exclusions.filter((e) => e.is_active).length;
  const inactiveCount = exclusions.filter((e) => !e.is_active).length;

  const getFilterLabel = (filterKey) => {
    switch (filterKey) {
      case "All":
        return t("manageExclusions.filters.all");
      case "Active":
        return t("manageExclusions.filters.active");
      case "Inactive":
        return t("manageExclusions.filters.inactive");
      default:
        return filterKey;
    }
  };

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className='mb-8 flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
            {t("manageExclusions.admin")}
          </p>
          <h1
            className='text-3xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("manageExclusions.title")}
          </h1>
          <p className='text-stone-400 text-sm mt-1'>
            {t("manageExclusions.totalExclusions", { count: totalItems })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors shadow-sm'
        >
          <i className='fa fa-plus text-xs' />
          {t("manageExclusions.newExclusion")}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
        {[
          {
            icon: "fa-ban",
            label: t("manageExclusions.stats.total"),
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-check-circle",
            label: t("manageExclusions.stats.active"),
            value: activeCount,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-times-circle",
            label: t("manageExclusions.stats.inactive"),
            value: inactiveCount,
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

      {/* ── Toolbar ────────────────────────────────── */}
      <div className='flex items-center justify-between gap-3 mb-5 flex-wrap'>
        <div className='flex items-center gap-2'>
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
              {getFilterLabel(f)}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={() => setBulkDeleteModal(true)}
            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors'
          >
            <i className='fa fa-trash text-xs' />
            {t("manageExclusions.bulkDeleteButton", {
              count: selectedIds.length,
            })}
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-16 rounded-2xl' />
          ))}
        </div>
      ) : exclusions.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-ban text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>
            {t("manageExclusions.empty.title")}
          </p>
          <p className='text-sm text-stone-400'>
            {t("manageExclusions.empty.description")}
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  <th className='px-4 py-3.5 w-10'>
                    <input
                      type='checkbox'
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className='w-4 h-4 rounded accent-amber-500 cursor-pointer'
                    />
                  </th>
                  {[
                    t("manageExclusions.table.serial"),
                    t("manageExclusions.table.name"),
                    t("manageExclusions.table.status"),
                    t("manageExclusions.table.created"),
                    t("manageExclusions.table.actions"),
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
                {translatedExclusiosn.map((e, idx) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-stone-50 transition-colors ${
                      selectedIds.includes(e.id) ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className='px-4 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedIds.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className='w-4 h-4 rounded accent-amber-500 cursor-pointer'
                      />
                    </td>
                    {/* # */}
                    <td className='px-4 py-4 text-xs text-stone-400 font-mono'>
                      {(pageNumber - 1) * pageSize + idx + 1}
                    </td>
                    {/* Name */}
                    <td className='px-4 py-4'>
                      <p className='font-semibold text-stone-700 text-sm'>
                        {e.label}
                      </p>
                    </td>
                    {/* Status */}
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          e.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.is_active ? "bg-emerald-400" : "bg-stone-400"
                          }`}
                        />
                        {e.is_active
                          ? t("manageExclusions.status.active")
                          : t("manageExclusions.status.inactive")}
                      </span>
                    </td>
                    {/* Date */}
                    <td className='px-4 py-4 text-xs text-stone-400 whitespace-nowrap'>
                      {e.created_at
                        ? new Date(e.created_at).toLocaleDateString(
                            t("locale", { defaultValue: "en-GB" }),
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    {/* Actions */}
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(e)}
                          disabled={togglingId === e.id}
                          title={
                            e.is_active
                              ? t("manageExclusions.tooltips.deactivate")
                              : t("manageExclusions.tooltips.activate")
                          }
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-60 ${
                            e.is_active
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-500"
                          }`}
                        >
                          {togglingId === e.id ? (
                            <i className='fa fa-spinner fa-spin text-xs' />
                          ) : (
                            <i
                              className={`fa text-xs ${
                                e.is_active ? "fa-toggle-on" : "fa-toggle-off"
                              }`}
                            />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(e)}
                          title={t("manageExclusions.tooltips.edit")}
                          className='w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors'
                        >
                          <i className='fa fa-pencil text-xs' />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteModal(e)}
                          title={t("manageExclusions.tooltips.delete")}
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

      {/* ── Form Modal (Create / Edit) ─────────────── */}
      {formModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-sm overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-amber-400 to-orange-500' />
            <div className='p-6'>
              <h3
                className='font-black text-stone-800 text-lg mb-5'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {formModal.mode === "create"
                  ? t("manageExclusions.modal.createTitle")
                  : t("manageExclusions.modal.editTitle")}
              </h3>

              {/* Name */}
              <label className='block mb-4'>
                <span className='text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block'>
                  {t("manageExclusions.modal.nameLabel")}
                </span>
                <input
                  type='text'
                  value={formValue.text}
                  onChange={(e) =>
                    setFormValue((v) => ({ ...v, text: e.target.value }))
                  }
                  placeholder={t("manageExclusions.modal.namePlaceholder")}
                  maxLength={300}
                  className='w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300'
                />
              </label>

              {/* Is active */}
              <label className='flex items-center gap-3 mb-6 cursor-pointer'>
                <div
                  onClick={() =>
                    setFormValue((v) => ({ ...v, is_active: !v.is_active }))
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    formValue.is_active ? "bg-emerald-400" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      formValue.is_active ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <span className='text-sm font-semibold text-stone-600'>
                  {formValue.is_active
                    ? t("manageExclusions.status.active")
                    : t("manageExclusions.status.inactive")}
                </span>
              </label>

              <div className='flex gap-3'>
                <button
                  onClick={() => setFormModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageExclusions.modal.cancel")}
                </button>
                <button
                  onClick={handleFormSave}
                  disabled={formSaving}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors'
                >
                  {formSaving ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageExclusions.modal.saving")}
                    </>
                  ) : formModal.mode === "create" ? (
                    t("manageExclusions.modal.create")
                  ) : (
                    t("manageExclusions.modal.saveChanges")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete one modal ───────────────────────── */}
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
                {t("manageExclusions.deleteModal.title")}
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                {t("manageExclusions.deleteModal.description", {
                  name: deleteModal.text,
                })}
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageExclusions.deleteModal.cancel")}
                </button>
                <button
                  onClick={handleDeleteOne}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {deleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageExclusions.deleteModal.deleting")}
                    </>
                  ) : (
                    t("manageExclusions.deleteModal.delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete modal ──────────────────────── */}
      {bulkDeleteModal && (
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
                {t("manageExclusions.bulkDeleteModal.title", {
                  count: selectedIds.length,
                })}
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                {t("manageExclusions.bulkDeleteModal.description")}
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setBulkDeleteModal(false)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageExclusions.bulkDeleteModal.cancel")}
                </button>
                <button
                  onClick={handleDeleteMany}
                  disabled={bulkDeleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {bulkDeleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageExclusions.bulkDeleteModal.deleting")}
                    </>
                  ) : (
                    t("manageExclusions.bulkDeleteModal.delete", {
                      count: selectedIds.length,
                    })
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

export default ManageExclusions;
