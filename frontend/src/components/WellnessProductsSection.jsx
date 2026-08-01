import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/api/productService";
import ProductCard from "./ProductCard";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WellnessProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const container = sliderRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;
    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products]);

  useEffect(() => {
    const fetchWellness = async () => {
      try {
        setLoading(true);
        // Query the backend for products matching the productType "wellness"
        const data = await productService.getProducts({ productType: "wellness", limit: 8 });
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load wellness products", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWellness();
  }, []);

  const handleScroll = (direction) => {
    const container = sliderRef.current;
    if (!container) return;
    const card = container.querySelector(".carousel-item");
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = window.innerWidth >= 768 ? 24 : 16;
    const scrollAmount = cardWidth + gap;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth"
    });
  };

  if (loading) {
    return (
      <section className="py-12 md:py-14 home-section-container max-w-full lg:max-w-[82%] mx-auto flex justify-center items-center">
        <Loader size="md" />
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  const displayedProducts = products.slice(0, 8);

  return (
    <section className="py-12 md:py-14 w-full bg-white dark:bg-zinc-950">
      <div className="home-section-container">
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between sm:items-end mb-6 gap-4">
          <div className="text-left">
            <div className="hidden sm:flex font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 items-center gap-2">
              <span>PREVENTATIVE HEALTH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>WELLNESS ESSENTIALS</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              Health & Wellness
            </h2>
            <p className="hidden sm:block font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 mt-1 font-normal">
              Daily nutritional supplements, personal hygiene, and preventative care essentials.
            </p>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Left Navigation Arrow */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${canScrollLeft
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
                }`}
              aria-label="Previous Products"
            >
              <ChevronLeft size={18} />
            </button>

            <Link
              to="/wellness"
              aria-label="View all wellness products"
              className="inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200 shrink-0"
            >
              <span>View all</span>
            </Link>

            {/* Right Navigation Arrow */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${canScrollRight
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
                }`}
              aria-label="Next Products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Product Carousel Container (Full Width, Zero Overlay) */}
        <div
          ref={sliderRef}
          className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
        >
          {displayedProducts.map((prod) => (
            <div
              key={(prod._id || prod.id)?.toString()}
              className="carousel-item shrink-0 w-[calc((100%-16px)/1.48)] sm:w-[230px] md:w-[calc((100%-3*20px)/3.7)] lg:w-[calc((100%-4*20px)/4.5)] snap-start"
            >
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WellnessProductsSection;
