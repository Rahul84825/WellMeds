import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "./ProductCard";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";

/**
 * BestSellerSection — WellMeds Design System V2
 * Dedicated homepage section rendering products toggled as "Best Seller".
 */
const BestSellerSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBestSellers = async () => {
      try {
        const data = await api.getProducts({ isBestSeller: true, limit: 12 });
        if (isMounted) {
          setProducts(data.products || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch best seller section products:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    fetchBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (slider) slider.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-14 w-full bg-white dark:bg-zinc-950 flex justify-center items-center">
        <Loader size="md" />
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Silent hide if no products toggled as Best Seller
  }

  return (
    <section className="py-12 md:py-14 w-full bg-white dark:bg-zinc-950 border-t border-[#dde8e3] dark:border-zinc-900">
      <div className="home-section-container">

        {/* Section Header */}
        <div className="flex flex-row items-center justify-between sm:items-end mb-6 gap-4">
          <div className="text-left">
            <div className="hidden sm:flex font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              <span>POPULAR SELECTION</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>BEST SELLERS</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              Best Sellers
            </h2>
            <p className="hidden sm:block font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 mt-1 font-normal">
              Doctor-recommended and customer favorite essentials.
            </p>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Left Navigation Arrow */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
              }`}
              aria-label="Previous Best Sellers"
            >
              <ChevronLeft size={18} />
            </button>

            <Link
              to="/best-sellers"
              aria-label="View all best sellers"
              className="inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200 shrink-0"
            >
              <span>View all</span>
            </Link>

            {/* Right Navigation Arrow */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d]"
                  : "opacity-30 cursor-not-allowed"
              }`}
              aria-label="Next Best Sellers"
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
          {products.map((prod) => (
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

export default React.memo(BestSellerSection);
