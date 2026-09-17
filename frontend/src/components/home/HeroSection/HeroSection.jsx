import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UniversalSearch from "../../common/UniversalSearch";
import "./HeroSection.css";

/**
 * WellMeds Prescription-Themed Hero Component
 * Pixel-perfect React conversion of the official WellMeds prescription banner design.
 */
const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMobileSearchClick = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/search", { state: { from: location.pathname } });
    }
  };

  return (
    <section className="wellmeds-hero-section" aria-label="Hero Section">
      <div className="w-full max-w-[920px] mx-auto flex flex-col items-center justify-center text-center">
        {/* Main Headline (Desktop Only) */}
        <h1 className="headline font-sans hidden md:block">
          <span className="headline-upper">Find Medicines &amp; Surgical</span>
          <span className="headline-space"> </span>
          <span className="headline-lower">Products at Better Prices</span>
        </h1>

        {/* Save 70% Line */}
        <p className="subtitle-line font-sans">
          Save up to 70% on selected products
        </p>

        {/* Prescription Pad Search Card */}
        <div 
          id="hero-search-anchor" 
          className="search-wrap font-sans cursor-pointer md:cursor-default w-full"
          onClick={handleMobileSearchClick}
        >
          <div className="search-card font-sans">
            <UniversalSearch variant="prescription" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
