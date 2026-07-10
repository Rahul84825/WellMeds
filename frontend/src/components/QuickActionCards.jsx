import React from "react";
import talkImg from "../assets/QuickActions/Talk.jpeg";
import chronicCareImg from "../assets/QuickActions/chronic-care.jpeg";
import coldChainImg from "../assets/QuickActions/cold-chain.jpeg";
import surgeryImg from "../assets/QuickActions/surgery.jpeg";

const QuickActionCards = () => {
  const cards = [
    { id: 1, image: talkImg, alt: "Talk to Pharmacist", ratio: "1358 / 279" },
    { id: 2, image: chronicCareImg, alt: "Chronic Care Services", ratio: "1347 / 279" },
    { id: 3, image: coldChainImg, alt: "Cold Chain Logistics", ratio: "1355 / 281" },
    { id: 4, image: surgeryImg, alt: "Surgical Products", ratio: "1362 / 279" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card) => (
        <a
          key={card.id}
          href="#"
          className="block cursor-pointer w-full hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "stretch",
            overflow: "hidden",
            borderRadius: "24px",
            width: "100%",
            aspectRatio: card.ratio,
            cursor: "pointer",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            backgroundColor: "transparent",
            padding: 0,
            margin: 0,
          }}
        >
          <img
            src={card.image}
            alt={card.alt}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
