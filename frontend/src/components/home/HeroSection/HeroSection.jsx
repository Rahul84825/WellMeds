import React from "react";
import UniversalSearch from "../../common/UniversalSearch";
import "./HeroSection.css";

/**
 * WellMeds Prescription-Themed Hero Component
 * Pixel-perfect React conversion of the official WellMeds prescription banner design.
 */
const HeroSection = () => {
  return (
    <section className="wellmeds-hero-section" aria-label="Hero Section">

      {/* Main Headline (Hidden on mobile) */}
      <h1 className="headline hero-anim-headline font-sans hidden md:block">
        Find Medicines & Surgical Products at Better Prices
      </h1>
      
      {/* Subtitle / 70% line (Kept on mobile & desktop) */}
      <p className="subtitle-line hero-anim-headline font-sans">
        Save up to 70% on selected products
      </p>

      {/* Prescription Pad Search Card */}
      <div id="hero-search-anchor" className="search-wrap hero-anim-card font-sans">
        <div className="search-tape hidden md:block" aria-hidden="true" />
        <div className="search-card font-sans">
          <UniversalSearch variant="prescription" />
        </div>
      </div>

      {/* Trust & Guarantees Line (Hidden on mobile) */}
      <div className="trust-line hero-anim-trust font-sans hidden md:block">
        100% Genuine medicines &nbsp;·&nbsp; Fast delivery &nbsp;·&nbsp; Easy repeat orders
      </div>
    </section>
  );
};

export default HeroSection;
