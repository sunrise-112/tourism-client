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
    <div className='flex flex-col gap-1 w-full' ref={ref}>
      {label && (
        <label className='text-sm font-medium text-base-content'>{label}</label>
      )}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          select select-bordered w-full flex items-center justify-between cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${errors?.[name] ? "select-error" : ""}
          ${open ? "select-accent" : ""}
        `}
      >
        <span
          className={`text-sm ${
            !selected ? "text-base-content/40" : "text-base-content"
          }`}
        >
          {selected ? selected[labelKey] : placeholder}
        </span>
        <div className='flex items-center gap-1 ml-auto'>
          {allowClear && value && (
            <span
              onClick={handleClear}
              className='text-base-content/40 hover:text-base-content text-xs px-1'
            >
              ✕
            </span>
          )}
          <span className='text-base-content/40 text-xs'>
            {open ? "▲" : "▼"}
          </span>
        </div>
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
          {filtered.length === 0 ? (
            <p className='text-sm text-base-content/40 px-4 py-3'>
              No options found
            </p>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt[valueKey]}
                onClick={() => handleSelect(opt)}
                className={`
                  px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-base-200
                  ${
                    String(opt[valueKey]) === String(value)
                      ? "text-accent font-medium bg-base-200"
                      : "text-base-content"
                  }
                `}
              >
                {opt[labelKey]}
              </div>
            ))
          )}
        </div>
      )}

      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default Select;
