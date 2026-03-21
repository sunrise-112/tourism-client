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
          className='
            flex items-center gap-1.5
            text-[11px] font-bold uppercase tracking-[0.1em]
            text-zinc-400 group-focus-within:text-amber-400
            transition-colors duration-200
          '
        >
          {label}
          {required && (
            <span className='text-amber-500 text-base leading-none'>*</span>
          )}
        </label>
      )}

      <div className='relative'>
        {icon && (
          <span
            className='
            absolute left-3.5 top-1/2 -translate-y-1/2
            text-zinc-500 text-sm pointer-events-none
            group-focus-within:text-amber-400
            transition-colors duration-200
          '
          >
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
            w-full rounded-lg text-sm
            bg-white-900 
            px-4 py-3
            border
            outline-none
            placeholder:text-zinc-600
            transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${
              hasError
                ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 bg-red-500/5"
                : "border-zinc-700/60 hover:border-zinc-600 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/10"
            }
          `}
        />

        {hasError && (
          <span className='absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400'>
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

      {hasError && (
        <p className='text-xs text-red-400 flex items-center gap-1.5 mt-0.5'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-400' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default Input;
