import React, { useState, useEffect, useRef, useCallback } from "react";
import { promoSlides } from "./promoSlides";
import PromoSlide from "./PromoSlide";
import PromoNavigation from "./PromoNavigation";

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayTimer = useRef(null);

  const totalSlides = promoSlides.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay Effect
  useEffect(() => {
    if (isPaused) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    } else {
      autoplayTimer.current = setInterval(handleNext, 6000);
    }
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [isPaused, handleNext]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // minimum swipe distance in pixels
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative max-w-[1500px] mx-auto my-lg h-[640px] lg:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#004782] to-[#086b53] shadow-xl group focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 outline-none transition-all duration-300"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {promoSlides.map((slide, idx) => (
          <PromoSlide
            key={slide.id}
            slide={slide}
            isActive={idx === currentSlide}
          />
        ))}
      </div>

      {/* Navigation Layer */}
      <PromoNavigation
        total={totalSlides}
        current={currentSlide}
        onPrev={handlePrev}
        onNext={handleNext}
        onDotClick={(idx) => setCurrentSlide(idx)}
      />
    </section>
  );
};

export default PromoCarousel;
