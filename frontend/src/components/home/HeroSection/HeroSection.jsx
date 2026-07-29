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
      <h1 className="headline hero-anim-headline">
        Search for your medicine. We probably <em>already</em> have it.
      </h1>

      {/* Prescription Pad Search Card */}
      <div className="search-wrap hero-anim-card">
        <div className="search-tape" aria-hidden="true" />
        <div className="search-card">
          <UniversalSearch variant="prescription" />
        </div>
      </div>

      {/* Trust & Guarantees Line */}
      <div className="trust-line hero-anim-trust">
        <b>100% genuine medicines</b> &nbsp;·&nbsp; fast delivery &nbsp;·&nbsp; easy repeat orders
      </div>
    </section>
  );
};

export default HeroSection;
