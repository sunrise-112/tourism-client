import React from "react";

const TableHeader = ({
  columns,
  onSort,
  sortColumn,
  onSelectAll,
  selectAll,
}) => {
  const renderSortIcon = (column) => {
    if (!column.path || column.path !== sortColumn?.path) {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-3.5 w-3.5 opacity-30'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 16V4m0 0L3 8m4-4l4 4m6 8v-4m0 4l4-4m-4 4l-4-4'
          />
        </svg>
      );
    }
    return sortColumn.order === "asc" ? (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-3.5 w-3.5 text-accent'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M5 15l7-7 7 7'
        />
      </svg>
    ) : (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-3.5 w-3.5 text-accent'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M19 9l-7 7-7-7'
        />
      </svg>
    );
  };

  return (
    <thead>
      <tr className='bg-base-200/70 border-b border-base-300'>
        {onSelectAll && (
          <th className='w-12 px-4 py-3'>
            <input
              type='checkbox'
              checked={selectAll}
              onChange={onSelectAll}
              className='checkbox checkbox-sm checkbox-accent'
            />
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={column.path || column.key || index}
            onClick={() => column.path && onSort?.(column)}
            className={`
              px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider
              whitespace-nowrap select-none
              ${
                column.path && onSort
                  ? "cursor-pointer hover:text-accent hover:bg-base-200 transition-colors"
                  : ""
              }
            `}
          >
            <div className='flex items-center gap-1.5'>
              {column.label}
              {column.path && onSort && renderSortIcon(column)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
