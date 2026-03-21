import React from "react";

const TextArea = ({
  label,
  name,
  data,
  errors,
  onChange,
  selected,
  icon,
  required,
  placeholder,
  rows = 4,
}) => {
  const hasError = !!errors?.[name];

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
          <span className='absolute left-3.5 top-3.5 text-zinc-500 text-sm pointer-events-none group-focus-within:text-amber-400 transition-colors duration-200'>
            {icon}
          </span>
        )}

        <textarea
          id={name}
          name={name}
          value={data?.[name] ?? selected ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`
            w-full rounded-lg text-sm
            bg-white-900 
            px-4 py-3
            border
            outline-none resize-y
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

export default TextArea;
