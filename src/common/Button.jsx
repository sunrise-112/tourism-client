import React from "react";

const Button = ({ label, name, disabled, isSubmitting, icon, type }) => {
  return (
    <button
      name={name}
      disabled={disabled || isSubmitting}
      type={type}
      className='
      w-full
        relative inline-flex items-center justify-center gap-2.5
        px-7 py-3 min-w-[160px]
        bg-amber-500 text-white hover:bg-amber-400
        disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed font-bold text-sm tracking-wide uppercase
        rounded-lg
        shadow-[0_0_0_1px_rgba(251,191,36,0.3),0_4px_16px_rgba(251,191,36,0.2)]
        hover:shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_4px_24px_rgba(251,191,36,0.35)]
        disabled:shadow-none
        transition-all duration-200
        active:scale-[0.97]
        overflow-hidden
        group
        cursor-pointer
      '
    >
      {/* Shimmer effect */}
      <span
        className='
        absolute inset-0 -translate-x-full
        bg-gradient-to-r from-transparent to-transparent
        group-hover:translate-x-full transition-transform duration-500
        pointer-events-none
      '
      />

      {icon && <span className='text-base leading-none'>{icon}</span>}

      <span className='relative flex items-center gap-2'>
        {isSubmitting && (
          <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8v8H4z'
            />
          </svg>
        )}
        {isSubmitting ? "Processing…" : label}
      </span>
    </button>
  );
};

export default Button;
