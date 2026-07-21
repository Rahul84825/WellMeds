import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "./Loader";
import CategoryCard from "./CategoryCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * SurgicalProductsSection
 * 
 * Replicating the "Shop by Category" layout and carousel behavior.
 * Uses Tailwind CSS only.
 */
const SurgicalProductsSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sliderRef = useRef(null);

  // Arrow visibility state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const list = await api.getSurgicalCategories();
      // Filter active categories
      const activeList = list.filter(
        (cat) => cat.isActive !== false && cat.status !== "Inactive"
      );
      setCategories(activeList);
      setError(null);
    } catch (err) {
      console.error("Failed to load surgical categories on home page", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

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
  }, [categories, updateArrows]);

  // Scroll by one card width
  const SCROLL_AMOUNT = 560; // ~3 card widths (170px + gap 14px) * 3

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  // ── Mouse drag-to-scroll ──────────────────────────────────────────────
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

  if (loading) {
    return (
      <section
        aria-label="Surgical & Medical Supplies — loading"
        className="py-12 md:py-14 bg-white dark:bg-zinc-950"
      >
        <div className="home-section-container flex justify-center items-center min-h-[220px]">
          <Loader size="md" />
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Surgical & Medical Supplies"
      className="surgical-section bg-white dark:bg-zinc-950 pt-12 pb-14 border-t border-slate-100 dark:border-zinc-900/60"
    >
      <div className="home-section-container">
        
        {/* Section Header */}
        <div className="flex items-center md:items-end justify-between mb-4 md:mb-8 surgical-section-header">
          <div>
            <h2 className="text-[25px] font-bold md:font-extrabold md:text-[40px] text-[#0f172a] dark:text-zinc-100 leading-tight m-0 tracking-tight">
              Surgical &amp; Medical Supplies
            </h2>
          </div>

          {/* View All pill button */}
          <Link
            to="/surgical/categories"
            aria-label="View all surgical categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-[9px] rounded-full border-[1.5px] border-[#0e9f7e] text-[#0e9f7e] dark:text-[#84d6b9] dark:border-[#84d6b9] text-[13px] font-semibold no-underline bg-transparent transition-all duration-200 shrink-0 whitespace-nowrap min-h-[36px] md:min-h-0 hover:bg-[#0e9f7e] hover:text-white dark:hover:bg-[#84d6b9] dark:hover:text-zinc-950"
          >
            View All
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Slider Wrapper */}
        <div className="relative">
          
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="absolute left-[-20px] top-[85px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-[1.5px] border-slate-200 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-center justify-center cursor-pointer text-slate-700 dark:text-zinc-300 transition-all duration-200 hover:bg-[#038076] hover:text-white hover:border-[#038076] hover:scale-[1.08] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#038076] focus-visible:ring-offset-3"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              aria-label="Scroll categories right"
              className="absolute right-[-20px] top-[85px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-[1.5px] border-slate-200 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-center justify-center cursor-pointer text-slate-700 dark:text-zinc-300 transition-all duration-200 hover:bg-[#038076] hover:text-white hover:border-[#038076] hover:scale-[1.08] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#038076] focus-visible:ring-offset-3"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={sliderRef}
            role="list"
            aria-label="Surgical categories carousel"
            className="surgical-slider-track no-scrollbar flex flex-row gap-3 md:gap-[14px] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 px-1 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {categories.map((cat, idx) => {
              const categoryId = cat.id || cat._id;
              return (
                <div
                  key={categoryId?.toString()}
                  role="listitem"
                  className="snap-start shrink-0 surgical-card-wrapper"
                >
                  <CategoryCard category={cat} isSurgical={true} index={idx} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile scroll hint (dots) */}
        <div
          aria-hidden="true"
          className="flex justify-center gap-1.5 mt-5 md:hidden"
        >
          {categories.slice(0, Math.min(8, categories.length)).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === 0 ? "w-5 bg-[#038076] dark:bg-[#84d6b9]" : "w-1.5 bg-slate-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        /* ── Mobile Layout Optimization (≤768px) ── */
        @media (max-width: 768px) {
          .surgical-section {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .surgical-section-header {
            padding-left: 8px !important; /* Total 16px screen padding */
            padding-right: 8px !important;
          }
          .surgical-slider-track {
            padding-left: 16px !important; /* Align with title */
            padding-right: 16px !important;
            margin-left: -8px !important; /* Bleed to screen edges */
            margin-right: -8px !important;
          }
          /* Hide scroll buttons on mobile */
          .surgical-section button {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default SurgicalProductsSection;
