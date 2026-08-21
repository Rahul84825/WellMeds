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
      {/* Eyebrow badge */}
      <div className="eyebrow hero-anim-eyebrow">
        Specialty Pharmacy · Pune
      </div>

      {/* Main Headline */}
      <h1 className="headline hero-anim-headline font-sans">
        Find Medicines & Surgical Products at Better Prices
      </h1>
      
      {/* Subtitle */}
      <p className="subtitle-line hero-anim-headline font-sans">
        Save up to 70% on selected products
      </p>

      {/* Prescription Pad Search Card */}
      <div id="hero-search-anchor" className="search-wrap hero-anim-card font-sans">
        <div className="search-tape" aria-hidden="true" />
        <div className="search-card font-sans">
          <UniversalSearch variant="prescription" />
        </div>
      </div>

      {/* Trust & Guarantees Line */}
      <div className="trust-line hero-anim-trust font-sans">
        100% genuine medicines &nbsp;·&nbsp; fast delivery &nbsp;·&nbsp; easy repeat orders
      </div>
    </section>
  );
};

export default HeroSection;
