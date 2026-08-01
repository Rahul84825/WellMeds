import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import CategoryCard from "./CategoryCard";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * PremiumCategorySection
 *
 * Fully dynamic — every category comes from the Admin Panel via useCategories().
 * No hardcoded icons, labels, or arrays.
 *
 * Features:
 * - Horizontal carousel with prev/next arrow buttons
 * - Touch swipe + mouse drag
 * - Snap-scrolling
 * - Premium pastel card backgrounds (delegated to CategoryCard)
 * - Responsive: 6-8 on desktop, 4-5 tablet, 2-3 mobile
 * - "View All Categories" pill button (top-right)
 * - Lazy-loaded images via CategoryCard
 * - Keyboard accessible
 * - ARIA labelled region
 */
const CategorySection = () => {
  const { categories, loading, error } = useCategories();
  const sliderRef = useRef(null);

  // Arrow visibility state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const activeCategories = categories.filter(
    (cat) => cat.isActive !== false && cat.status !== "Inactive"
  );

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
  }, [activeCategories, updateArrows]);

  // Scroll by one card width
  const SCROLL_AMOUNT = 560; // ~3 card widths (175px + gap ~15px) × 3

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

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section
        aria-label="Shop by Category — loading"
        className="py-16 bg-white dark:bg-zinc-950"
      >
        <div
          className="home-section-container flex justify-center items-center"
          style={{ minHeight: "220px" }}
        >
          <Loader size="md" />
        </div>
      </section>
    );
  }

  if (error || activeCategories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Shop by Category"
      className="category-section bg-white dark:bg-zinc-950 text-2xl"
      style={{
        paddingTop: "36px",
        paddingBottom: "44px",
      }}
    >
      <div className="home-section-container">

        {/* ── Section Header ─────────────────────────────────────── */}
        <div className="flex flex-row items-center justify-between sm:items-end mb-6 gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              Shop by Category
            </h2>
          </div>

          {/* Right Header Navigation Controls: ( ← ) [ VIEW ALL ] ( → ) */}
          <div className="flex items-center gap-2.5 shrink-0">
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
              to="/categories"
              className="inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200 shrink-0"
              aria-label="View all categories"
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
          aria-label="Category carousel"
          className="category-slider-track no-scrollbar"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "14px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingTop: "16px",
            paddingBottom: "20px",
            cursor: "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        >
          {activeCategories.map((cat, idx) => (
            <div
              key={(cat._id || cat.id)?.toString()}
              role="listitem"
              className="category-card-wrapper"
              style={{ scrollSnapAlign: "start", flexShrink: 0 }}
            >
              <CategoryCard category={cat} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(CategorySection);
