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

      {/* Main Headline (Hidden on mobile) */}
      <h1 className="headline font-sans hidden md:block">
        Find Medicines & Surgical Products at Better Prices
      </h1>
      
      {/* Subtitle / 70% line (Kept on mobile & desktop) */}
      <p className="subtitle-line font-sans">
        Save up to 70% on selected products
      </p>

      {/* Prescription Pad Search Card */}
      <div 
        id="hero-search-anchor" 
        className="search-wrap font-sans cursor-pointer md:cursor-default"
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
    </section>
  );
};

export default HeroSection;
