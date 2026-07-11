import React from "react";
import safeImg from "../assets/QuickActions/safe.png";
import essentialsImg from "../assets/QuickActions/essential.png";
import medical_rxImg from "../assets/QuickActions/medical_rx.png";
import WellnessImg from "../assets/QuickActions/Wellness.png";

const QuickActionCards = () => {
  const cards = [
    {
      id: 1,
      image: safeImg,
      alt: "Safe & Certified Healthcare",
      ariaLabel: "Safe and Certified Healthcare. Click to read about our safety standards."
    },
    {
      id: 2,
      image: essentialsImg,
      alt: "Daily Health Essentials",
      ariaLabel: "Daily Health Essentials. Click to shop essential health items."
    },
    {
      id: 3,
      image: medical_rxImg,
      alt: "Prescription Medicines & Refills",
      ariaLabel: "Prescription Medicines and Refills. Click to order prescription drugs."
    },
    {
      id: 4,
      image: WellnessImg,
      alt: "Wellness & Preventive Care",
      ariaLabel: "Wellness and Preventive Care. Click to view wellness products."
    },
  ];

  return (
    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full overflow-x-auto md:overflow-visible snap-x snap-mandatory">
      {cards.map((card) => (
        <a
          key={card.id}
          href="#"
          className="block w-[280px] md:w-full flex-shrink-0 snap-start"
          aria-label={card.ariaLabel}
        >
          <div className="w-full aspect-[340/95] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <img
              src={card.image}
              alt={card.alt}
              className="w-full h-full block object-fill object-center select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
