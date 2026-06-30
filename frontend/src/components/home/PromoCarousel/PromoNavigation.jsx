import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PromoNavigation = ({ total, current, onPrev, onNext, onDotClick }) => {
  return (
    <>
      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        className="absolute left-4 lg:left-8 xl:left-[calc(50%-660px)] top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/35 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 text-white hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95 cursor-pointer outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 lg:right-8 xl:right-[calc(50%-660px)] top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/35 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 text-white hidden md:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95 cursor-pointer outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-sm">
        {Array.from({ length: total }).map((_, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={idx}
              onClick={() => onDotClick(idx)}
              className={`h-2 rounded-full transition-all duration-300 outline-none cursor-pointer ${
                isActive 
                  ? "w-6 bg-white shadow" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </>
  );
};

export default PromoNavigation;
