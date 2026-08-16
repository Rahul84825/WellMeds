import React from "react";
import chooseDesktop from "../../assets/why_wellmeds/choose_desktop.png";
import chooseMobile from "../../assets/why_wellmeds/choose_mobile.png";

/**
 * WhyWellMedsBar
 * Displays edge-to-edge full-width Why Choose WellMeds banner (desktop & mobile images) without rounded edges or hover effects.
 */
const WhyWellMedsBar = () => {
  return (
    <section className="w-full select-none">
      <div className="w-full overflow-hidden">
        <picture className="w-full h-auto block">
          <source media="(min-width: 768px)" srcSet={chooseDesktop} />
          <img
            src={chooseMobile}
            alt="Why Choose Wellmeds - Pharmacist Verified, WhatsApp Ordering, Local Pune Pharmacy, CDSCO Licensed"
            className="w-full h-auto object-cover block select-none"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </section>
  );
};

export default React.memo(WhyWellMedsBar);
