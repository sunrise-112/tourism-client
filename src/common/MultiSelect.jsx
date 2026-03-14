import React, { useState, useRef, useEffect } from "react";

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
  const ref = useRef(null);

  const value = data?.[name] ?? [];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const toggle = (optValue) => {
    const isSelected = value.includes(optValue);
    if (!isSelected && maxSelected && value.length >= maxSelected) return;
    const updated = isSelected
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange({ target: { name, value: updated } });
  };

  const remove = (optValue, e) => {
    e.stopPropagation();
    toggle(optValue);
  };

  const selectedOptions = options.filter((o) => value.includes(o[valueKey]));

  return (
    <div className='flex flex-col gap-1 w-full' ref={ref}>
      {label && (
        <label className='text-sm font-medium text-base-content'>{label}</label>
      )}

      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          min-h-11 w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100
          flex flex-wrap gap-1.5 items-center cursor-pointer transition-colors
          hover:border-accent
          ${open ? "border-accent ring-1 ring-accent" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${errors?.[name] ? "border-error" : ""}
        `}
      >
        {selectedOptions.length === 0 && (
          <span className='text-sm text-base-content/40'>{placeholder}</span>
        )}
        {selectedOptions.map((opt) => (
          <span
            key={opt[valueKey]}
            className='badge badge-accent gap-1 text-xs font-medium'
          >
            {opt[labelKey]}
            <button
              type='button'
              onClick={(e) => remove(opt[valueKey], e)}
              className='hover:opacity-70'
            >
              ✕
            </button>
          </span>
        ))}
        <span className='ml-auto text-base-content/40 text-xs pl-1'>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div className='border border-base-300 rounded-xl bg-base-100 shadow-lg z-50 max-h-52 overflow-y-auto'>
          {searchable && (
            <div className='p-2 border-b border-base-200'>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search...'
                className='input input-sm input-bordered w-full'
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {maxSelected && (
            <p className='text-xs text-base-content/40 px-4 pt-2'>
              {value.length}/{maxSelected} selected
            </p>
          )}
          {filtered.map((opt) => {
            const isSelected = value.includes(opt[valueKey]);
            const isDisabled =
              !isSelected && maxSelected && value.length >= maxSelected;
            return (
              <div
                key={opt[valueKey]}
                onClick={() => !isDisabled && toggle(opt[valueKey])}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-base-200"
                  }
                `}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                    ${
                      isSelected ? "bg-accent border-accent" : "border-base-300"
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className='w-2.5 h-2.5 text-accent-content'
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
                    isSelected ? "text-accent font-medium" : "text-base-content"
                  }
                >
                  {opt[labelKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default MultiSelect;
