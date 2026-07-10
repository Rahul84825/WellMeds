import React from "react";
import talkImg from "../assets/QuickActions/Talk.jpeg";
import chronicCareImg from "../assets/QuickActions/chronic-care.jpeg";
import coldChainImg from "../assets/QuickActions/cold-chain.jpeg";
import surgeryImg from "../assets/QuickActions/surgery.jpeg";

const QuickActionCards = () => {
  const cards = [
    { id: 1, image: talkImg, alt: "Talk to Pharmacist" },
    { id: 2, image: chronicCareImg, alt: "Chronic Care Services" },
    { id: 3, image: coldChainImg, alt: "Cold Chain Logistics" },
    { id: 4, image: surgeryImg, alt: "Surgical Products" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card) => (
        <a
          key={card.id}
          href="#"
          className="block cursor-pointer w-full h-[90px]
                     rounded-2xl border border-[rgba(15,23,42,0.06)] dark:border-zinc-800/80 bg-white dark:bg-zinc-900
                     shadow-[0_6px_18px_rgba(15,23,42,0.08)] 
                     hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] 
                     hover:scale-[1.02]
                     transition-all duration-[250ms] ease-in-out 
                     overflow-hidden
                     dark:shadow-[0_6px_18px_rgba(0,0,0,0.4)]
                     dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
        >
          <img
            src={card.image}
            alt={card.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
              borderRadius: "inherit",
              overflow: "hidden",
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
