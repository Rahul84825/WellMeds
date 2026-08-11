import React, { useState, useRef, useEffect, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";

const testimonialsData = [
  {
    id: 1,
    text: "I’m from Solapur and once needed a cancer medicine for my grandfather. It wasn’t easily available, but Wellmeds helped me arrange it at a good price. The medicine was of good quality and the service was very helpful. Truly appreciate the support when we needed it most.",
    name: "Vinay Yelgulwar",
    role: "Verified Buyer",
    place: "Solapur",
    time: "2 days ago",
    source: "Google Review"
  },
  {
    id: 2,
    text: "I have been associated with Wellmeds since 2023, when they had their offline store. Recently purchased an osteoporosis injection from them and was very happy with the price offered. The service has always been reliable and professional. Glad to continue getting my medicines from Wellmeds.",
    name: "Mehrun Qureshi",
    role: "Regular Customer",
    place: "Pune",
    time: "2 weeks ago",
    source: "Google Review"
  },
  {
    id: 3,
    text: "My temperature-sensitive medicine arrived on time in secure insulated packaging with ice packs, exactly as promised. The delivery was handled professionally, and the medicine was in excellent condition on arrival. Really appreciate WellMeds' reliable cold-chain service.",
    name: "Mamta Parmar",
    role: "Verified Buyer",
    place: "Pune",
    time: "1 month ago",
    source: "Google Review"
  },
  {
    id: 4,
    text: "First time at Wellmeds! Impressed by the wide selection. Found competitive pricing on essential meds, even specialized ones like anti-HIV and anti-cancer drugs.",
    name: "June Barsha",
    role: "Verified Buyer",
    place: "Pune",
    time: "3 weeks ago",
    source: "Google Review"
  },
  {
    id: 5,
    text: "I live in UK and needed a good quantity of antibiotic injections, which were quite expensive here. Wellmeds helped arrange them from India and couriered them to me. Really appreciate their service and support.",
    name: "Soham D",
    role: "Regular Customer",
    place: "United Kingdom",
    time: "5 days ago",
    source: "Google Review"
  }
];

const GoogleIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const TestimonialCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const maxLength = 110;
  const shouldTruncate = item.text.length > maxLength;
  const textToShow = isExpanded ? item.text : (shouldTruncate ? `${item.text.slice(0, maxLength)}...` : item.text);

  return (
    <div className="w-[85vw] sm:w-[320px] md:w-[350px] shrink-0 snap-start flex flex-col gap-sm select-none">
      
      {/* 1. Customer Details Header */}
      <div className="flex items-center gap-md px-xs">
        {/* Initials Avatar */}
        <div className="w-[52px] h-[52px] rounded-full bg-[#038076]/10 text-[#038076] dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-slate-200 dark:border-zinc-800 shadow-xs shrink-0">
          {getInitials(item.name)}
        </div>

        {/* Name, Verified Badge, Stars & Place */}
        <div className="text-left">
          <div className="flex items-center gap-xs flex-wrap">
            <span className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 leading-tight">
              {item.name}
            </span>
            <span className="inline-flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-md gap-0.5 shrink-0 select-none">
              <Check className="w-2.5 h-2.5" />
              Verified
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {item.place && (
              <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                <MapPin className="w-3 h-3 text-[#157a6d] dark:text-emerald-400 shrink-0" />
                {item.place}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Review Card Shell */}
      <div className="relative flex flex-col justify-between h-[230px] rounded-[24px] border border-slate-150 dark:border-zinc-800/80 bg-[#f7f9fc] dark:bg-zinc-900 p-lg shadow-sm hover:shadow-md hover:border-[#038076] dark:hover:border-[#038076] transition-all duration-300 overflow-hidden">
        
        {/* Quote Watermark Decoration */}
        <div className="absolute top-4 left-4 text-slate-250 dark:text-zinc-850 opacity-40 pointer-events-none select-none">
          <Quote className="w-14 h-14 transform rotate-180 text-slate-300 dark:text-zinc-800" />
        </div>

        {/* Google Floating Badge at Top Right */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center border border-slate-150 dark:border-zinc-850 shadow-xs select-none z-10">
          <GoogleIcon />
        </div>

        {/* Review Content */}
        <div className="relative z-15 pt-8 text-left">
          <p className="text-[13px] leading-relaxed text-slate-655 dark:text-zinc-300 font-medium font-poppins">
            "{textToShow}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[11px] font-bold text-[#038076] hover:underline focus:outline-none cursor-pointer"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Card Footer */}
        <div className="relative z-10 border-t border-slate-200/60 dark:border-zinc-800/50 pt-sm flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-zinc-550 select-none">
          <span className="flex items-center gap-xs">
            <GoogleIcon />
            {item.source || "Google Review"}
          </span>
          <span>{item.time || "2 months ago"}</span>
        </div>

      </div>

    </div>
  );
};

export const TestimonialsSection = () => {
  const sliderRef = useRef(null);

  // Arrow visibility state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Update arrow visibility based on scroll position
  const updateArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    // ResizeObserver for dynamic width changes
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollLeft = () => {
    if (!sliderRef.current) return;
    const amount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: -amount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!sliderRef.current) return;
    const amount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Mouse drag-to-scroll
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - sliderRef.current.offsetLeft;
    dragScrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.style.cursor = "grabbing";
    sliderRef.current.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const delta = (x - dragStartX.current) * 1.5;
    sliderRef.current.scrollLeft = dragScrollLeft.current - delta;
  };

  const stopDragging = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
      sliderRef.current.style.userSelect = "";
    }
  };

  return (
    <section className="py-12 md:py-16 w-full bg-white dark:bg-zinc-950 transition-colors duration-300 select-none">
      <div className="home-section-container">
        
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between sm:items-end mb-6 gap-4 border-b border-[#dde8e3] dark:border-zinc-800 pb-4">
          <div>
            <div className="hidden sm:flex font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 items-center gap-2">
              <span>CLINICAL TRUST</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>PATIENT REVIEWS</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              What our patients Say
            </h2>
          </div>

          {/* Right Header Navigation Controls: ( ← ) ( → ) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll testimonials left"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll testimonials right"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Testimonials Carousel Track */}
        <div className="relative w-full overflow-hidden">
          <div
            ref={sliderRef}
            role="list"
            aria-label="Testimonials carousel"
            className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 select-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {testimonialsData.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;

