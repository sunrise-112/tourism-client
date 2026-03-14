import React from "react";
import _ from "lodash";

const CardsTable = ({ items, columns = [] }) => {
  const renderCard = (item, column) => {
    if (column.content) return column.content(item);
    return _.get(item, column.path);
  };

  if (!items || items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 bg-base-200 rounded-2xl border-2 border-dashed border-base-300'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-20 w-20 text-base-content/20 mb-4'
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
        <h3 className='text-xl font-semibold text-base-content/60 mb-2'>
          No Items Found
        </h3>
        <p className='text-base-content/40 text-sm'>
          There are no items to display at this time.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:hidden gap-5 mt-2 mb-10'>
      {items?.map((item, itemIndex) => (
        <div
          className='card bg-linear-to-br from-base-100 to-base-100 shadow-lg border border-base-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden'
          key={item?.id || itemIndex}
        >
          {/* Decorative Top Border */}
          <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>

          {/* Decorative Background Pattern */}
          <div className='absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300'>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            ></div>
          </div>

          <div className='card-body p-0 relative z-10'>
            {/* Card Header */}
            <div className='p-6 pb-4 border-b border-base-300/50'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  {columns[0] && (
                    <h3 className='text-xl font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2'>
                      {renderCard(item, columns[0])}
                    </h3>
                  )}
                </div>
                {/* Card Menu/Actions */}
                <div className='dropdown dropdown-end ml-2'>
                  <label
                    tabIndex={0}
                    className='btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                      />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className='dropdown-content z-1 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300'
                  >
                    <li>
                      <a>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>{" "}
                        View
                      </a>
                    </li>
                    <li>
                      <a>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>{" "}
                        Edit
                      </a>
                    </li>
                    <li>
                      <a className='text-error'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>{" "}
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className='p-6 pt-4 space-y-2'>
              {columns?.slice(1)?.map((column, index) => {
                const value = renderCard(item, column);

                // Skip if no value
                if (!value && value !== 0 && value !== false) return null;

                return (
                  <div
                    key={index}
                    className='flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-all duration-200 group/item'
                  >
                    {/* Icon placeholder - you can customize per column type */}
                    <div className='mt-0.5 opacity-50 group-hover/item:opacity-100 transition-opacity'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-primary'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>

                    <div className='flex-1 min-w-0'>
                      {column.label && (
                        <label className='block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1'>
                          {column.label}
                        </label>
                      )}
                      <div className='text-sm font-medium text-base-content wrap-break-words'>
                        {value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer - Optional */}
            <div className='px-6 pb-6 pt-2 flex items-center justify-between text-xs text-base-content/50'>
              <span className='flex items-center gap-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                Item #{item?.id || itemIndex + 1}
              </span>
              <div className='flex gap-1'>
                <div className='w-2 h-2 rounded-full bg-success'></div>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none'>
            <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default CardsTable;
