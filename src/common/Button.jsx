import React from "react";

const Button = ({ label, name, disabled, isSubmitting, icon, type }) => {
  return (
    <button
      name={name}
      disabled={disabled || isSubmitting}
      type={type}
      className='btn bg-accent font-bold w-50 h-11 flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
    >
      {icon && <span className='text-lg'>{icon}</span>}
      <span className='font-medium flex items-center gap-2'>
        {isSubmitting && <i className='fas fa-spinner fa-spin'></i>}
        {isSubmitting ? "Processing.." : label}
      </span>
    </button>
  );
};

export default Button;
