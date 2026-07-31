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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 flex items-center gap-2">
            <span>SPECIALTY PHARMACY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
            <span>CLINICAL CATALOG</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
            Shop by Category
          </h2>
        </div>

        {/* View All button */}
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#157a6d] text-[#157a6d] font-clinical-mono text-xs font-bold tracking-wider hover:bg-[#157a6d] hover:text-white transition-all duration-200 self-start sm:self-auto"
          aria-label="View all product categories"
        >
          <span>VIEW ALL CATEGORIES</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* ── Slider Wrapper ──────── */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            aria-label="Scroll categories left"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] flex items-center justify-center cursor-pointer hover:bg-[#157a6d] hover:text-white transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            aria-label="Scroll categories right"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] flex items-center justify-center cursor-pointer hover:bg-[#157a6d] hover:text-white transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>
        )}

          {/* ── Scrollable Track ─────────────────────────────────── */}
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
              paddingLeft: "16px",
              paddingRight: "16px",
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

        {/* ── Mobile scroll hint (dots) ─────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
          }}
          className="category-scroll-dots"
        >
          {activeCategories.slice(0, Math.min(8, activeCategories.length)).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === 0 ? "#038076" : "#cbd5e1",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(CategorySection);
