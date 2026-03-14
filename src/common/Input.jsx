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
  return (
    <div className='flex flex-col gap-1 w-full'>
      {label && (
        <label htmlFor={name} className='text-sm font-medium text-base-content'>
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}
      <div className='relative'>
        {icon && (
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 text-sm'>
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={data?.[name] ?? selected ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            input input-bordered w-full text-sm
            ${icon ? "pl-9" : ""}
            ${errors?.[name] ? "input-error" : ""}
          `}
        />
      </div>
      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default Input;
