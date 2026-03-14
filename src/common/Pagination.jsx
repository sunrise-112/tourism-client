import React from "react";
import _ from "lodash";
import { t } from "i18next";

const Pagination = ({
  itemsCount,
  pageNumber,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const pageSizeOptions = [5, 10, 20, 30, 40, 50, 100, 200];
  const totalPages = Math.ceil(itemsCount / pageSize);

  // Smart pagination - show limited pages with ellipsis
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, pageNumber - delta);
      i <= Math.min(totalPages - 1, pageNumber + delta);
      i++
    ) {
      range.push(i);
    }

    if (pageNumber - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pageNumber + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  };

  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, itemsCount);
  const visiblePages = getVisiblePages();

  return (
    <div className='bg-base-100 border-t border-base-300'>
      <div className='flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4'>
        {/* Items Info */}
        <div className='flex-1 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='text-sm text-base-content/70 order-2 sm:order-1'>
            {t("Showing")}{" "}
            <span className='font-semibold text-base-content'>{startItem}</span>{" "}
            {t("to")}{" "}
            <span className='font-semibold text-base-content'>{endItem}</span>{" "}
            {t("of")}{" "}
            <span className='font-semibold text-base-content'>
              {itemsCount}
            </span>{" "}
            {t("Results")}
          </div>

          {/* Pagination Controls */}
          <div className='order-1 sm:order-2'>
            {totalPages > 1 ? (
              <div className='join'>
                {/* Previous Button */}
                <button
                  className={`join-item btn btn-sm ${
                    pageNumber === 1
                      ? "btn-disabled"
                      : "btn-ghost hover:btn-accent"
                  }`}
                  onClick={() => pageNumber > 1 && onPageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  <i className='fa fa-chevron-left text-xs'></i>
                </button>

                {/* Page Numbers */}
                {visiblePages.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <button className='join-item btn btn-sm btn-disabled'>
                        ...
                      </button>
                    ) : (
                      <button
                        className={`join-item btn btn-sm ${
                          pageNumber === page
                            ? "btn-accent"
                            : "btn-ghost hover:btn-accent"
                        }`}
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                  className={`join-item btn btn-sm ${
                    pageNumber === totalPages
                      ? "btn-disabled"
                      : "btn-ghost hover:btn-accent"
                  }`}
                  onClick={() =>
                    pageNumber < totalPages && onPageChange(pageNumber + 1)
                  }
                  disabled={pageNumber === totalPages}
                >
                  <i className='fa fa-chevron-right text-xs'></i>
                </button>
              </div>
            ) : (
              // Maintain space when pagination is not visible
              <div className='h-8' />
            )}
          </div>
        </div>

        {/* Page Size Selector */}
        <div className='flex items-center gap-2'>
          <label className='text-sm text-base-content/70 whitespace-nowrap'>
            {t("Per page")}:
          </label>
          <select
            className='select select-bordered select-sm w-20 focus:select-accent'
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile-only quick navigation */}
      <div className='sm:hidden px-4'>
        <div className='flex items-center justify-center'>
          <button
            className={`btn btn-sm btn-circle ${
              pageNumber === 1 ? "btn-disabled" : "btn-ghost hover:btn-accent"
            }`}
            onClick={() => onPageChange(1)}
            disabled={pageNumber === 1}
          >
            <i className='fa fa-angle-double-left text-xs'></i>
          </button>

          <span className='text-sm text-base-content/70 mx-2'>
            Page {pageNumber} of {totalPages}
          </span>

          <button
            className={`btn btn-sm btn-circle ${
              pageNumber === totalPages
                ? "btn-disabled"
                : "btn-ghost hover:btn-accent"
            }`}
            onClick={() => onPageChange(totalPages)}
            disabled={pageNumber === totalPages}
          >
            <i className='fa fa-angle-double-right text-xs'></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
