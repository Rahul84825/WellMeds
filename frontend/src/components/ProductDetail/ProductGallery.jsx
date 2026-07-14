import React, { useRef } from "react";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../Loader";

const ProductGallery = ({
  imagesList,
  activeImageIdx,
  setActiveImageIdx,
  isImageLoading,
  setIsImageLoading,
  handleMouseMove,
  handleMouseLeave,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  setIsFullscreenOpen,
  zoomStyle,
  discountPercent,
  productName
}) => {
  const scrollRef = useRef(null);

  const handleNext = () => {
    setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrev = () => {
    setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <div className="w-full flex flex-col items-center select-none relative group/gallery-main">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs animate-bounce">
          {discountPercent}% OFF
        </span>
      )}

      {/* Main Image Container */}
      <div 
        className="w-full aspect-square rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden relative cursor-zoom-in flex items-center justify-center p-[24px] group/zoom"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFullscreenOpen(true)}
      >
        {isImageLoading && (
          <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-955 animate-pulse flex items-center justify-center rounded-2xl z-10">
            <Loader size="sm" />
          </div>
        )}
        <img 
          alt={productName} 
          className="w-auto h-auto max-w-[93%] max-h-[93%] object-contain transition-transform duration-[250ms] ease group-hover/zoom:scale-[1.03]" 
          src={imagesList[activeImageIdx]}
          onLoad={() => setIsImageLoading(false)}
        />
        
        {/* Fullscreen Trigger */}
        <button
          type="button"
          className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md text-slate-705 dark:text-slate-300 transition-colors z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreenOpen(true);
          }}
        >
          <Maximize2 size={14} />
        </button>

        {/* Hover zoom magnifying portal */}
        <div 
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-white dark:bg-zinc-900 hidden md:block opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-300" 
          style={{
            ...zoomStyle,
            backgroundSize: "220%"
          }}
        />

        {/* Navigation Arrows for slide selection */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-slate-800 dark:text-slate-200 p-1.5 rounded-full shadow-md z-10 transition-all opacity-0 group-hover/gallery-main:opacity-100 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-slate-800 dark:text-slate-200 p-1.5 rounded-full shadow-md z-10 transition-all opacity-0 group-hover/gallery-main:opacity-100 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {imagesList.length > 1 && (
        <div 
          ref={scrollRef}
          className="flex gap-sm overflow-x-auto mt-md pb-xs scrollbar-none snap-x snap-mandatory justify-center w-full"
        >
          {imagesList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIdx(idx)}
              className={`w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border-2 p-sm flex items-center justify-center shrink-0 transition-all snap-start cursor-pointer ${
                activeImageIdx === idx 
                  ? "border-[#004782] dark:border-primary-fixed-dim scale-[1.03] shadow-xs" 
                  : "border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              <img src={img} alt="" className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
