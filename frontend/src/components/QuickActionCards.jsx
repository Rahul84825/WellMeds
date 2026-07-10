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
          className="block cursor-pointer w-full hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
          style={{
            borderRadius: "24px",
            overflow: "hidden",
            display: "block",
            width: "100%",
            height: "auto",
            cursor: "pointer",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
        >
          <img
            src={card.image}
            alt={card.alt}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              display: "block",
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
