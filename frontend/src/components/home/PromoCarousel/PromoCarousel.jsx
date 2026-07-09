import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import local promotional banner assets
import deliveryImg from "../../../assets/PromoCarousel/delivery.png";
import savingImg from "../../../assets/PromoCarousel/saving.png";
import surgicalImg from "../../../assets/PromoCarousel/surgical.png";
import cancerImg from "../../../assets/PromoCarousel/cancer.png";

const promoBanners = [
  {
    id: "surgical",
    img: surgicalImg,
    alt: "Surgical Promo Banner"
  },
  {
    id: "cancer",
    img: cancerImg,
    alt: "Cancer Care Promo Banner"
  },
  {
    id: "delivery",
    img: deliveryImg,
    alt: "WellMeds Express 3-Hour Emergency Delivery with certified cold-chain bags in Pune, Hinjawadi and PCMC"
  },
  {
    id: "saving",
    img: savingImg,
    alt: "Affordable Healthcare: Direct-from-Manufacturer pricing delivering up to 85% savings on chronic care therapies"
  }
];

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = promoBanners.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay effect - 5 seconds interval
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <div className="w-full my-md">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotional Banners"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="promo-banner-container focus-visible:ring-2 focus-visible:ring-[#038076] outline-none"
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="promo-nav-btn promo-nav-btn-left"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNext}
          className="promo-nav-btn promo-nav-btn-right"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slides Track */}
        <div
          className="promo-slider-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {promoBanners.map((banner) => (
            <div key={banner.id} className="promo-slide">
              <img
                src={banner.img}
                alt={banner.alt}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover object-center block"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Elegant Dot Indicators */}
      <div className="promo-dots-container">
        {promoBanners.map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`promo-dot ${isActive ? "promo-dot-active" : ""}`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          );
        })}
      </div>

      <style>{`
        /* ── Promo Banner Shell ── */
        .promo-banner-container {
          width: 100%;
          max-width: 1400px;
          height: 480px;                          /* default desktop banner height */
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          background: #ffffff;
          box-sizing: border-box;
        }

        /* ── Slider Track ── */
        .promo-slider-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .promo-slide {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          overflow: hidden;
        }

        /* ── Premium Navigation Arrows ── */
        .promo-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;
          cursor: pointer;
          z-index: 20;
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          visibility: hidden;
          outline: none;
        }

        .promo-banner-container:hover .promo-nav-btn {
          opacity: 1;
          visibility: visible;
        }

        .promo-nav-btn:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 8px 25px rgba(3, 128, 118, 0.16);
          color: #038076;
        }

        .promo-nav-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        .promo-nav-btn-left {
          left: 20px;
        }

        .promo-nav-btn-right {
          right: 20px;
        }

        /* ── Dots Indicators ── */
        .promo-dots-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }

        .promo-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          outline: none;
        }

        .promo-dot:hover {
          background: #94a3b8;
        }

        .promo-dot-active {
          width: 24px;
          background: linear-gradient(135deg, #038076 0%, #086b53 100%);
          box-shadow: 0 2px 8px rgba(3, 128, 118, 0.25);
        }

        /* ── Responsive Scaling ── */
        @media (max-width: 1024px) {
          .promo-banner-container {
            height: 380px;                        /* tablet height scaling */
          }
        }

        @media (max-width: 640px) {
          .promo-banner-container {
            aspect-ratio: 16 / 9;                 /* maintain proportional aspect ratio on mobile */
            height: auto;
            border-radius: 18px;
          }
          .promo-nav-btn {
            width: 42px;
            height: 42px;
            opacity: 0.85;
            visibility: visible;
          }
          .promo-nav-btn-left {
            left: 12px;
          }
          .promo-nav-btn-right {
            right: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default PromoCarousel;
