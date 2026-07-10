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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center w-full">
      {cards.map((card) => (
        <a
          key={card.id}
          href="#"
          className="group block cursor-pointer w-full max-w-[320px] md:w-80 h-[100px]
                     rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] 
                     hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] 
                     hover:scale-[1.03]
                     transition-all duration-[250ms] ease-in-out 
                     overflow-hidden
                     dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                     dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
        >
          <img
            src={card.image}
            alt={card.alt}
            className="transition-transform duration-[250ms] ease-in-out group-hover:scale-105"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
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
