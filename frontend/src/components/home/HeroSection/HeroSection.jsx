import React from "react";
import { useNavigate } from "react-router-dom";
import UniversalSearch from "../../common/UniversalSearch";
import "./HeroSection.css";

/**
 * WellMeds Prescription-Themed Hero Component
 * Pixel-perfect React conversion of the official WellMeds prescription banner design.
 */
const HeroSection = () => {
  const navigate = useNavigate();

  const handleMobileSearchClick = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      navigate("/search");
    }
  };

  return (
    <section className="wellmeds-hero-section" aria-label="Hero Section">
      <div className="w-full max-w-[920px] mx-auto flex flex-col items-center justify-center text-center">
        {/* Main Headline */}
        <h1 className="headline font-sans">
          <span className="headline-upper">Find Medicines &amp; Surgical</span>
          <span className="headline-space"> </span>
          <span className="headline-lower">Products at Better Prices</span>
        </h1>

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

        {/* Trust & Guarantees Line (Hidden on mobile) */}
        <div className="trust-line font-sans hidden md:block">
          100% Genuine medicines &nbsp;·&nbsp; Fast delivery &nbsp;·&nbsp; Easy repeat orders
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
