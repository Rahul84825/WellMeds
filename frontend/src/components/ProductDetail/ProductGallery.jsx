import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../Loader";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";

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

  const maxThumbnails = 4;
  const visibleThumbnails = imagesList.slice(0, maxThumbnails);
  const showRemainingOverlay = imagesList.length > maxThumbnails;

  return (
    <div className="w-full flex flex-col items-center select-none relative group/gallery-main">
      {/* Tape Accent */}
      <div className="pdp-rx-tape" aria-hidden="true" />

      {/* Main Image Container (Prescription Paper Frame) */}
      <div 
        className="w-full aspect-square pdp-paper-card overflow-hidden relative cursor-zoom-in flex items-center justify-center p-6 transition-all duration-300"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFullscreenOpen(true)}
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 z-10 bg-[#b08d3e] text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
            SAVE {discountPercent}%
          </span>
        )}

        {isImageLoading && (
          <div className="absolute inset-0 bg-[#f4f8f6] animate-pulse flex items-center justify-center rounded-xl z-10">
            <Loader size="sm" />
          </div>
        )}
        
        {/* Main Product Image */}
        <img 
          src={imagesList[activeImageIdx] || DEFAULT_PRODUCT_IMAGE} 
          alt={productName} 
          loading="eager"
          fetchpriority="high"
          className="w-auto h-auto max-w-[90%] max-h-[90%] object-contain select-none transition-transform duration-[250ms] ease-in-out hover:scale-105" 
          onLoad={() => setIsImageLoading(false)}
          onError={(e) => {
            setIsImageLoading(false);
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
        />
        
        {/* Navigation Arrows */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                handlePrev(); 
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#172b26] w-9 h-9 rounded-full border border-[#c3d4cc] shadow-md z-10 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover/gallery-main:opacity-100 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft size={18} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleNext(); 
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#172b26] w-9 h-9 rounded-full border border-[#c3d4cc] shadow-md z-10 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover/gallery-main:opacity-100 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight size={18} className="stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails below main image */}
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
                className={`relative w-14 h-14 rounded-lg bg-white border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer overflow-hidden ${
                  activeImageIdx === idx && !(isLastThumbnail && showRemainingOverlay)
                    ? "border-[#157a6d] scale-[1.03] shadow-xs" 
                    : "border-[#dde8e3] hover:border-[#c3d4cc]"
                }`}
                aria-label={`View thumbnail ${idx + 1}`}
              >
                <img src={img} alt="" loading="lazy" className="max-h-full max-w-full object-contain p-1" />
                
                {isLastThumbnail && showRemainingOverlay && (
                  <div className="absolute inset-0 bg-[#172b26]/75 flex items-center justify-center text-white font-mono font-bold text-xs">
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
