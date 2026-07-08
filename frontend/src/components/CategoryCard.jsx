import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category, index = 0 }) => {
  const hasImage = category.image && category.image.trim() !== "";

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      aria-label={`Browse ${category.name} products`}
      className="category-card-link flex-none snap-start"
      style={{ textDecoration: "none" }}
    >
      <div
        className="category-card"
        style={{
          width: "170px",
          height: "180px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms ease, border-color 250ms ease",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.06)";
          e.currentTarget.style.borderColor = "#038076";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.04)";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        {/* Dedicated Image Container (Top 70% of 180px height is ~114px) */}
        <div
          className="category-img-container"
          style={{
            width: "100%",
            height: "0px",
            flexGrow: 1,
            background: "#f8fafc",
            borderRadius: "14px",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "8px",
            boxSizing: "border-box"
          }}
        >
          {hasImage ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                objectPosition: "center",
                transition: "transform 250ms ease"
              }}
              className="category-card-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextSibling;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback icon — shown only when no image or image fails */}
          <div
            aria-hidden="true"
            style={{
              display: hasImage ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#038076",
              opacity: 0.7,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px" }}
            >
              {category.icon || "category"}
            </span>
          </div>
        </div>

        {/* Category Name */}
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#1e293b",
            textAlign: "center",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "8px 0 0",
            padding: "0 2px",
            letterSpacing: "-0.01em",
            transition: "color 250ms ease",
            width: "100%"
          }}
          className="category-card-name"
        >
          {category.name}
        </p>
      </div>

      {/* Styled css overrides for responsiveness & hover color transitions */}
      <style>{`
        .category-card:hover .category-card-img {
          transform: scale(1.04);
        }
        .category-card:hover .category-card-name {
          color: #038076;
        }
        .category-card:focus-visible {
          outline: 3px solid #038076;
          outline-offset: 4px;
          border-radius: 20px;
        }
        @media (max-width: 640px) {
          .category-card-link {
            width: calc((100% - 14px) / 2) !important;
            min-width: calc((100% - 14px) / 2) !important;
            flex-shrink: 0 !important;
          }
          .category-card {
            width: 100% !important;
            height: 170px !important;
            padding: 10px !important;
            border-radius: 16px !important;
          }
          .category-img-container {
            height: 0px !important;
            flex-grow: 1 !important;
            padding: 8px !important;
            border-radius: 12px !important;
          }
          .category-card-name {
            font-size: 12px !important;
            margin-top: 6px !important;
          }
        }
      `}</style>
    </Link>
  );
};

export default CategoryCard;
