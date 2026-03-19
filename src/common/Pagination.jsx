import React from "react";
import { useTranslation } from "react-i18next";

const Pagination = ({
  itemsCount,
  pageNumber,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();

  const pageSizeOptions = [5, 10, 20, 30, 40, 50, 100, 200];
  const totalPages = Math.ceil(itemsCount / pageSize);
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, itemsCount);

  // ── Smart pagination with ellipsis ──────────────────────────
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, pageNumber - delta);
      i <= Math.min(totalPages - 1, pageNumber + delta);
      i++
    )
      range.push(i);

    if (pageNumber - delta > 2) rangeWithDots.push(1, "...");
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (pageNumber + delta < totalPages - 1)
      rangeWithDots.push("...", totalPages);
    else if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  };

  const visiblePages = getVisiblePages();

  // ── Page button ──────────────────────────────────────────────
  const PageBtn = ({ page, active, disabled, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold
        border transition-all duration-150 select-none
        ${
          active
            ? "bg-amber-400 text-amber-900 border-amber-400 shadow-md shadow-amber-200"
            : disabled
            ? "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
            : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div
      className='flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Results info ──────────────────────────────── */}
      <p className='text-xs text-stone-400 order-2 sm:order-1 whitespace-nowrap'>
        {t("Showing")}{" "}
        <span className='font-bold text-stone-600'>{startItem}</span>
        {" – "}
        <span className='font-bold text-stone-600'>{endItem}</span> {t("of")}{" "}
        <span className='font-bold text-stone-600'>{itemsCount}</span>{" "}
        {t("Results")}
      </p>

      {/* ── Pagination buttons ────────────────────────── */}
      {totalPages > 1 && (
        <div className='flex items-center gap-1.5 order-1 sm:order-2'>
          {/* First */}
          <PageBtn disabled={pageNumber === 1} onClick={() => onPageChange(1)}>
            <i className='fa fa-angle-double-left text-xs' />
          </PageBtn>

          {/* Prev */}
          <PageBtn
            disabled={pageNumber === 1}
            onClick={() => onPageChange(pageNumber - 1)}
          >
            <i className='fa fa-chevron-left text-xs' />
          </PageBtn>

          {/* Page numbers */}
          {visiblePages.map((page, i) =>
            page === "..." ? (
              <span
                key={`dots-${i}`}
                className='w-9 h-9 flex items-center justify-center text-stone-300 text-sm select-none'
              >
                ···
              </span>
            ) : (
              <PageBtn
                key={page}
                active={pageNumber === page}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PageBtn>
            )
          )}

          {/* Next */}
          <PageBtn
            disabled={pageNumber === totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
          >
            <i className='fa fa-chevron-right text-xs' />
          </PageBtn>

          {/* Last */}
          <PageBtn
            disabled={pageNumber === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <i className='fa fa-angle-double-right text-xs' />
          </PageBtn>
        </div>
      )}

      {/* ── Page size selector ────────────────────────── */}
      <div className='flex items-center gap-2 order-3 whitespace-nowrap'>
        <span className='text-xs text-stone-400'>{t("Per page")}:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className='text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl px-2.5 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all cursor-pointer'
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
