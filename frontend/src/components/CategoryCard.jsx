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
          Fixed card height = 200px (image area) + 52px (name area) = 252px
          This keeps ALL cards the same height regardless of 1-line or 2-line titles.
        */}
        <div className="category-card" style={{ width: "170px" }}>

          {/* ── Image area — full-bleed, no padding, no inner border ── */}
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

          {/* ── Name area — fixed height so 1-line and 2-line cards align ── */}
          <div className="category-card-name-wrap">
            <p className="category-card-name">{category.name}</p>
          </div>
        </div>
      </Link>

      <style>{`
        /* ── Card shell ── */
        .category-card {
          height: 210px;                          /* fixed: image(158px) + name(52px) */
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

        /* ── Image wrap — fills top portion, no padding ── */
        .category-img-wrap {
          width: 100%;
          height: 158px;               /* ~75% of card height */
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        /* ── Image itself — cover so it fills the box like reference image 1 ── */
        .category-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;           /* full-bleed, matches reference 1        */
          object-position: center top; /* show faces/important area at top       */
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

        /* ── Name area — fixed height keeps all cards same total size ── */
        .category-card-name-wrap {
          height: 52px;                /* fixed regardless of 1 or 2 line title  */
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          border-top: 1px solid #f1f5f9;
        }

        .category-card-name {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
          letter-spacing: -0.01em;
          transition: color 250ms ease;
          width: 100%;
        }
        .category-card:hover .category-card-name {
          color: #038076;
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
            height: 138px !important;
          }
          .category-card-name-wrap {
            height: 52px !important;
          }
          .category-card-name {
            font-size: 11px !important;
          }
        }
      `}</style>
    </>
  );
};

export default CategoryCard;