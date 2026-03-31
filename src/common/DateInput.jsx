import React from "react";

const DateInput = ({
  label,
  name,
  data,
  errors,
  onChange,
  required,
  placeholder = "HH:MM",
}) => {
  const hasError = !!errors?.[name];
  const value = data?.[name] ?? "";

  return (
    <div className='flex flex-col gap-1.5 w-full group'>
      {label && (
        <label
          htmlFor={name}
          className='
            flex items-center gap-1.5
            text-[11px] font-bold uppercase tracking-[0.1em]
            text-gray-500 group-focus-within:text-amber-500
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
        {/* Clock icon */}
        <span
          className='
          absolute left-3.5 top-1/2 -translate-y-1/2
          text-gray-400 pointer-events-none
          group-focus-within:text-amber-500
          transition-colors duration-200
        '
        >
          <svg
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.8}
              d='M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z'
            />
          </svg>
        </span>

        <input
          id={name}
          name={name}
          type='date'
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`
            w-full rounded-lg text-sm
            bg-white text-gray-800
            pl-10 pr-4 py-3
            border outline-none
            transition-all duration-200
            [&::-webkit-calendar-picker-indicator]:opacity-0
            [&::-webkit-calendar-picker-indicator]:absolute
            ${
              hasError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50"
                : "border-gray-300 hover:border-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            }
          `}
        />
      </div>

      {hasError && (
        <p className='text-xs text-red-500 flex items-center gap-1.5 mt-0.5'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-500' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default DateInput;
