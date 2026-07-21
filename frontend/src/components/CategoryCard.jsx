import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category, isSurgical = false, basePath }) => {
  const hasImage = Boolean(category.image?.trim());
  const linkTarget = basePath
    ? `${basePath}${category.slug}`
    : isSurgical
    ? `/surgical/${category.slug}`
    : category.slug
    ? `/category/${category.slug}`
    : `/products?category=${encodeURIComponent(category.name)}`;

  return (
    <>
      <Link
        to={linkTarget}
        aria-label={`Browse ${category.name} products`}
        className="category-card-link flex-none flex flex-col items-center group snap-start"
        style={{ textDecoration: "none" }}
      >
        {/*
          Perfect square card layout.
          The image occupies the complete card area with cover aspect ratio.
        */}
        <div className="category-card">

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
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = "flex";
                  }
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
        
        {/* Title below the card */}
        <h3 className="category-card-title">
          {category.name}
        </h3>
      </Link>

      <style>{`
        /* ── Card shell ── */
        .category-card {
          width: 170px;
          aspect-ratio: 1 / 1;
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
          background: #ffffff;
          padding: 0;
          box-sizing: border-box;
        }

        /* ── Image itself — cover so it fills the box ── */
        .category-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
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

        /* ── Title below card ── */
        .category-card-title {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          text-align: center;
          width: 100%;
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          transition: color 200ms ease;
        }
        .category-card-link:hover .category-card-title {
          color: #038076;
        }

        /* ── Mobile Layout Optimization (≤768px) ── */
        @media (max-width: 768px) {
          .category-card-link {
            width: 110px !important;
            min-width: 110px !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .category-card {
            width: 110px !important;
            height: 110px !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 16px !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
          }
          .category-img-wrap {
            height: 100% !important;
            width: 100% !important;
            padding: 8px !important; /* Premium consistent padding */
            background: #ffffff !important;
          }
          .category-card-img {
            object-fit: contain !important; /* Prevent crop and stretching */
            width: 100% !important;
            height: 100% !important;
          }
          .category-card-title {
            display: block !important;
            margin-top: 8px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #475569 !important; /* Balanced slate-600 */
            text-align: center !important;
            width: 100% !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>
    </>
  );
};

export default CategoryCard;