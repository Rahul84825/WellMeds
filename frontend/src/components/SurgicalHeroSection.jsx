import React, { useState, useEffect, useRef, useCallback } from "react";

// Import generated surgical promotional banners
import appOfferBanner from "../assets/surgical/surgical_app_offer_banner_1786295951768.png";
import clinicalEquipmentBanner from "../assets/surgical/surgical_clinical_equipment_banner_1786296004097.png";
import homecareDressingsBanner from "../assets/surgical/surgical_homecare_dressings_banner_1786296072299.png";

const HERO_SLIDES = [
  {
    id: "app-offer",
    img: appOfferBanner,
    alt: "Get ₹100 OFF + 5% Cashback on 1st Surgical App Order - Code: APPNEW100",
    title: "App Exclusive Savings",
    subtitle: "Use code APPNEW100 for ₹100 off + 5% cashback"
  },
  {
    id: "clinical-equipment",
    img: clinicalEquipmentBanner,
    alt: "Clinical & Surgical Equipment Catalog - Up to 40% OFF on Institutional Orders",
    title: "Clinical Equipment",
    subtitle: "Certified surgical instruments & hospital monitors"
  },
  {
    id: "homecare-dressings",
    img: homecareDressingsBanner,
    alt: "Sterile Dressings & Diagnostic Essentials - 100% Guaranteed Genuine Brands",
    title: "Sterile Care & Diagnostics",
    subtitle: "Clinical-grade dressings, diagnostic tools & patient care"
  }
];

// Initial featured surgical brands placeholder slots (User can populate custom logo image URLs later)
const INITIAL_FEATURED_BRANDS = [
  { id: "olymed", name: "OLYMED", logoUrl: "", textStyle: "text-teal-600 font-extrabold tracking-tighter text-2xl md:text-3xl" },
  { id: "coloplast", name: "Coloplast", logoUrl: "", textStyle: "text-blue-700 font-bold tracking-normal text-xl md:text-2xl" },
  { id: "3m", name: "3M", logoUrl: "", textStyle: "text-red-600 font-black text-3xl md:text-4xl tracking-tighter" },
  { id: "dr-morepen", name: "Dr. Morepen", logoUrl: "", textStyle: "text-sky-600 font-bold italic text-xl md:text-2xl" },
  { id: "adlisc", name: "adlisc", logoUrl: "", textStyle: "text-indigo-600 font-extrabold text-2xl md:text-3xl tracking-tight" },
  { id: "friends", name: "FRIENDS", logoUrl: "", subtitle: "ADULT DIAPERS", textStyle: "text-emerald-700 font-black text-xl md:text-2xl" },
  { id: "flamingo", name: "flamingo", logoUrl: "", textStyle: "text-rose-800 font-serif font-bold italic text-2xl md:text-3xl" },
  { id: "romsons", name: "Romsons", logoUrl: "", textStyle: "text-blue-800 font-black text-xl md:text-2xl tracking-wide" }
];

const AUTOPLAY_DELAY_MS = 3200; // 3.2 seconds target range (3000ms - 3500ms)

/**
 * SurgicalHeroSection Component
 * Replaces hero section on /surgical page:
 * 1. PROMOTIONAL CAROUSEL:
 *    - 3.2s rotation, 600ms ease-in-out slide + fade, preloaded images, no layout shifts,
 *    - Autoplay pause on hover, timer reset on manual interaction.
 * 2. FEATURED BRANDS MARQUEE:
 *    - Continuous horizontal GPU-accelerated marquee (right -> left) at ~70px/sec.
 *    - Seamless infinite loop, desktop hover-to-pause, static header.
 */
const SurgicalHeroSection = ({ brands = INITIAL_FEATURED_BRANDS }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const totalSlides = HERO_SLIDES.length;

  // ── 1. PRELOAD ALL CAROUSEL BANNER IMAGES IMMEDIATELY ─────────────
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      if (slide.img) {
        const img = new Image();
        img.src = slide.img;
      }
    });
  }, []);

  // ── 2. AUTOPLAY & MANUAL TIMER RESET LOGIC ─────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_DELAY_MS);
  }, [totalSlides]);

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, startTimer]);

  const handleManualSwitch = (newIndex) => {
    setActiveSlide(newIndex);
    if (!isPaused) {
      startTimer(); // Resets autoplay interval for a full 3.2s from user interaction
    }
  };

  const handleNext = () => {
    handleManualSwitch((activeSlide + 1) % totalSlides);
  };

  const handlePrev = () => {
    handleManualSwitch((activeSlide - 1 + totalSlides) % totalSlides);
  };

  // Duplicate brand list 3x to ensure seamless continuous looping across ultra-wide viewports
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-slate-50 dark:bg-zinc-950/60 py-4 md:py-6 border-b border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-7">

        {/* ── 1. PROMOTIONAL BANNER CAROUSEL ─────────────────────────── */}
        <div
          className="relative group rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Slide Track (Compact aspect ratio matching SurgiNatal ~3.7:1 / 280px height) */}
          <div className="relative w-full aspect-[2.6/1] sm:aspect-[3.2/1] md:aspect-[3.7/1] max-h-[300px] overflow-hidden bg-slate-100 dark:bg-zinc-900">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-600 ease-in-out transform ${
                    isActive
                      ? "opacity-100 translate-x-0 scale-100 z-10 pointer-events-auto"
                      : "opacity-0 translate-x-4 scale-[0.99] z-0 pointer-events-none"
                  }`}
                  style={{ transitionProperty: "opacity, transform" }}
                >
                  <img
                    src={slide.img}
                    alt={slide.alt}
                    className="w-full h-full object-cover object-center select-none"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Carousel Dots Pagination (Matching SurgiNatal reference dots inside bottom edge) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleManualSwitch(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === activeSlide
                    ? "w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs"
                    : "w-2 h-2 rounded-full bg-slate-300/80 dark:bg-white/50 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>


        {/* ── 2. FEATURED BRANDS CONTINUOUS MARQUEE ──────────────────── */}
        <div className="pt-2">
          {/* STATIC HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-xl md:text-2xl text-slate-800 dark:text-zinc-100 tracking-tight">
              Featured Brands
            </h2>
          </div>

          {/* CONTINUOUS GPU-ACCELERATED MARQUEE TRACK */}
          <div className="w-full overflow-hidden py-3 relative">
            {/* Subtle Gradient Fades on Left & Right Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

            <div className="animate-brand-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
              {duplicatedBrands.map((brand, idx) => (
                <div
                  key={`${brand.id}-${idx}`}
                  className="brand-logo-space shrink-0 w-[110px] sm:w-[140px] md:w-[160px] h-[54px] sm:h-[64px] md:h-[72px] flex items-center justify-center p-1 select-none"
                  title={`Brand: ${brand.name}`}
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center select-none">
                      <span className={brand.textStyle || "font-bold text-slate-700 dark:text-slate-300 text-sm"}>
                        {brand.name}
                      </span>
                      {brand.subtitle && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 -mt-0.5">
                          {brand.subtitle}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SurgicalHeroSection;
