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
    <Link
      to={linkTarget}
      aria-label={`Browse ${category.name} products`}
      className="category-card-link flex-none flex flex-col items-center group snap-start"
      style={{ textDecoration: "none" }}
    >
      <div className="category-card">
        <div className="category-img-wrap">
          {hasImage ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              decoding="async"
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
  );
};

export default React.memo(CategoryCard);