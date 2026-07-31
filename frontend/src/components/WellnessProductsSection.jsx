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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="text-left">
          <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 flex items-center gap-2">
            <span>PREVENTATIVE HEALTH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
            <span>WELLNESS ESSENTIALS</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
            Wellness & Supplements
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 mt-1 font-normal">
            Daily nutritional supplements, personal hygiene, and preventative care essentials.
          </p>
        </div>
        <Link 
          to="/wellness" 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#157a6d] text-[#157a6d] font-clinical-mono text-xs font-bold tracking-wider hover:bg-[#157a6d] hover:text-white transition-all duration-200 self-start sm:self-auto shrink-0"
        >
          <span>BROWSE WELLNESS</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      <div className="relative w-full">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] hover:bg-[#157a6d] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer ${
            canScrollLeft ? "md:flex" : "md:hidden"
          } hidden`}
          aria-label="Previous Products"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] hover:bg-[#157a6d] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer ${
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
    </div>
  </section>
  );
};

export default WellnessProductsSection;
