import React, { useEffect, useRef, useState, useCallback } from "react";
import renderImage from "../utils/renderImage";

/**
 * Each preview item shape:
 * { id: string, url: string, file: File | null, isExisting: boolean }
 *
 * - isExisting: true  → came from server (url is a path string)
 * - isExisting: false → newly selected by user (url is a blob URL)
 */

let _id = 0;
const uid = () => `img_${++_id}`;

const toPreview = (url) => ({
  id: uid(),
  url: typeof url === "string" ? url : URL.createObjectURL(url),
  file: typeof url === "string" ? null : url,
  isExisting: typeof url === "string",
});

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
  const hasError = !!errors?.[name];
  const isFull = false; // computed below after state

  // ─── State ────────────────────────────────────────────────────────────────
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ─── Emit helper ──────────────────────────────────────────────────────────
  // Always called after any state change so useForm stays in sync
  const emit = useCallback(
    (updatedPreviews) => {
      onChange({
        target: {
          name,
          // value: mix of File (new) and string url (existing)
          value: updatedPreviews.map((p) => (p.isExisting ? p.url : p.file)),
          files: updatedPreviews.map((p) => p.file).filter(Boolean),
        },
      });
    },
    [name, onChange]
  );

  // ─── Sync existing URLs from data (async load) ────────────────────────────
  useEffect(() => {
    const existingUrls = data?.[name];
    if (initialized) return; // don't overwrite user edits
    if (!Array.isArray(existingUrls) || existingUrls.length === 0) return;

    const mapped = existingUrls.map(toPreview);
    setPreviews(mapped);
    setInitialized(true);
    emit(mapped);
  }, [data?.[name]]); // eslint-disable-line
  const handleRemove = useCallback(
    (id, e) => {
      e.stopPropagation();
      // ✅ Calculate updated array first
      const updated = previews.filter((p) => p.id !== id);
      // ✅ Then update local state and emit separately — never inside setPreviews
      setPreviews(updated);
      emit(updated);
    },
    [previews, emit]
  );

  const addFiles = useCallback(
    (files) => {
      const valid = Array.from(files).filter((f) =>
        ["image/jpeg", "image/png", "image/webp"].includes(f.type)
      );
      const remaining = maxFiles - previews.length;
      const toAdd = valid.slice(0, remaining).map((file) => ({
        id: uid(),
        url: URL.createObjectURL(file), // ✅ must be this, not the file object itself
        file,
        isExisting: false,
      })); // ✅ Same — compute first, then call both separately
      const updated = [...previews, ...toAdd];
      setPreviews(updated);
      emit(updated);
    },
    [previews, maxFiles, emit]
  );
  // ─── Drag events ─────────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e) => {
    // Only fire when leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const full = previews.length >= maxFiles;

  return (
    <div className='flex flex-col gap-1.5 w-full'>
      {/* Label + counter */}
      {label && (
        <div className='flex items-center justify-between'>
          <label className='text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400'>
            {label}
            {required && <span className='text-amber-500 ml-1'>*</span>}
          </label>
          <span
            className={`text-[11px] font-medium tabular-nums transition-colors ${
              full ? "text-amber-500" : "text-zinc-500"
            }`}
          >
            {previews.length} / {maxFiles}
          </span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !full && inputRef.current?.click()}
        className={[
          "w-full min-h-48 rounded-xl border-2 border-dashed p-3 transition-all duration-200",
          full ? "cursor-default" : "cursor-pointer",
          dragging
            ? "border-amber-500 bg-amber-500/5 scale-[1.005]"
            : hasError
            ? "border-red-500/50 bg-red-500/5"
            : full
            ? "border-zinc-700"
            : "border-zinc-700 hover:border-amber-500/40 hover:bg-zinc-800/30",
        ].join(" ")}
      >
        {previews.length === 0 ? (
          // ── Empty state ──
          <div className='flex flex-col items-center justify-center h-36 gap-3 select-none'>
            <div className='w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center'>
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
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-zinc-400'>{placeholder}</p>
              <p className='text-xs text-zinc-600 mt-1'>
                Up to {maxFiles} images · PNG, JPG, WEBP
              </p>
            </div>
          </div>
        ) : (
          // ── Grid ──
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
            {previews.map((p, i) => (
              <div
                key={p.id}
                className='relative group aspect-square rounded-lg overflow-hidden border border-zinc-700'
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={i + 1}
                  src={p.isExisting ? renderImage(p.url) : p.url}
                  alt={`preview-${i + 1}`}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.target.style.opacity = 0.3;
                  }}
                />

                {/* Existing badge */}
                {p.isExisting && (
                  <span className='absolute top-1.5 left-1.5 bg-zinc-900/80 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider'>
                    Saved
                  </span>
                )}

                {/* Hover overlay */}
                <div className='absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150' />

                {/* Remove button */}
                <button
                  type='button'
                  onClick={(e) => handleRemove(p.id, e)}
                  className='absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-md'
                >
                  ✕
                </button>

                {/* Index */}
                <span className='absolute bottom-1.5 left-1.5 bg-zinc-950/80 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                  {i + 1}
                </span>
              </div>
            ))}

            {/* Add more tile */}
            {!full && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className='aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-600 hover:border-amber-500/50 hover:text-amber-500/70 transition-colors duration-150 cursor-pointer'
              >
                <span className='text-xl leading-none font-light'>+</span>
                <span className='text-[9px] font-bold uppercase tracking-wider'>
                  Add
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag hint */}
      {previews.length > 0 && !full && (
        <p className='text-[11px] text-zinc-600 text-center'>
          Drop more images anywhere above
        </p>
      )}

      <input
        ref={inputRef}
        type='file'
        name={name}
        accept='image/jpeg,image/png,image/webp'
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
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

export default DraggableImageInput;
