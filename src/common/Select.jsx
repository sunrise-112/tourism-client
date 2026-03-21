import React, { useState, useRef, useEffect } from "react";

const Select = ({
  label,
  name,
  data,
  errors,
  onChange,
  options = [],
  labelKey = "label",
  valueKey = "value",
  onSelect,
  placeholder = "Select an option",
  searchable = false,
  disabled = false,
  allowClear = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const value = data?.[name] ?? "";
  const selected = options.find((o) => String(o[valueKey]) === String(value));
  const hasError = !!errors?.[name];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = searchable
    ? options.filter((o) =>
        String(o[labelKey]).toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt[valueKey] } });
    onSelect?.(opt);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: "" } });
    onSelect?.(null);
  };

  return (
    <div className='flex flex-col gap-1.5 w-full' ref={ref}>
      {label && (
        <label className='text-[11px] font-bold uppercase tracking-[0.1em]'>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          relative w-full flex items-center justify-between
          px-4 py-3 rounded-lg text-sm
          border cursor-pointer
          transition-all duration-200 select-none
          ${disabled ? "opacity-40 cursor-not-allowed" : ""}
          ${
            hasError
              ? "bg-red-500/5 border-red-500/60"
              : open
              ? "bg-white-900 border-amber-500/70 ring-2 ring-amber-500/10"
              : "bg-white-900 border-white-700/60 hover:border-zinc-600"
          }
        `}
      >
        <span className={`${!selected ? "text-zinc-600" : ""}`}>
          {selected ? selected[labelKey] : placeholder}
        </span>

        <div className='flex items-center gap-2 ml-2'>
          {allowClear && value && (
            <span
              onClick={handleClear}
              className='text-zinc-500 hover:text-zinc-300 text-xs transition-colors'
            >
              ✕
            </span>
          )}
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
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
        <div
          className='
          relative z-50
          border border-zinc-700 rounded-xl
          bg-white-900 shadow-[0_8px_32px_rgba(0,0,0,0.5)]
          overflow-hidden
          animate-in fade-in slide-in-from-top-1 duration-150
        '
        >
          {searchable && (
            <div className='p-2 border-b border-zinc-800'>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search…'
                autoFocus
                className='
                  w-full px-3 py-2 text-sm rounded-lg
                  bg-white-800 border border-zinc-700
                  text-zinc-100 placeholder:text-zinc-600
                  outline-none focus:border-amber-500/60
                '
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className='max-h-52 overflow-y-auto'>
            {filtered.length === 0 ? (
              <p className='text-sm text-zinc-500 px-4 py-3 text-center'>
                No options found
              </p>
            ) : (
              filtered.map((opt) => {
                const isActive = String(opt[valueKey]) === String(value);
                return (
                  <div
                    key={opt[valueKey]}
                    onClick={() => handleSelect(opt)}
                    className={`
                      px-4 py-2.5 text-sm cursor-pointer
                      flex items-center justify-between
                      transition-colors duration-100
                      ${
                        isActive
                          ? "bg-amber-500/10 text-amber-400"
                          : " hover:bg-white-800"
                      }
                    `}
                  >
                    {opt[labelKey]}
                    {isActive && (
                      <svg
                        className='w-3.5 h-3.5 text-amber-400'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {hasError && (
        <p className='text-xs text-red-400 flex items-center gap-1.5 mt-0.5'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-400' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default Select;
