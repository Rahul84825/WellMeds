import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import surgical promotional banners
import orthoBanner from "../assets/srugical/promo/ChatGPT Image Aug 10, 2026, 11_48_36 AM.png";
import adultDiapersBanner from "../assets/srugical/promo/ChatGPT Image Aug 10, 2026, 11_48_41 AM.png";
import hospitalBedBanner from "../assets/srugical/promo/ChatGPT Image Aug 10, 2026, 11_49_04 AM.png";
import glucometerBanner from "../assets/srugical/promo/ChatGPT Image Aug 10, 2026, 11_49_09 AM.png";
import fridoBanner from "../assets/srugical/promo/ChatGPT Image Aug 10, 2026, 12_10_00 PM.png";

// Import surgical brand logos
import romsonsLogo from "../assets/srugical/brands/brand-romsons.png";
import flamingoLogo from "../assets/srugical/brands/flamingo_health-Logo-02 (1).webp";
import friendsLogo from "../assets/srugical/brands/friends.png";
import threeMLogo from "../assets/srugical/brands/kisspng-3m-singapore-adhesive-tape-logo-brand-1713943911080.webp";
import omronLogo from "../assets/srugical/brands/omron-vector-logo-free-11574207108nfoalflthr.png";
import beurerLogo from "../assets/srugical/brands/png-transparent-beurer-hd-logo.png";
import fridoLogo from "../assets/srugical/brands/35201_Logo.jfif";
import visscoLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_23_50 PM.png";
import accuChekLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_28_52 PM.png";
import tynorLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_31_40 PM.png";
import rgbLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_37_14 PM.png";
import drMorepenLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_43_20 PM.png";
import medtechLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 12_46_05 PM.png";
import accuSureLogo from "../assets/srugical/brands/ChatGPT Image Aug 10, 2026, 01_01_36 PM.png";

const HERO_SLIDES = [
  {
    id: "orthopedic-support",
    img: orthoBanner,
    alt: "Orthopedic Support - Relieves Pain, Enhances Stability & Protection",
    title: "Orthopedic Support",
    subtitle: "Support That Moves You Better, Every Day"
  },
  {
    id: "adult-diapers",
    img: adultDiapersBanner,
    alt: "Adult Diapers - Comfort & Confidence Every Day",
    title: "Adult Diapers Care",
    subtitle: "Comfort & Confidence Every Day"
  },
  {
    id: "hospital-bed",
    img: hospitalBedBanner,
    alt: "Hospital Bed - Adjustable Backrest & Height, Smooth Mobility",
    title: "Hospital Beds & Care",
    subtitle: "Better Care, Faster Recovery"
  },
  {
    id: "glucometer-care",
    img: glucometerBanner,
    alt: "Glucometer Smart Care - Accurate Results, Small Blood Sample",
    title: "Glucometers & Monitors",
    subtitle: "Smart Care, Every Day"
  },
  {
    id: "frido-range",
    img: fridoBanner,
    alt: "Frido Healthcare Range - Ultimate Sleep Pillow, Knee Cap & Insoles",
    title: "Frido Healthcare Range",
    subtitle: "Comfort Today, Better Every Day"
  }
];

export const SURGICAL_BRAND_LOGOS = [
  { id: "tynor", name: "Tynor", logoUrl: tynorLogo },
  { id: "vissco", name: "Vissco", logoUrl: visscoLogo },
  { id: "accu-chek", name: "Accu-Chek", logoUrl: accuChekLogo },
  { id: "dr-morepen", name: "Dr. Morepen", logoUrl: drMorepenLogo },
  { id: "frido", name: "Frido", logoUrl: fridoLogo },
  { id: "3m", name: "3M Medical", logoUrl: threeMLogo },
  { id: "romsons", name: "Romsons", logoUrl: romsonsLogo },
  { id: "flamingo", name: "Flamingo", logoUrl: flamingoLogo },
  { id: "friends", name: "Friends", logoUrl: friendsLogo },
  { id: "omron", name: "Omron", logoUrl: omronLogo },
  { id: "beurer", name: "Beurer", logoUrl: beurerLogo },
  { id: "accusure", name: "AccuSure", logoUrl: accuSureLogo },
  { id: "medtech", name: "Medtech", logoUrl: medtechLogo },
  { id: "rgb", name: "RGB Healthcare", logoUrl: rgbLogo }
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
const SurgicalHeroSection = ({ brands = SURGICAL_BRAND_LOGOS }) => {
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
          {/* Carousel Slide Track - 2.5:1 aspect ratio matches intrinsic promo banner dimensions (1981x793) */}
          <div className="relative w-full aspect-[2.5/1] max-h-[500px] overflow-hidden bg-slate-100 dark:bg-zinc-900">
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
                    className="w-full h-full object-contain sm:object-cover object-center select-none"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrow — Left */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 cursor-pointer active:scale-95"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Navigation Arrow — Right */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 cursor-pointer active:scale-95"
            aria-label="Next Banner"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Carousel Dots Pagination */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-slate-900/30 dark:bg-zinc-950/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleManualSwitch(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === activeSlide
                    ? "w-5 sm:w-6 h-2 rounded-full bg-sky-400 shadow-xs"
                    : "w-2 h-2 rounded-full bg-white/60 hover:bg-white"
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
              Featured Surgical Brands
            </h2>
          </div>

          {/* CONTINUOUS GPU-ACCELERATED MARQUEE TRACK */}
          <div className="w-full overflow-hidden py-4 relative">
            {/* Subtle Gradient Fades on Left & Right Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

            <div className="animate-brand-marquee flex items-center gap-6 sm:gap-10 md:gap-12">
              {duplicatedBrands.map((brand, idx) => (
                <div
                  key={`${brand.id}-${idx}`}
                  className="brand-logo-space shrink-0 w-[135px] sm:w-[172px] md:w-[197px] h-[66px] sm:h-[79px] md:h-[89px] flex items-center justify-center p-1 transition-all select-none group cursor-pointer"
                  title={`Brand: ${brand.name}`}
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter group-hover:scale-110 transition-transform duration-200"
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
