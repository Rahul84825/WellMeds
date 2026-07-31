import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "./ProductCard";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

/**
 * GLP1ProductsSection — WellMeds Design System V2
 * Dedicated homepage section rendering products toggled as "GLP-1 Medicines for Diabetes & Weight Loss".
 */
const GLP1ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchGLP1 = async () => {
      try {
        const data = await api.getProducts({ isGLP1Medicine: true, limit: 12 });
        if (isMounted) {
          setProducts(data.products || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch GLP-1 medicines section products:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    fetchGLP1();
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
    return null; // Silent hide if no products toggled as GLP-1 Medicines
  }

  return (
    <section className="py-12 md:py-14 w-full bg-white dark:bg-zinc-950 border-t border-[#dde8e3] dark:border-zinc-900">
      <div className="home-section-container">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>WEIGHT MANAGEMENT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>DIABETES CARE</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              GLP-1 Medicines for Diabetes & Weight Loss
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 mt-1 font-normal">
              Authentic GLP-1 receptor agonist formulations verified by licensed pharmacists.
            </p>
          </div>

          <Link
            to="/glp-1-medicines"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#157a6d] text-[#157a6d] font-clinical-mono text-xs font-bold tracking-wider hover:bg-[#157a6d] hover:text-white transition-all duration-200 self-start sm:self-auto shrink-0"
          >
            <span>BROWSE GLP-1</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Product Carousel Container */}
        <div className="relative w-full">
          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] hover:bg-[#157a6d] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer ${
              canScrollLeft ? "md:flex" : "md:hidden"
            } hidden`}
            aria-label="Previous GLP-1 Medicines"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 shadow-md text-[#157a6d] hover:bg-[#157a6d] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer ${
              canScrollRight ? "md:flex" : "md:hidden"
            } hidden`}
            aria-label="Next GLP-1 Medicines"
          >
            <ChevronRight size={24} className="stroke-[3]" />
          </button>

          {/* Scroll Container */}
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

      </div>
    </section>
  );
};

export default React.memo(GLP1ProductsSection);
