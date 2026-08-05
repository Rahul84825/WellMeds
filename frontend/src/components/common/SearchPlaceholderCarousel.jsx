import React, { useState, useEffect } from "react";
import "./SearchPlaceholderCarousel.css";

export const SAMPLE_PRODUCTS = [
  "Mounjaro",
  "Glenza",
  "Lonopin",
  "Voriconazole",
  "Wheelchair",
  "Glucometer",
  "Magnesium",
  "Hospital bed",
  "Folisurge",
  "Inhaler",
  "Melatonin",
  "Nebulizer",
  "Hair Care",
];

export const SearchPlaceholderCarousel = ({
  items = SAMPLE_PRODUCTS,
  hasValue = false,
  className = "",
  pauseDuration = 2000,
  transitionDuration = 500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect accessibility prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Control vertical slide carousel timer loop
  useEffect(() => {
    // Only pause if user typed text, reducedMotion is active, or items list is empty
    if (hasValue || reducedMotion || items.length === 0) {
      return;
    }

    let transitionTimer;
    const intervalTimer = setInterval(() => {
      const upcomingIndex = (currentIndex + 1) % items.length;
      setNextIndex(upcomingIndex);
      setIsTransitioning(true);

      transitionTimer = setTimeout(() => {
        setCurrentIndex(upcomingIndex);
        setIsTransitioning(false);
      }, transitionDuration);
    }, pauseDuration + transitionDuration);

    return () => {
      clearInterval(intervalTimer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [currentIndex, hasValue, reducedMotion, items.length, pauseDuration, transitionDuration]);

  // Hide placeholder overlay ONLY when user has typed text in the input
  if (hasValue) {
    return null;
  }

  // Reduced motion static fallback
  if (reducedMotion) {
    return (
      <div className={`search-placeholder-overlay ${className}`} aria-hidden="true">
        <span className="search-prefix select-none">Search for&nbsp;</span>
        <div className="product-carousel-container">
          <span className="search-placeholder-item static font-bold">
            Medicines, Molecules...
          </span>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex] || "";
  const nextItem = items[nextIndex] || "";

  return (
    <div className={`search-placeholder-overlay ${className}`} aria-hidden="true">
      {/* STATIC PREFIX - NEVER MOVES OR ANIMATES */}
      <span className="search-prefix select-none">Search for&nbsp;</span>

      {/* PRODUCT NAME CAROUSEL - ONLY PRODUCT NAME ANIMATES VERTICALLY */}
      <div className="product-carousel-container">
        {!isTransitioning ? (
          <span className="search-placeholder-item static font-bold">
            {currentItem}
          </span>
        ) : (
          <>
            <span className="search-placeholder-item exit font-bold">
              {currentItem}
            </span>
            <span className="search-placeholder-item enter font-bold">
              {nextItem}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPlaceholderCarousel;
