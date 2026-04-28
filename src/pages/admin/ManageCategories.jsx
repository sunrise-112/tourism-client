import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Services
import categoryService from "../../services/categoryService";

// Commons
import Pagination from "../../common/Pagination";

import Select from "react-select";
import { categoryKeyMap } from "../../utils/CategoriesMap";
import { useSearchParams } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

// ─── ManageCategories ─────────────────────────────────────────
const ManageCategories = ({ searchQuery }) => {
  const { t } = useTranslation();
  const [searchParam] = useSearchParams();
  const q = searchParam.get("q");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("All");
  const [trigger, setTrigger] = useState(false);

  // ── Modals / in-flight state
  const [deleteModal, setDeleteModal] = useState(null); // single row
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // ── Form modal (create / edit)
  const [formModal, setFormModal] = useState(null); // null | { mode: "create" | "edit", data?: category }
  const [formValue, setFormValue] = useState({
    name: "",
    icon: "",
    bg: "",
    is_active: true,
  });
  const [formSaving, setFormSaving] = useState(false);

  const FILTERS = ["All", "Active", "Inactive"];
  const ICONS = [
    // Core travel
    { label: "Adventure", value: "fa-solid fa-mountain" },
    { label: "Beach", value: "fa-solid fa-umbrella-beach" },
    { label: "City", value: "fa-solid fa-city" },
    { label: "Culture", value: "fa-solid fa-landmark" },

    // Morocco-specific highlights
    { label: "Desert", value: "fa-solid fa-sun" },
    { label: "Sahara Tour", value: "fa-solid fa-route" },
    { label: "Camel Trekking", value: "fa-solid fa-horse" }, // closest FA match
    { label: "Quad & Buggy", value: "fa-solid fa-motorcycle" },

    // Nature & activities
    { label: "Mountains & Hiking", value: "fa-solid fa-person-hiking" },
    { label: "Surfing", value: "fa-solid fa-water" },
    { label: "Wildlife", value: "fa-solid fa-paw" },

    // Experiences
    { label: "Food & Culinary", value: "fa-solid fa-utensils" },
    { label: "Medina Tours", value: "fa-solid fa-archway" },
    { label: "Historical Sites", value: "fa-solid fa-monument" },
    { label: "Photography", value: "fa-solid fa-camera" },

    // Comfort & services
    { label: "Luxury & Riads", value: "fa-solid fa-hotel" },
    { label: "Spa & Hammam", value: "fa-solid fa-spa" },
    { label: "Day Trips", value: "fa-solid fa-calendar-day" },
    { label: "Transport", value: "fa-solid fa-bus" },

    // Extras (good for marketing pages)
    { label: "Events & Festivals", value: "fa-solid fa-music" },
    { label: "Shopping", value: "fa-solid fa-bag-shopping" },
    { label: "Guided Tours", value: "fa-solid fa-user-group" },
  ];

  const options = ICONS.map((icon) => ({
    value: icon.value,
    label: icon.label,
  }));

  const selectedOption = options?.find((opt) => opt.value === formValue.icon);

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
      const res = await categoryService.getAll(params);
      setCategories(res?.data ?? []);
      setTotalItems(res?.pagination?.totalItems ?? 0);
    } catch {
      toast.error(t("manageCategories.errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, filter, trigger]);

  const translatedCategories = categories?.map((cat) => ({
    ...cat,
    label: t(`home.categories.${categoryKeyMap[cat?.name] ?? cat?.name}`),
  }));

  // ── Search
  useEffect(() => {
    if (!String(q || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await categoryService.getAll({ search: q });
        setCategories(res?.data ?? []);
        setTotalItems(res?.pagination?.totalItems ?? 0);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  // ─── Selection ────────────────────────────────────────────
  const allSelected =
    categories.length > 0 && selectedIds.length === categories.length;

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : categories.map((c) => c.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ─── Toggle active ────────────────────────────────────────
  const handleToggleActive = async (category) => {
    const original = [...categories];
    try {
      setTogglingId(category.id);
      await categoryService.update(category.id, {
        is_active: !category.is_active,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      toast.success(
        category.is_active
          ? t("manageCategories.toasts.deactivated")
          : t("manageCategories.toasts.activated")
      );
    } catch (err) {
      setCategories(original);
      toast.error(
        err?.response?.data?.message ||
          t("manageCategories.errors.updateFailed")
      );
    } finally {
      setTogglingId(null);
    }
  };

  /* // ─── Delete one ───────────────────────────────────────────
  const handleDeleteOne = async () => {
    try {
      setDeleting(true);
      await categoryService.deleteOne(deleteModal.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteModal.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success(t("manageCategories.toasts.deleteSuccess"));
      setDeleteModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t("manageCategories.errors.deleteFailed")
      );
    } finally {
      setDeleting(false);
    }
  };

  // ─── Delete many ──────────────────────────────────────────
  const handleDeleteMany = async () => {
    try {
      setBulkDeleting(true);
      await categoryService.deleteMany(selectedIds);
      setCategories((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setTotalItems((n) => n - selectedIds.length);
      setSelectedIds([]);
      setBulkDeleteModal(false);
      toast.success(t("manageCategories.toasts.bulkDeleteSuccess"));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t("manageCategories.errors.bulkDeleteFailed")
      );
    } finally {
      setBulkDeleting(false);
    }
  }; */

  // ─── Form (create / edit) ─────────────────────────────────
  const openCreate = () => {
    setFormValue({ name: "", is_active: true });
    setFormModal({ mode: "create" });
  };

  const openEdit = (category) => {
    setFormValue({
      name: category.name,
      bg: category.bg,
      icon: category.icon,
      is_active: category.is_active,
    });
    setFormModal({ mode: "edit", data: category });
  };

  const handleFormSave = async () => {
    if (!formValue.name.trim())
      return toast.error(t("manageCategories.errors.nameRequired"));
    try {
      setFormSaving(true);
      if (formModal.mode === "create") {
        const created = await categoryService.create(formValue);
        setCategories((prev) => [created, ...prev]);
        setTotalItems((n) => n + 1);
        toast.success(t("manageCategories.toasts.createSuccess"));
      } else {
        const updated = await categoryService.update(
          formModal.data.id,
          formValue
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success(t("manageCategories.toasts.updateSuccess"));
      }
      setFormModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("manageCategories.errors.saveFailed")
      );
    } finally {
      setFormSaving(false);
    }
  };

  // ─── Derived stats ────────────────────────────────────────
  const activeCount = categories.filter((c) => c.is_active).length;
  const inactiveCount = categories.filter((c) => !c.is_active).length;

  // Helper for filter translation
  const getFilterLabel = (filterKey) => {
    switch (filterKey) {
      case "All":
        return t("manageCategories.filters.all");
      case "Active":
        return t("manageCategories.filters.active");
      case "Inactive":
        return t("manageCategories.filters.inactive");
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
            {t("manageCategories.admin")}
          </p>
          <h1
            className='text-3xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("manageCategories.title")}
          </h1>
          <p className='text-stone-400 text-sm mt-1'>
            {t("manageCategories.totalCategories", { count: totalItems })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors shadow-sm'
        >
          <i className='fa fa-plus text-xs' />
          {t("manageCategories.newCategory")}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
        {[
          {
            icon: "fa-tags",
            label: t("manageCategories.stats.total"),
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-check-circle",
            label: t("manageCategories.stats.active"),
            value: activeCount,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-ban",
            label: t("manageCategories.stats.inactive"),
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
            {t("manageCategories.bulkDeleteButton", {
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
      ) : categories.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-tags text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>
            {t("manageCategories.empty.title")}
          </p>
          <p className='text-sm text-stone-400'>
            {t("manageCategories.empty.description")}
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  {/* Checkbox */}
                  <th className='px-4 py-3.5 w-10'>
                    <input
                      type='checkbox'
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className='w-4 h-4 rounded accent-amber-500 cursor-pointer'
                    />
                  </th>
                  {[
                    "#",
                    t("manageCategories.table.name"),
                    t("manageCategories.table.status"),
                    t("manageCategories.table.created"),
                    t("manageCategories.table.actions"),
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
                {translatedCategories.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-stone-50 transition-colors ${
                      selectedIds.includes(c.id) ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className='px-4 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
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
                        {c.label}
                      </p>
                    </td>
                    {/* Status */}
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.is_active ? "bg-emerald-400" : "bg-stone-400"
                          }`}
                        />
                        {c.is_active
                          ? t("manageCategories.status.active")
                          : t("manageCategories.status.inactive")}
                      </span>
                    </td>
                    {/* Date */}
                    <td className='px-4 py-4 text-xs text-stone-400 whitespace-nowrap'>
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString(
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
                          onClick={() => handleToggleActive(c)}
                          disabled={togglingId === c.id}
                          title={
                            c.is_active
                              ? t("manageCategories.tooltips.deactivate")
                              : t("manageCategories.tooltips.activate")
                          }
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-60 ${
                            c.is_active
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-500"
                          }`}
                        >
                          {togglingId === c.id ? (
                            <i className='fa fa-spinner fa-spin text-xs' />
                          ) : (
                            <i
                              className={`fa text-xs ${
                                c.is_active ? "fa-toggle-on" : "fa-toggle-off"
                              }`}
                            />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(c)}
                          title={t("manageCategories.tooltips.edit")}
                          className='w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors'
                        >
                          <i className='fa fa-pencil text-xs' />
                        </button>
                        {/* Delete */}
                        {/*                         <button
                          onClick={() => setDeleteModal(c)}
                          title={t("manageCategories.tooltips.delete")}
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-trash text-xs' />
                        </button> */}
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
                  ? t("manageCategories.modal.createTitle")
                  : t("manageCategories.modal.editTitle")}
              </h3>

              {/* Name */}
              <label className='block mb-4'>
                <span className='text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block'>
                  {t("manageCategories.modal.nameLabel")}
                </span>
                <input
                  type='text'
                  value={formValue?.name}
                  onChange={(e) =>
                    setFormValue((v) => ({ ...v, name: e.target.value }))
                  }
                  placeholder={t("manageCategories.modal.namePlaceholder")}
                  maxLength={300}
                  className='w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300'
                />
              </label>

              {/* Color */}
              <label className='block mb-4'>
                <span className='text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block'>
                  color
                </span>
                <label className='w-20 h-10 rounded-full overflow-hidden cursor-pointer border border-stone-300 flex items-center justify-center'>
                  <input
                    type='color'
                    value={formValue.bg}
                    onChange={(e) =>
                      setFormValue((v) => ({ ...v, bg: e.target.value }))
                    }
                    className='w-full h-full opacity-1 cursor-pointer'
                  />
                  <div
                    className='absolute w-16 h-6 rounded-full'
                    style={{ background: formValue.bg }}
                  />
                </label>
              </label>

              {/* ICONS */}
              <Select
                options={options}
                value={selectedOption} // 👈 sets the initial/default value
                onChange={(option) => {
                  setFormValue((v) => ({
                    ...v,
                    icon: option.value,
                  }));
                }}
                menuPortalTarget={document.body}
                menuPosition='fixed'
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                formatOptionLabel={(option) => (
                  <div className='flex items-center gap-2'>
                    <i className={option.value}></i>
                    <span>{option.label}</span>
                  </div>
                )}
              />
              <br />
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
                    ? t("manageCategories.status.active")
                    : t("manageCategories.status.inactive")}
                </span>
              </label>

              <div className='flex gap-3'>
                <button
                  onClick={() => setFormModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageCategories.modal.cancel")}
                </button>
                <button
                  onClick={handleFormSave}
                  disabled={formSaving}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors'
                >
                  {formSaving ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageCategories.modal.saving")}
                    </>
                  ) : formModal.mode === "create" ? (
                    t("manageCategories.modal.create")
                  ) : (
                    t("manageCategories.modal.saveChanges")
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
                {t("manageCategories.deleteModal.title")}
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                {t("manageCategories.deleteModal.description", {
                  name: deleteModal.name,
                })}
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageCategories.deleteModal.cancel")}
                </button>
                <button
                  onClick={handleDeleteOne}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {deleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageCategories.deleteModal.deleting")}
                    </>
                  ) : (
                    t("manageCategories.deleteModal.delete")
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
                {t("manageCategories.bulkDeleteModal.title", {
                  count: selectedIds.length,
                })}
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                {t("manageCategories.bulkDeleteModal.description")}
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setBulkDeleteModal(false)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  {t("manageCategories.bulkDeleteModal.cancel")}
                </button>
                <button
                  onClick={handleDeleteMany}
                  disabled={bulkDeleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {bulkDeleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      {t("manageCategories.bulkDeleteModal.deleting")}
                    </>
                  ) : (
                    t("manageCategories.bulkDeleteModal.delete", {
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

export default ManageCategories;
