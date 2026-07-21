import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useFeaturedProducts from "../hooks/useFeaturedProducts";
import ProductCard from "./ProductCard";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeaturedProductsSection = () => {
  const { featuredProducts, loading, error } = useFeaturedProducts();

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
  }, [featuredProducts]);

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

  if (error || featuredProducts.length === 0) {
    return null;
  }

  const displayedProducts = featuredProducts.slice(0, 8);

  return (
    <section className="py-12 md:py-14 home-section-container max-w-full lg:max-w-[82%] mx-auto bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface text-2xl">Best Sellers</h2>
        <Link to="/products" className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline flex items-center gap-xs">
          <span>Browse Products</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      <div className="relative w-full">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-md text-[#038076] hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#038076] cursor-pointer ${
            canScrollLeft ? "md:flex" : "md:hidden"
          } hidden`}
          aria-label="Previous Products"
        >
          <ChevronLeft size={24} className="stroke-[3]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className={`absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-md text-[#038076] hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#038076] cursor-pointer ${
            canScrollRight ? "md:flex" : "md:hidden"
          } hidden`}
          aria-label="Next Products"
        >
          <ChevronRight size={24} className="stroke-[3]" />
        </button>

        {/* Right Gradient Mask Overlay */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white dark:to-zinc-950 pointer-events-none z-10 transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Scroll Container */}
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

export default FeaturedProductsSection;
