import React, { useRef, useState } from "react";

const ImageUpload = ({
  label,
  name,
  data,
  errors,
  onChange,
  required,
  placeholder = "Click to upload thumbnail",
}) => {
  const inputRef = useRef(null);
  const existingUrl = data?.[name];
  const [preview, setPreview] = useState(
    typeof existingUrl === "string" ? existingUrl : null
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange({ target: { name, value: file, files: e.target.files } });
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    inputRef.current.value = "";
    onChange({ target: { name, value: null, files: null } });
  };

  return (
    <div className='flex flex-col gap-1 w-full'>
      {label && (
        <label className='text-sm font-medium text-base-content'>
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}

      <div
        onClick={() => !preview && inputRef.current.click()}
        className={`
          relative w-full h-44 rounded-xl border-2 border-dashed flex items-center justify-center
          overflow-hidden transition-all duration-200
          ${
            preview
              ? "border-transparent cursor-default"
              : "border-base-300 hover:border-accent cursor-pointer bg-base-200/50"
          }
          ${errors?.[name] ? "border-error" : ""}
        `}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt='thumbnail'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
              <button
                type='button'
                onClick={() => inputRef.current.click()}
                className='btn btn-sm btn-ghost text-white border border-white/40 hover:bg-white/10'
              >
                Replace
              </button>
              <button
                type='button'
                onClick={handleRemove}
                className='btn btn-sm btn-error'
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 text-base-content/40'>
            <i className='fas fa-image text-3xl' />
            <p className='text-sm font-medium'>{placeholder}</p>
            <p className='text-xs'>PNG, JPG, WEBP — max 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type='file'
        name={name}
        accept='image/jpeg,image/png,image/webp'
        onChange={handleChange}
        className='hidden'
      />

      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default ImageUpload;
