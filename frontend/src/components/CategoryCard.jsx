import React from "react";
import { Link } from "react-router-dom";

/**
 * CategoryCard — WellMeds Design System V2
 * Reusable white card component used across Medicine Categories & Surgical Categories.
 */
const CategoryCard = ({ category, isSurgical = false, basePath }) => {
  if (!category) return null;

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
      className="flex-none flex flex-col items-center group snap-start w-[110px] sm:w-[135px] md:w-[155px]"
      style={{ textDecoration: "none" }}
    >
      <div className="w-full aspect-square rounded-2xl bg-white dark:bg-zinc-900 border border-[#E8ECEF] dark:border-zinc-800 p-0 flex items-center justify-center relative overflow-hidden shadow-2xs">
        {/* Soft background */}
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-zinc-950" />

        {hasImage ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="relative z-10 w-full h-full object-cover select-none"
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
          className="relative z-10 items-center justify-center"
          style={{ display: hasImage ? "none" : "flex" }}
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#157a6d] opacity-80">
            {category.icon || "medical_services"}
          </span>
        </div>
      </div>

      {/* Category Name */}
      <h3 className="mt-2.5 font-editorial text-xs sm:text-sm font-medium text-[#172b26] dark:text-zinc-200 text-center leading-tight line-clamp-2">
        {category.name}
      </h3>
    </Link>
  );
};

export default React.memo(CategoryCard);