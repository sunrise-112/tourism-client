import React from "react";

const ColorInput = ({
  label,
  name,
  data,
  errors,
  onChange,
  required,
  placeholder,
}) => {
  const value = data?.[name] ?? "#000000";

  return (
    <div className='flex flex-col gap-1 w-full'>
      {label && (
        <label htmlFor={name} className='text-sm font-medium text-base-content'>
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}
      <div className='flex items-center gap-3 input input-bordered w-full px-3'>
        <input
          id={name}
          name={name}
          type='color'
          value={value}
          onChange={onChange}
          className='w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0'
        />
        <input
          type='text'
          value={value}
          onChange={(e) =>
            onChange({ target: { name, value: e.target.value } })
          }
          placeholder={placeholder ?? "#000000"}
          className='flex-1 text-sm bg-transparent outline-none text-base-content'
        />
      </div>
      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default ColorInput;
