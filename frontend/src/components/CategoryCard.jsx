import React from "react";
import { Link } from "react-router-dom";

/**
 * Soft pastel medical theme palette — rotates by index.
 * Light enough to blend with white-background product images.
 */
const PASTEL_THEMES = [
  {
    bg: "linear-gradient(145deg, #f0faf7 0%, #e6f7f3 100%)",
    border: "#c8ede4",
    imgBg: "linear-gradient(135deg, #f7fdfb 0%, #edf8f4 100%)",
    imgShadow: "rgba(134, 210, 189, 0.18)",
    accent: "#0e9f7e",
  },
  {
    bg: "linear-gradient(145deg, #eff6ff 0%, #e5f0ff 100%)",
    border: "#c2d9f9",
    imgBg: "linear-gradient(135deg, #f5f9ff 0%, #ebf3ff 100%)",
    imgShadow: "rgba(96, 165, 250, 0.18)",
    accent: "#2563eb",
  },
  {
    bg: "linear-gradient(145deg, #fff7ed 0%, #fef3e2 100%)",
    border: "#fde4b8",
    imgBg: "linear-gradient(135deg, #fffbf5 0%, #fef6e6 100%)",
    imgShadow: "rgba(251, 191, 36, 0.18)",
    accent: "#d97706",
  },
  {
    bg: "linear-gradient(145deg, #fdf4ff 0%, #f8ecff 100%)",
    border: "#e9c9f9",
    imgBg: "linear-gradient(135deg, #fdf8ff 0%, #f9eeff 100%)",
    imgShadow: "rgba(192, 132, 252, 0.18)",
    accent: "#9333ea",
  },
  {
    bg: "linear-gradient(145deg, #ecfeff 0%, #e0f7fa 100%)",
    border: "#b8e8f0",
    imgBg: "linear-gradient(135deg, #f5feff 0%, #e7f9fd 100%)",
    imgShadow: "rgba(34, 211, 238, 0.18)",
    accent: "#0891b2",
  },
  {
    bg: "linear-gradient(145deg, #f0fdf4 0%, #e8faf0 100%)",
    border: "#bbf0cd",
    imgBg: "linear-gradient(135deg, #f6fff9 0%, #edfbf3 100%)",
    imgShadow: "rgba(52, 211, 153, 0.18)",
    accent: "#059669",
  },
  {
    bg: "linear-gradient(145deg, #fffbf0 0%, #fdf8e6 100%)",
    border: "#f3e8b2",
    imgBg: "linear-gradient(135deg, #fffef5 0%, #fefbec 100%)",
    imgShadow: "rgba(234, 179, 8, 0.18)",
    accent: "#ca8a04",
  },
  {
    bg: "linear-gradient(145deg, #f0f4ff 0%, #e8eeff 100%)",
    border: "#c4cffa",
    imgBg: "linear-gradient(135deg, #f5f7ff 0%, #ecefff 100%)",
    imgShadow: "rgba(99, 102, 241, 0.18)",
    accent: "#4f46e5",
  },
];

const CategoryCard = ({ category, index = 0 }) => {
  const theme = PASTEL_THEMES[index % PASTEL_THEMES.length];
  const hasImage = category.image && category.image.trim() !== "";
  const categoryId = (category._id || category.id || "").toString();

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      aria-label={`Browse ${category.name} products`}
      className="category-card-link flex-none snap-start"
      style={{ textDecoration: "none" }}
    >
      <div
        className="category-card group"
        style={{
          width: "175px",
          minHeight: "200px",
          background: theme.bg,
          border: `1.5px solid ${theme.border}`,
          borderRadius: "28px",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px) scale(1.03)";
          e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
        }}
      >
        {/* Subtle corner decorative circle */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-18px",
            right: "-18px",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: theme.border,
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />

        {/* Image Container */}
        <div
          className="category-img-container"
          style={{
            width: "100%",
            height: "105px",
            background: theme.imgBg,
            borderRadius: "18px",
            border: `1px solid ${theme.border}`,
            boxShadow: `inset 0 2px 8px ${theme.imgShadow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            transition: "transform 300ms ease",
          }}
        >
          {hasImage ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              draggable={false}
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain",
                transition: "transform 300ms ease",
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
              gap: "4px",
              color: theme.accent,
              opacity: 0.7,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "42px" }}
            >
              {category.icon || "category"}
            </span>
          </div>
        </div>

        {/* Category Name */}
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#1e293b",
            textAlign: "center",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: 0,
            padding: "0 4px",
            letterSpacing: "-0.01em",
            transition: "color 300ms ease",
          }}
          className="category-card-name"
        >
          {category.name}
        </p>
      </div>

      {/* Inline hover style for image and name via CSS class */}
      <style>{`
        .category-card:hover .category-card-img {
          transform: scale(1.06);
        }
        .category-card:hover .category-card-name {
          color: #038076;
        }
        .category-card:focus-visible {
          outline: 3px solid #038076;
          outline-offset: 4px;
          border-radius: 28px;
        }
        @media (max-width: 640px) {
          .category-card {
            width: 148px !important;
            min-height: 180px !important;
          }
          .category-img-container {
            height: 90px !important;
          }
        }
      `}</style>
    </Link>
  );
};

export default CategoryCard;
