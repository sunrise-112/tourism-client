import React from "react";

const ToggleSwitcher = ({
  label,
  name,
  data,
  errors,
  onChange,
  icon,
  selected,
  description,
  bg_color
}) => {
  const hasError = !!(errors && errors[name]);
  const isChecked = data[name] === true || data[name] === "true";

  return (
    <div
      className={`
      w-full transition-all duration-200
      ${hasError ? "opacity-90" : ""}
    `}
    >
      <label
        htmlFor={name}
        className='flex items-center justify-between gap-4 cursor-pointer group'
      >
        {/* Left: icon + text */}
        <div className='flex items-center gap-3 min-w-0'>
          {icon && (
            <div
              className={`
              w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0
              transition-all duration-300
              ${
                hasError
                  ? "bg-red-500/10 text-red-400"
                  : isChecked
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white-800 text-zinc-500 group-hover:text-zinc-400"
              }
            `}
            >
              {icon}
            </div>
          )}
          <div className='min-w-0'>
            <p
              className={`
              text-sm font-semibold truncate transition-colors duration-200
            `}
            >
              {label}
            </p>
            {description && (
              <p className='text-xs text-zinc-600 mt-0.5 truncate'>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: toggle */}
        <div className='relative flex-shrink-0'>
          <input
            type='checkbox'
            id={name}
            name={name}
            checked={isChecked}
            onChange={onChange}
            className='sr-only peer'
          />

          {/* Track */}
          <div
            className={`
            w-[52px] h-7 rounded-full
            flex items-center
            transition-all duration-300 ease-out
            border
            ${
              hasError
                ? "bg-red-500/20 border-red-500/40"
                : isChecked
                ? `${bg_color} border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]`
                : "bg-white-800 border-zinc-700 group-hover:border-zinc-600"
            }
          `}
          >
            {/* Labels inside track */}
            <span
              className={`
              absolute left-2 text-[9px] font-black uppercase tracking-wider
              transition-all duration-300 pointer-events-none
            `}
            >
              Yes
            </span>
            <span
              className={`
              absolute right-2 text-[9px] font-black uppercase tracking-wider
              transition-all duration-300 pointer-events-none
            `}
            >
              No
            </span>

            {/* Thumb */}
            <div
              className={`
              absolute top-[3px] w-[22px] h-[22px] rounded-full
              shadow-[0_1px_4px_rgba(0,0,0,0.4)]
              transition-all duration-300 ease-out
              ${
                isChecked
                  ? "translate-x-[26px] bg-zinc-900"
                  : "translate-x-[3px] bg-zinc-400"
              }
            `}
            />
          </div>
        </div>
      </label>

      {hasError && (
        <p className='text-xs text-red-400 flex items-center gap-1.5 mt-2 ml-1'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-400' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default ToggleSwitcher;
