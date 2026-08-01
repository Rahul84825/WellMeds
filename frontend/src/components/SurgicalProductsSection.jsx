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
      className="surgical-section bg-white dark:bg-zinc-950 pt-9 pb-11 border-t border-slate-100 dark:border-zinc-900/60"
    >
      <div className="home-section-container">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 flex items-center gap-2">
              <span>MEDICAL DEVICES</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>SURGICAL EQUIPMENT</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              Surgical & Clinical Supplies
            </h2>
          </div>

          {/* Right Header Navigation Controls: ( ← ) [ VIEW CATALOG ] ( → ) */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* View All button */}
            <Link
              to="/surgical/categories"
              aria-label="View all surgical categories"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200"
            >
              <span>View all</span>
            </Link>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
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

        {/* ── Scrollable Track (Full Width, Zero Overlay) ─────────────────── */}
        <div
          ref={sliderRef}
          role="list"
          aria-label="Surgical categories carousel"
          className="surgical-slider-track no-scrollbar flex flex-row gap-3 md:gap-[14px] overflow-x-auto snap-x snap-mandatory scroll-smooth pt-4 pb-5 cursor-grab active:cursor-grabbing select-none"
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

        {/* Mobile scroll hint (dots) */}
        <div
          aria-hidden="true"
          className="flex justify-center gap-1.5 mt-5 md:hidden"
        >
          {categories.slice(0, Math.min(8, categories.length)).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-5 bg-[#038076] dark:bg-[#84d6b9]" : "w-1.5 bg-slate-300 dark:bg-zinc-700"
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
            padding-top: 4px !important;
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
