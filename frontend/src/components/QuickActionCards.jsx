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
    <>
      <div className="quick-actions-container">
        {cards.map((card) => (
          <a
            key={card.id}
            href="#"
            className="quick-action-card-link"
            aria-label={card.ariaLabel}
          >
            <div className="quick-action-card">
              <img
                src={card.image}
                alt={card.alt}
                className="quick-action-img"
                loading="lazy"
              />
            </div>
          </a>
        ))}
      </div>

      <style>{`
        /* Container layout */
        .quick-actions-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Link Wrapper */
        .quick-action-card-link {
          display: block;
          text-decoration: none;
          outline: none;
          box-sizing: border-box;
          width: 100%;
        }

        /* Card Shell */
        .quick-action-card {
          width: 100%;
          aspect-ratio: 340 / 95; /* Strict 340x95 ratio */
          display: flex;
          flex-direction: column;
          background: transparent;
          border-radius: 16px;
          overflow: hidden; /* clips image to rounded corners */
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
          padding: 0;
          margin: 0;
          border: none;
        }

        /* Hover & Focus state */
        .quick-action-card-link:hover .quick-action-card {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }

        .quick-action-card-link:focus-visible .quick-action-card {
          outline: 3px solid #038076;
          outline-offset: 4px;
        }

        /* Image element - fills card completely */
        .quick-action-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          padding: 0;
          margin: 0;
          border: none;
        }

        /* Tablet responsiveness (2 cards per row, same ratio) */
        @media (max-width: 1024px) and (min-width: 768px) {
          .quick-actions-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        /* Mobile responsiveness (horizontal scroll track / swipe carousel, same ratio) */
        @media (max-width: 767px) {
          .quick-actions-container {
            display: flex;
            flex-direction: row;
            gap: 16px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 12px;
            padding-top: 4px;
            padding-left: 4px;
            padding-right: 4px;
            scrollbar-width: none; /* Hide scrollbar for Firefox */
          }

          .quick-actions-container::-webkit-scrollbar {
            display: none; /* Hide scrollbar for Chrome/Safari */
          }

          .quick-action-card-link {
            flex-shrink: 0;
            scroll-snap-align: start;
            width: 280px; /* Peek next cards for clear swipe affordance */
          }
        }
      `}</style>
    </>
  );
};

export default QuickActionCards;
