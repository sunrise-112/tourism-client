import React, { useState, useRef, useEffect, useCallback } from "react";

const MultiSelect = ({
  label,
  name,
  data,
  errors,
  onChange,
  options = [],
  labelKey = "label",
  valueKey = "value",
  placeholder = "Select options",
  searchable = false,
  disabled = false,
  maxSelected,
  autoSelectAll = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const ref = useRef(null);

  const value = data?.[name] ?? [];
  const hasError = !!errors?.[name];
  const selectedOptions = options.filter((o) => value.includes(o[valueKey]));
  const isMaxed = maxSelected && value.length >= maxSelected;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  useEffect(() => {
    if (autoSelectAll && options.length && value.length === 0) {
      onChange({ target: { name, value: options.map((o) => o[valueKey]) } });
    }
  }, [autoSelectAll, options]);

  const filtered = searchable
    ? options.filter((o) =>
        String(o[labelKey]).toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const toggle = useCallback(
    (optValue) => {
      const isSelected = value.includes(optValue);
      if (!isSelected && isMaxed) return;
      const updated = isSelected
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange({ target: { name, value: updated } });
    },
    [value, isMaxed, name, onChange]
  );

  const remove = (optValue, e) => {
    e.stopPropagation();
    toggle(optValue);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: [] } });
  };

  return (
    <div className='flex flex-col gap-1.5 w-full' ref={ref}>
      {/* Label row */}
      {label && (
        <div className='flex items-center justify-between'>
          <label className='text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500'>
            {label}
          </label>
          {selectedOptions.length > 0 && (
            <button
              type='button'
              onClick={clearAll}
              className='text-[11px] text-gray-400 hover:text-red-500 transition-colors duration-150 font-semibold'
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Trigger box */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          "min-h-11 w-full px-3 py-2 rounded-lg border bg-white",
          "flex flex-wrap gap-1.5 items-center cursor-pointer",
          "transition-all duration-200",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "",
          hasError
            ? "border-red-400 bg-red-50 ring-2 ring-red-100"
            : open
            ? "border-amber-400 ring-2 ring-amber-100"
            : "border-gray-300 hover:border-gray-400",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Placeholder */}
        {selectedOptions.length === 0 && (
          <span className='text-sm text-gray-400'>{placeholder}</span>
        )}

        {/* Selected tags */}
        {selectedOptions.map((opt) => (
          <span
            key={opt[valueKey]}
            className='inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-md'
          >
            {opt[labelKey]}
            <button
              type='button'
              onClick={(e) => remove(opt[valueKey], e)}
              className='text-amber-400 hover:text-amber-600 transition-colors ml-0.5 leading-none'
            >
              ✕
            </button>
          </span>
        ))}

        {/* Right: count + chevron */}
        <div className='ml-auto flex items-center gap-2 pl-2 flex-shrink-0'>
          {maxSelected && (
            <span
              className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                isMaxed ? "bg-amber-100 text-amber-600" : "text-gray-400"
              }`}
            >
              {value.length}/{maxSelected}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
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
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className='relative z-50 border border-gray-200 rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden'>
          {/* Search */}
          {searchable && (
            <div className='p-2 border-b border-gray-100'>
              <div className='relative'>
                <svg
                  className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  ref={searchRef}
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search…'
                  className='w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all'
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Stats + select all row */}
          <div className='flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100'>
            <span className='text-[11px] font-medium text-gray-400'>
              {filtered.length} option{filtered.length !== 1 ? "s" : ""}
              {selectedOptions.length > 0 && (
                <span className='ml-1.5 text-amber-600 font-semibold'>
                  · {selectedOptions.length} selected
                </span>
              )}
            </span>
            {!maxSelected && filtered.length > 0 && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  const allValues = filtered.map((o) => o[valueKey]);
                  const allSelected = allValues.every((v) => value.includes(v));
                  const updated = allSelected
                    ? value.filter((v) => !allValues.includes(v))
                    : [...new Set([...value, ...allValues])];
                  onChange({ target: { name, value: updated } });
                }}
                className='text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wide'
              >
                {filtered.every((o) => value.includes(o[valueKey]))
                  ? "Deselect all"
                  : "Select all"}
              </button>
            )}
          </div>

          {/* Options */}
          <div className='max-h-52 overflow-y-auto divide-y divide-gray-50'>
            {filtered.length === 0 ? (
              <div className='flex flex-col items-center py-6 gap-1'>
                <p className='text-sm text-gray-400 font-medium'>
                  No options found
                </p>
                {search && (
                  <p className='text-xs text-gray-300'>
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt[valueKey]);
                const isDisabled = !isSelected && isMaxed;

                return (
                  <div
                    key={opt[valueKey]}
                    onClick={() => !isDisabled && toggle(opt[valueKey])}
                    className={[
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100",
                      isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer",
                      isSelected
                        ? "bg-amber-50 hover:bg-amber-50"
                        : "hover:bg-gray-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* Checkbox */}
                    <span
                      className={[
                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150",
                        isSelected
                          ? "bg-amber-500 border-amber-500"
                          : "border-gray-300 bg-white",
                      ].join(" ")}
                    >
                      {isSelected && (
                        <svg
                          className='w-2.5 h-2.5 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      )}
                    </span>

                    <span
                      className={
                        isSelected
                          ? "text-amber-700 font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {opt[labelKey]}
                    </span>

                    {isSelected && (
                      <span className='ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0' />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <p className='text-xs text-red-500 flex items-center gap-1.5 mt-0.5'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-500' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
