import React from "react";
import _ from "lodash";

const TableBody = ({ items, columns }) => {
  const renderCell = (item, column) => {
    if (column.content) return column.content(item);
    return _.get(item, column.path);
  };

  if (!items || items.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className='text-center py-16'>
            <div className='flex flex-col items-center justify-center gap-3 text-base-content/30'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                />
              </svg>
              <p className='text-lg font-semibold'>No Items Found</p>
              <p className='text-sm'>
                There are no items to display at this time.
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {items.map((item, rowIndex) => (
        <tr
          key={item?.id || rowIndex}
          className='border-b border-base-200 hover:bg-base-200/40 transition-colors duration-150 group'
        >
          {columns.map((column, colIndex) => (
            <td
              key={column.path || column.key || colIndex}
              className='px-4 py-3 text-sm text-base-content whitespace-nowrap'
            >
              {renderCell(item, column)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
