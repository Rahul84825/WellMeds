import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const hasImage = Boolean(category.image?.trim());

  return (
    <>
      <Link
        to={`/products?category=${encodeURIComponent(category.name)}`}
        aria-label={`Browse ${category.name} products`}
        className="category-card-link flex-none snap-start"
        style={{ textDecoration: "none" }}
      >
        {/*
          Fixed card height = 210px on desktop, 190px on mobile.
          The image now occupies the entire card area.
        */}
        <div className="category-card" style={{ width: "170px" }}>

          {/* ── Image area — full-bleed, no padding, fills the entire card ── */}
          <div className="category-img-wrap">
            {hasImage ? (
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                draggable={false}
                className="category-card-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback icon */}
            <div
              aria-hidden="true"
              className="category-card-fallback"
              style={{ display: hasImage ? "none" : "flex" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "40px", color: "#038076", opacity: 0.7 }}
              >
                {category.icon || "category"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <style>{`
        /* ── Card shell ── */
        .category-card {
          height: 210px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;                       /* clips image to rounded corners  */
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 250ms cubic-bezier(0.4,0,0.2,1),
                      box-shadow 250ms ease,
                      border-color 250ms ease;
          box-sizing: border-box;
        }
        .category-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 28px rgba(3,128,118,0.13);
          border-color: #038076;
        }
        .category-card:focus-visible {
          outline: 3px solid #038076;
          outline-offset: 4px;
        }

        /* ── Image wrap — fills entire card height ── */
        .category-img-wrap {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        /* ── Image itself — cover so it fills the box ── */
        .category-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 280ms ease;
        }
        .category-card:hover .category-card-img {
          transform: scale(1.06);
        }

        /* ── Fallback ── */
        .category-card-fallback {
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        /* ── Mobile: 2-column grid ── */
        @media (max-width: 640px) {
          .category-card-link {
            width: calc((100% - 12px) / 2) !important;
            min-width: 0 !important;
            flex-shrink: 0 !important;
          }
          .category-card {
            width: 100% !important;
            height: 190px !important;
          }
          .category-img-wrap {
            height: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default CategoryCard;