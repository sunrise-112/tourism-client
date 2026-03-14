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
          <span className='absolute left-3 top-3 text-base-content/50 text-sm'>
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
            textarea textarea-bordered w-full text-sm resize-y
            ${icon ? "pl-9" : ""}
            ${errors?.[name] ? "textarea-error" : ""}
          `}
        />
      </div>
      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default TextArea;
