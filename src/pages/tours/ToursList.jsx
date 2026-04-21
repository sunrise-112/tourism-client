import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Services
import tourService from "../../services/tourService";
import categoryService from "../../services/categoryService";

// Components
import TourCardGrid from "../../components/tours/TourCardGrid";
import TourCardList from "../../components/tours/TourCardList";
import { SkeletonGrid, SkeletonList } from "../../components/tours/skeleton";
import { categoryKeyMap } from "../../utils/CategoriesMap";

// ─── Constants ────────────────────────────────────────────────
const CATEGORIES = [
  "Adventure",
  "Beach",
  "Cultural",
  "Wildlife",
  "City",
  "Wellness",
  "Desert",
  "Trekking",
  "Coastal",
  "Culinary",
  "Historical",
];

const SORT_OPTIONS = [
  { labelKey: "tourList.sort.newest", value: "created_at:desc" },
  { labelKey: "tourList.sort.priceLow", value: "price:asc" },
  { labelKey: "tourList.sort.priceHigh", value: "price:desc" },
  { labelKey: "tourList.sort.duration", value: "duration_days:asc" },
];

const TourList = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [layout, setLayout] = useState("grid"); // "grid" | "list"

  // Filters derived from URL params
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    is_featured: searchParams.get("is_featured") || "",
    is_hot_deal: searchParams.get("is_hot_deal") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    sort: searchParams.get("sort") || "created_at:desc",
    page: Number(searchParams.get("page")) || 1,
  });

  const LIMIT = 9;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryService.getAll({
          is_active: true,
          limit: 50,
        });
        setCategories(categories?.data);
        console.log("Categories: ", categories);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = filters.sort.split(":");
      const params = {
        ...(filters.q && { q: filters.q }),
        ...(filters.category && { category: filters.category }),
        ...(filters.is_featured && { is_featured: true }),
        ...(filters.is_hot_deal && { is_hot_deal: true }),
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
        sort_by: sortBy,
        sort_order: sortOrder,
        page: filters.page,
        limit: LIMIT,
      };
      const res = await tourService.getAll(params);
      setTours(res?.data?.tours || res?.data || []);
      setTotal(res?.data?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Sync filters → URL
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    setSearchParams(params, { replace: true });
  }, [filters]);

  // ── Helpers ────────────────────────────────────────────────
  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const clearFilters = () =>
    setFilters({
      q: "",
      category: "",
      is_featured: "",
      is_hot_deal: "",
      min_price: "",
      max_price: "",
      sort: "created_at:desc",
      page: 1,
    });

  const totalPages = Math.ceil(total / LIMIT);

  const activeFilterCount = [
    filters.q,
    filters.category,
    filters.is_featured,
    filters.is_hot_deal,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length;

  const translatedCategories = categories?.map((cat) => ({
    ...cat,
    label: t(`home.categories.${categoryKeyMap[cat?.name] ?? cat?.name}`),
  }));

  return (
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page Header ──────────────────────────────────── */}
      <div className='bg-white border-b border-stone-100'>
        <div className='max-w-7xl mx-auto px-6 py-10'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2'>
            {t("tourList.header.eyebrow")}
          </p>
          <h1
            className='text-4xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("tourList.header.title")}
          </h1>
          <p className='text-stone-400 text-sm mt-1'>
            {loading
              ? t("tourList.header.loading")
              : t("tourList.header.toursAvailable", { count: total })}
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8'>
        {/* ── Sidebar Filters ───────────────────────────── */}
        <aside className='w-full lg:w-64 shrink-0 space-y-6'>
          {/* Search */}
          <div className='bg-white rounded-2xl border border-stone-100 p-5'>
            <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
              {t("tourList.filters.search")}
            </p>
            <div className='relative'>
              <i className='fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs' />
              <input
                type='text'
                value={filters.q}
                onChange={(e) => setFilter("q", e.target.value)}
                placeholder={t("tourList.filters.searchPlaceholder")}
                className='w-full pl-8 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
              />
            </div>
          </div>

          {/* Category */}
          <div className='bg-white rounded-2xl border border-stone-100 p-5'>
            <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
              {t("tourList.filters.category")}
            </p>
            <div className='space-y-1'>
              <button
                onClick={() => setFilter("category", "")}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                  !filters.category
                    ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {t("tourList.filters.allCategories")}
              </button>
              {translatedCategories.map((cat) => (
                <button
                  key={cat?.id}
                  onClick={() =>
                    setFilter(
                      "category",
                      filters.category === cat.id ? "" : cat.id
                    )
                  }
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                    filters.category === cat?.id
                      ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  {/*  {t(`tourList.categories.${cat?.name.toLowerCase()}`, {
                    defaultValue: cat,
                  })} */}
                  {cat?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className='bg-white rounded-2xl border border-stone-100 p-5'>
            <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
              {t("tourList.filters.priceRange")}
            </p>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={filters.min_price}
                onChange={(e) => setFilter("min_price", e.target.value)}
                placeholder={t("tourList.filters.minPlaceholder")}
                className='w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 transition-all placeholder-stone-300 text-stone-700'
              />
              <span className='text-stone-300 text-xs'>—</span>
              <input
                type='number'
                value={filters.max_price}
                onChange={(e) => setFilter("max_price", e.target.value)}
                placeholder={t("tourList.filters.maxPlaceholder")}
                className='w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 transition-all placeholder-stone-300 text-stone-700'
              />
            </div>
          </div>

          {/* Badges */}
          <div className='bg-white rounded-2xl border border-stone-100 p-5'>
            <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
              {t("tourList.filters.filterBy")}
            </p>
            <div className='space-y-2'>
              <button
                onClick={() =>
                  setFilter("is_featured", filters.is_featured ? "" : "true")
                }
                className={`w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-xl border transition-colors ${
                  filters.is_featured
                    ? "bg-amber-50 border-amber-200 text-amber-700 font-semibold"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                }`}
              >
                <i className='fa fa-star text-amber-400 text-xs' />{" "}
                {t("tourList.filters.featured")}
              </button>
              <button
                onClick={() =>
                  setFilter("is_hot_deal", filters.is_hot_deal ? "" : "true")
                }
                className={`w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-xl border transition-colors ${
                  filters.is_hot_deal
                    ? "bg-red-50 border-red-200 text-red-600 font-semibold"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                }`}
              >
                <i className='fa fa-fire text-red-400 text-xs' />{" "}
                {t("tourList.filters.hotDeals")}
              </button>
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className='w-full text-sm text-stone-400 hover:text-red-500 border border-stone-200 hover:border-red-200 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2'
            >
              <i className='fa fa-times text-xs' />
              {t("tourList.filters.clear", { count: activeFilterCount })}
            </button>
          )}
        </aside>

        {/* ── Main Content ──────────────────────────────── */}
        <div className='flex-1 min-w-0'>
          {/* Toolbar */}
          <div className='flex items-center justify-between mb-6 gap-4 flex-wrap'>
            <p className='text-sm text-stone-400'>
              {loading
                ? t("tourList.toolbar.searching")
                : t("tourList.toolbar.showing", {
                    shown: tours.length,
                    total: total,
                  })}
            </p>
            <div className='flex items-center gap-3'>
              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className='text-sm bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 transition-all text-stone-600'
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>

              {/* Layout toggle */}
              <div className='flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden'>
                <button
                  onClick={() => setLayout("grid")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    layout === "grid"
                      ? "bg-amber-50 text-amber-600"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <i className='fa fa-th' />
                </button>
                <div className='w-px h-5 bg-stone-200' />
                <button
                  onClick={() => setLayout("list")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    layout === "list"
                      ? "bg-amber-50 text-amber-600"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <i className='fa fa-list' />
                </button>
              </div>
            </div>
          </div>

          {/* Tours */}
          {loading ? (
            <div
              className={
                layout === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {[...Array(LIMIT)].map((_, i) =>
                layout === "grid" ? (
                  <SkeletonGrid key={i} />
                ) : (
                  <SkeletonList key={i} />
                )
              )}
            </div>
          ) : tours.length === 0 ? (
            <div className='text-center py-24 text-stone-300'>
              <i className='fa fa-map-marked-alt text-5xl mb-4 block' />
              <p className='text-stone-400 font-medium mb-1'>
                {t("tourList.empty.title")}
              </p>
              <p className='text-sm text-stone-300'>
                {t("tourList.empty.subtitle")}
              </p>
              <button
                onClick={clearFilters}
                className='mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold'
              >
                {t("tourList.empty.clearButton")}
              </button>
            </div>
          ) : (
            <div
              className={
                layout === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {tours.map((tour) =>
                layout === "grid" ? (
                  <TourCardGrid key={tour.id} tour={tour} />
                ) : (
                  <TourCardList key={tour.id} tour={tour} />
                )
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-12'>
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className='w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white'
              >
                <i className='fa fa-chevron-left text-xs' />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (
                  totalPages > 7 &&
                  Math.abs(p - filters.page) > 2 &&
                  p !== 1 &&
                  p !== totalPages
                ) {
                  if (p === 2 || p === totalPages - 1)
                    return (
                      <span key={p} className='text-stone-300 text-sm'>
                        …
                      </span>
                    );
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-colors ${
                      filters.page === p
                        ? "bg-amber-400 text-amber-900 border-amber-400"
                        : "bg-white border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-600"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className='w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white'
              >
                <i className='fa fa-chevron-right text-xs' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourList;
