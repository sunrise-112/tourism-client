import React from "react";

const Input = ({
  label,
  name,
  data,
  errors,
  onChange,
  type = "text",
  selected,
  icon,
  required,
  placeholder,
}) => {
  const hasError = !!errors?.[name];
  const value = data?.[name] ?? selected ?? "";

  return (
    <div className='flex flex-col gap-1.5 w-full group'>
      {label && (
        <label
          htmlFor={name}
          className='text-xs font-semibold uppercase tracking-widest text-base-content/50 transition-colors group-focus-within:text-amber-500'
        >
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        {/* Left icon */}
        {icon && (
          <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 text-sm pointer-events-none transition-colors group-focus-within:text-amber-500'>
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-xl border bg-base-100 text-sm text-base-content
            px-4 py-3 outline-none transition-all duration-200
            placeholder:text-base-content/25
            ${icon ? "pl-10" : ""}
            ${
              hasError
                ? "border-error/60 focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-base-content/10 hover:border-base-content/20 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15"
            }
          `}
        />

        {/* Right error indicator */}
        {hasError && (
          <span className='absolute right-3.5 top-1/2 -translate-y-1/2 text-error'>
            <svg width='15' height='15' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p className='text-xs text-error flex items-center gap-1'>
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default Input;
