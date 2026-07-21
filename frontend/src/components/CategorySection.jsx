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
      className="category-section bg-white dark:bg-zinc-950"
      style={{
        paddingTop: "48px",
        paddingBottom: "56px",
      }}
    >
      <div className="home-section-container">

        {/* ── Section Header ─────────────────────────────────────── */}
        <div
          className="category-section-header"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h2
              className="category-section-title"
              style={{
                fontSize: "clamp(32px, 3vw, 40px)",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Shop by Category
            </h2>
          </div>

          {/* View All pill button */}
          <Link
            to="/categories"
            className="category-section-view-all"
            aria-label="View all product categories"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 20px",
              borderRadius: "999px",
              border: "1.5px solid #0e9f7e",
              color: "#0e9f7e",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              background: "transparent",
              transition: "all 200ms ease",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0e9f7e";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#0e9f7e";
            }}
          >
            View All
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* ── Slider Wrapper (position relative for arrows) ──────── */}
        <div style={{ position: "relative" }}>

          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#334155",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#038076";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#038076";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              aria-label="Scroll categories right"
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#334155",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#038076";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#038076";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronRight size={18} />
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
              paddingBottom: "12px",
              paddingTop: "4px",
              paddingLeft: "4px",
              paddingRight: "4px",
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

      {/* ── Scoped styles ──────────────────────────────────────────── */}
      <style>{`
        /* Hide dots on desktop, show on mobile */
        @media (min-width: 768px) {
          .category-scroll-dots {
            display: none !important;
          }
        }

        /* Left/right fade edges on desktop */
        @media (min-width: 768px) {
          .category-slider-wrap {
            mask-image: linear-gradient(
              to right,
              transparent 0%,
              black 3%,
              black 97%,
              transparent 100%
            );
          }
        }

        /* Accessible focus ring for arrow buttons */
        button:focus-visible {
          outline: 3px solid #038076;
          outline-offset: 3px;
        }

        @media (max-width: 640px) {
          .category-card-wrapper {
            width: calc((100% - 14px) / 2) !important;
            min-width: calc((100% - 14px) / 2) !important;
          }
        }

        /* ── Mobile Layout Optimization (≤768px) ── */
        @media (max-width: 768px) {
          .category-section {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .category-section-header {
            display: flex !important;
            align-items: center !important; /* Perfect vertical alignment */
            justify-content: space-between !important;
            margin-bottom: 16px !important; /* Proper vertical spacing */
            padding-left: 8px !important; /* Aligns with screen left edge (total 16px) */
            padding-right: 8px !important; /* Aligns with screen right edge */
          }
          .category-section-title {
            font-size: 25px !important; /* Reduced from 32px (~22% reduction) */
            font-weight: 700 !important; /* Bold but slightly lighter for visual balance */
            line-height: 1.2 !important; /* Compact line-height */
            letter-spacing: -0.02em !important;
            margin: 0 !important;
            color: #0f172a !important;
          }
          .category-section-view-all {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            padding: 8px 16px !important; /* Touch target optimized */
            border-radius: 999px !important;
            border: 1.5px solid #0e9f7e !important;
            color: #0e9f7e !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            background: transparent !important;
            transition: all 200ms ease !important;
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            min-height: 36px !important; /* Touch target height */
          }
          .category-slider-track {
            gap: 12px !important; /* Consistent gap: cards never touch */
            padding-left: 16px !important; /* Aligned with title */
            padding-right: 16px !important;
            padding-bottom: 12px !important;
            margin-left: -8px !important; /* Allows scroll to bleed to screen edge */
            margin-right: -8px !important;
          }
          .category-card-wrapper {
            width: auto !important;
            min-width: auto !important;
            scroll-snap-align: start !important;
          }
          /* Hide scroll buttons on mobile */
          .category-section button {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CategorySection;
