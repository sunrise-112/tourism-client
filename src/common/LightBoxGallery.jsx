// ============================================
// NEW COMPONENT: LightboxGallery with zoom & carousel

import { useEffect, useState } from "react";
import renderImage from "../utils/renderImage";

// ============================================
export const LightboxGallery = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState(null);

  const currentImage = images[currentIndex];
  const total = images.length;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setZoom(1); // reset zoom on navigation
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setZoom(1);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setZoom(1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, zoom]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStart(null);
  };

  if (!images.length) return null;

  return (
    <div
      className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-6xl h-full max-h-[90vh] bg-black/40 rounded-2xl overflow-hidden flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with counter & controls */}
        <div className='absolute top-4 right-4 left-4 z-10 flex items-center justify-between gap-2'>
          <div className='bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-medium'>
            {currentIndex + 1} / {total}
          </div>
          <div className='flex gap-2'>
            <button
              onClick={zoomOut}
              className='w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition'
              title='Zoom Out (-)'
            >
              <i className='fa fa-search-minus text-sm' />
            </button>
            <button
              onClick={resetZoom}
              className='w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition text-xs font-bold'
              title='Reset Zoom (0)'
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className='w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition'
              title='Zoom In (+)'
            >
              <i className='fa fa-search-plus text-sm' />
            </button>
            <button
              onClick={onClose}
              className='w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition'
              title='Close (Esc)'
            >
              <i className='fa fa-times' />
            </button>
          </div>
        </div>

        {/* Image container with scroll on zoom */}
        <div
          className='flex-1 overflow-auto flex items-center justify-center p-4'
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className='flex items-center justify-center min-w-full min-h-full'>
            <img
              src={renderImage(currentImage)}
              alt={`Gallery ${currentIndex + 1}`}
              className='transition-transform duration-200 ease-out rounded-lg shadow-2xl'
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                maxWidth: zoom === 1 ? "90%" : "none",
                maxHeight: zoom === 1 ? "90%" : "none",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Navigation arrows (desktop) */}
        {total > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition'
            >
              <i className='fa fa-chevron-left' />
            </button>
            <button
              onClick={nextImage}
              className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center transition'
            >
              <i className='fa fa-chevron-right' />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// then inside TourDetail component, replace the old lightbox state and JSX:

// Replace: const [lightbox, setLightbox] = useState(null);
// with:

// Then in the gallery button onClick, change from setLightbox(img) to:

// Finally, replace the old lightbox JSX at the bottom of component with:
