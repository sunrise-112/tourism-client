import React, { useEffect, useRef, useState } from "react";
import renderImage from "../utils/renderImage";

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
  console.log("existing url: ", existingUrl)
  const [preview, setPreview] = useState(
    typeof existingUrl === "string" ? existingUrl : null
  );
  const hasError = !!errors?.[name];

  useEffect(() => {
    if (typeof existingUrl === "string" && existingUrl !== preview) {
      setPreview(existingUrl);
    }
  }, [existingUrl]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(file);
    onChange({ target: { name, value: file, files: e.target.files } });
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    inputRef.current.value = "";
    onChange({ target: { name, value: null, files: null } });
  };

  return (
    <div className='flex flex-col gap-1.5 w-full'>
      {label && (
        <label className='text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400'>
          {label}
          {required && <span className='text-amber-500 ml-1'>*</span>}
        </label>
      )}

      <div
        onClick={() => !preview && inputRef.current.click()}
        className={`
          relative w-full h-48 rounded-xl border-2 border-dashed
          flex items-center justify-center overflow-hidden
          transition-all duration-200
          ${
            preview
              ? "border-transparent cursor-default"
              : hasError
              ? "border-red-500/50 bg-red-500/5 cursor-pointer"
              : "border-zinc-700 hover:border-amber-500/50 bg-white-900 cursor-pointer hover:bg-white-800/50"
          }
        `}
      >
        {preview ? (
          <>
            <img
              src={renderImage(preview)}
              alt='thumbnail'
              className='w-full h-full object-cover'
            />
            {/* Hover overlay */}
            <div
              className='
              absolute inset-0
              bg-white-950/70 backdrop-blur-[2px]
              opacity-0 hover:opacity-100
              transition-opacity duration-200
              flex items-center justify-center gap-3
            '
            >
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current.click();
                }}
                className='
                  flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                  bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600
                  transition-colors duration-150
                '
              >
                <svg
                  className='w-3.5 h-3.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                  />
                </svg>
                Replace
              </button>
              <button
                type='button'
                onClick={handleRemove}
                className='
                  flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                  bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30
                  transition-colors duration-150
                '
              >
                <svg
                  className='w-3.5 h-3.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center gap-3 text-zinc-600'>
            <div className='w-12 h-12 rounded-xl bg-white-800 border flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-zinc-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-zinc-400'>{placeholder}</p>
              <p className='text-xs text-zinc-600 mt-1'>
                PNG, JPG, WEBP · max 5MB
              </p>
            </div>
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

      {hasError && (
        <p className='text-xs text-red-400 flex items-center gap-1.5 mt-0.5'>
          <span className='inline-block w-1 h-1 rounded-full bg-red-400' />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
