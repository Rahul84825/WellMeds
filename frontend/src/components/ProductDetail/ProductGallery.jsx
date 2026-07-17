import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../Loader";

const ProductGallery = ({
  imagesList,
  activeImageIdx,
  setActiveImageIdx,
  isImageLoading,
  setIsImageLoading,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  setIsFullscreenOpen,
  discountPercent,
  productName
}) => {
  const scrollRef = useRef(null);

  const handleNext = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrev = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  // Thumbnail rendering logic: cap at 4, show +N count on the 4th if there's more
  const maxThumbnails = 4;
  const visibleThumbnails = imagesList.slice(0, maxThumbnails);
  const showRemainingOverlay = imagesList.length > maxThumbnails;

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
        className="w-[95%] aspect-square rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden relative cursor-zoom-in flex items-center justify-center p-[20px] shadow-sm border border-slate-100 dark:border-zinc-800/40 transition-shadow duration-200 hover:shadow-md"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFullscreenOpen(true)}
      >
        {isImageLoading && (
          <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-955 animate-pulse flex items-center justify-center rounded-3xl z-10">
            <Loader size="sm" />
          </div>
        )}
        
        {/* Main Product Image (Hero) */}
        <img 
          src={imagesList[activeImageIdx]} 
          alt={productName} 
          loading="eager"
          fetchpriority="high"
          className="w-auto h-auto max-w-[92%] max-h-[92%] object-contain select-none transition-transform duration-[250ms] ease-in-out" 
          onLoad={() => setIsImageLoading(false)}
        />
        
        {/* Navigation Arrows for slide selection */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                handlePrev(); 
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-slate-800 dark:text-slate-200 w-10 h-10 rounded-full shadow-md z-10 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover/gallery-main:opacity-100 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleNext(); 
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-slate-800 dark:text-slate-200 w-10 h-10 rounded-full shadow-md z-10 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover/gallery-main:opacity-100 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Simplified Thumbnails centered below the image */}
      {imagesList.length > 1 && (
        <div 
          ref={scrollRef}
          className="flex gap-3 justify-center w-full mt-4 pb-1 overflow-x-auto scrollbar-none"
        >
          {visibleThumbnails.map((img, idx) => {
            const isLastThumbnail = idx === maxThumbnails - 1;
            const remainingCount = imagesList.length - (maxThumbnails - 1);
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isLastThumbnail && showRemainingOverlay) {
                    setIsFullscreenOpen(true);
                  } else {
                    setActiveImageIdx(idx);
                  }
                }}
                className={`relative w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer overflow-hidden ${
                  activeImageIdx === idx && !(isLastThumbnail && showRemainingOverlay)
                    ? "border-[#038076] dark:border-primary-fixed-dim scale-[1.03] shadow-xs" 
                    : "border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-750"
                }`}
                aria-label={`View thumbnail ${idx + 1}`}
              >
                <img src={img} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                
                {/* +N Counter Overlay for remaining images */}
                {isLastThumbnail && showRemainingOverlay && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs transition-colors hover:bg-black/50">
                    +{remainingCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
