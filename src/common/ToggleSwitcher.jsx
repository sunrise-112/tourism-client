import React, { useState } from "react";

export default ({
  label,
  name,
  data,
  errors,
  onChange,
  icon,
  selected,
  description,
}) => {
  const hasError = errors && errors[name];
  const isChecked = data[name] === true || data[name] === "true";

  return (
    <div className='form-control w-full mb-4 transition-all duration-300 ease-in-out'>
      <label
        htmlFor={name}
        className='label cursor-pointer justify-between py-3'
      >
        <div className='flex items-center gap-3'>
          {icon && (
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                hasError
                  ? "text-error bg-error/10"
                  : isChecked
                  ? "text-primary bg-primary/10"
                  : "text-base-content/40 bg-base-200"
              }`}
            >
              {icon}
            </div>
          )}
          <div className='flex-1'>
            <span className='font-semibold text-base-content'>{label}</span>
            {description && (
              <p className='text-sm text-base-content/60 mt-1'>{description}</p>
            )}
          </div>
        </div>

        <div className='relative'>
          <input
            type='checkbox'
            id={name}
            name={name}
            checked={isChecked}
            onChange={onChange}
            className='sr-only peer'
            autoFocus={selected}
          />
          <div
            className={`
              relative w-20 h-8 rounded-full transition-all duration-300 cursor-pointer flex items-center
              ${
                hasError
                  ? "bg-error/30"
                  : isChecked
                  ? "bg-primary"
                  : "bg-base-300"
              }
            `}
          >
            {/* Text labels */}
            <span
              className={`absolute left-5 text-xs font-semibold transition-opacity duration-300 ${
                isChecked ? "opacity-100 text-white" : "opacity-0"
              }`}
            >
              Yes
            </span>
            <span
              className={`absolute right-6 text-xs font-semibold transition-opacity duration-300 ${
                !isChecked ? "opacity-100 text-base-content/60" : "opacity-0"
              }`}
            >
              No
            </span>

            {/* Sliding dot */}
            <div
              className={`
                absolute top-1 w-6 h-6 rounded-full 
                bg-white shadow-md transition-transform duration-300
                ${isChecked ? "translate-x-12" : "translate-x-1"}
              `}
            ></div>
          </div>
        </div>
      </label>

      {hasError && (
        <label className='label pt-0'>
          <span className='label-text-alt text-error flex items-center gap-2'>
            <div className='w-4 h-4 flex items-center justify-center bg-error/10 rounded-full'>
              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            {errors[name]}
          </span>
        </label>
      )}
    </div>
  );
};
