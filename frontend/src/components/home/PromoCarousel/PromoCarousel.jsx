import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";


// Import local promotional banner assets
import deliveryImg from "../../../assets/PromoCarousel/delivery.png";
import savingImg from "../../../assets/PromoCarousel/saving.png";
import cancerImg from "../../../assets/PromoCarousel/cancer.png";
import healthImg from "../../../assets/PromoCarousel/health.png";
import glp1Img from "../../../assets/PromoCarousel/GlP-1.png";
import moveFreelyImg from "../../../assets/PromoCarousel/Move_Freely.png";
import physiotherapyImg from "../../../assets/PromoCarousel/Physiotherapy.png";
import saveImg from "../../../assets/PromoCarousel/save.png";

const promoBanners = [
  {
    id: "save-big",
    img: saveImg,
    alt: "Save Big on Healthcare & Prescription Supplies",
    link: "/offers",
  },
  {
    id: "fever",
    img: savingImg,
    alt: "1 in 3 fever cases isn't just viral — Get Tested",
    link: "/products",
  },
  {
    id: "move-freely",
    img: moveFreelyImg,
    alt: "Move Freely — Joint & Bone Care Support",
    link: "/products",
  },
  {
    id: "cancer",
    img: cancerImg,
    alt: "Here to support your cancer care journey — Upto 80% OFF on Genuine Medicines",
    link: "/category/cancer-care",
  },
  {
    id: "physiotherapy",
    img: physiotherapyImg,
    alt: "Physiotherapy & Rehabilitation Supplies",
    link: "/products",
  },
  {
    id: "sunhalt",
    img: healthImg,
    alt: "Sunhalt Gold — Your Ultimate Skin Protection",
    link: "/wellness",
  },
  {
    id: "delivery",
    img: deliveryImg,
    alt: "WellMeds Express Emergency Delivery — Cold Chain Certified",
    link: "/products",
  },
  {
    id: "glp1",
    img: glp1Img,
    alt: "GLP-1 Medicines for Diabetes & Weight Management",
    link: "/glp1-medicines",
  },
];


const PromoCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const totalBanners = promoBanners.length;

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

    const card = scrollRef.current.querySelector(".promo-card-item");
    if (card) {
      const cardWidth = card.offsetWidth;
      const gap = 16;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveSlide(Math.min(Math.max(0, index), totalBanners - 1));
    }
  }, [totalBanners]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scrollToSlide = useCallback((index) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".promo-card-item");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 16;
    scrollRef.current.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth",
    });
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = (activeSlide + 1) % totalBanners;
    scrollToSlide(nextIndex);
  }, [activeSlide, totalBanners, scrollToSlide]);

  const handlePrev = useCallback(() => {
    const prevIndex = (activeSlide - 1 + totalBanners) % totalBanners;
    scrollToSlide(prevIndex);
  }, [activeSlide, totalBanners, scrollToSlide]);

  // Autoplay effect - 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Calculate progress fill ratio & offset
  const progressRatio = (activeSlide / (totalBanners - 1)) * 100;

  return (
    <div className="w-full relative select-none mb-12">
      {/* Carousel Track Container */}
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-none gap-4 sm:gap-5 scroll-smooth py-1 px-0.5 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promoBanners.map((banner) => (
            <div
              key={banner.id}
              onClick={() => {
                if (!banner.link) return;
                if (banner.link.startsWith("http")) {
                  window.open(banner.link, "_blank", "noopener,noreferrer");
                } else {
                  navigate(banner.link);
                }
              }}
              className="promo-card-item shrink-0 snap-start cursor-pointer rounded-2xl sm:rounded-[22px] overflow-hidden border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs
                         w-[88%] sm:w-[58%] lg:w-[calc((100%-20px)/2.25)]
                         aspect-[2.35/1]"
            >

              <img
                src={banner.img}
                alt={banner.alt}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrow — Left */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800/90 text-white shadow-lg flex items-center justify-center transition-all duration-200 z-20 cursor-pointer"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Navigation Arrow — Right */}
        {canScrollRight && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800/90 text-white shadow-lg flex items-center justify-center transition-all duration-200 z-20 cursor-pointer"
            aria-label="Next Banner"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {/* Progress Indicator Line (Bottom Left - Reference Image Identity) */}
      <div className="flex items-center justify-start mt-3.5 px-1">
        <div className="w-20 sm:w-24 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#157a6d] dark:bg-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{
              width: "35%",
              transform: `translateX(${(progressRatio * 1.85)}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;
