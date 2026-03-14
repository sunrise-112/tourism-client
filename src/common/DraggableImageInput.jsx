import React, { useRef, useState } from "react";

const DraggableImageInput = ({
  label,
  name,
  data,
  errors,
  onChange,
  required,
  maxFiles = 10,
  placeholder = "Drag & drop images or click to browse",
}) => {
  const inputRef = useRef(null);
  const existingUrls = data?.[name];
  const [previews, setPreviews] = useState(
    Array.isArray(existingUrls)
      ? existingUrls.map((url) => ({
          url: typeof url === "string" ? url : URL.createObjectURL(url),
          file: typeof url === "string" ? null : url,
        }))
      : []
  );
  const [dragging, setDragging] = useState(false);

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    const remaining = maxFiles - previews.length;
    const toAdd = valid.slice(0, remaining).map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    const updated = [...previews, ...toAdd];
    setPreviews(updated);
    onChange({
      target: {
        name,
        value: updated.map((p) => p.file).filter(Boolean),
        files: updated.map((p) => p.file).filter(Boolean),
      },
    });
  };

  const handleRemove = (index, e) => {
    e.stopPropagation();
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange({
      target: {
        name,
        value: updated.map((p) => p.file).filter(Boolean),
        files: updated.map((p) => p.file).filter(Boolean),
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
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
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => previews.length < maxFiles && inputRef.current.click()}
        className={`
          w-full min-h-32 rounded-xl border-2 border-dashed p-3 transition-all duration-200 cursor-pointer
          ${
            dragging
              ? "border-accent bg-accent/10 scale-[1.01]"
              : "border-base-300 hover:border-accent bg-base-200/40"
          }
          ${errors?.[name] ? "border-error" : ""}
        `}
      >
        {previews.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-24 gap-2 text-base-content/40'>
            <i className='fas fa-cloud-upload-alt text-3xl' />
            <p className='text-sm font-medium'>{placeholder}</p>
            <p className='text-xs'>Up to {maxFiles} images — PNG, JPG, WEBP</p>
          </div>
        ) : (
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
            {previews.map((p, i) => (
              <div
                key={i}
                className='relative group aspect-square rounded-lg overflow-hidden border border-base-300'
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={p.url}
                  alt={`img-${i}`}
                  className='w-full h-full object-cover'
                />
                <button
                  type='button'
                  onClick={(e) => handleRemove(i, e)}
                  className='absolute top-1 right-1 w-5 h-5 btn btn-error btn-xs rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0 min-h-0'
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.length < maxFiles && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current.click();
                }}
                className='aspect-square rounded-lg border-2 border-dashed border-base-300
                  flex items-center justify-center text-base-content/40
                  hover:border-accent hover:text-accent transition-colors'
              >
                <span className='text-2xl leading-none'>+</span>
              </div>
            )}
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <p className='text-xs text-base-content/40'>
          {previews.length} / {maxFiles} images
        </p>
      )}

      <input
        ref={inputRef}
        type='file'
        name={name}
        accept='image/jpeg,image/png,image/webp'
        multiple
        onChange={(e) => addFiles(e.target.files)}
        className='hidden'
      />

      {errors?.[name] && <p className='text-xs text-error'>{errors[name]}</p>}
    </div>
  );
};

export default DraggableImageInput;
