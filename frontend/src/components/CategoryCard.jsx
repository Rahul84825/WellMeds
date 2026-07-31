import React from "react";
import { Link } from "react-router-dom";

/**
 * CategoryCard — WellMeds Design System V2
 * Editorial clinical category item card.
 */
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
      className="flex-none flex flex-col items-center group snap-start w-[110px] sm:w-[130px] md:w-[145px]"
      style={{ textDecoration: "none" }}
    >
      <div className="w-full aspect-square rounded-xl bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 p-0 flex items-center justify-center relative overflow-hidden group-hover:border-[#157a6d] group-hover:shadow-[0_8px_24px_rgba(23,43,38,0.08)] transition-all duration-250">
        {/* Soft mint inner background glow */}
        <div className="absolute inset-0 bg-[#f4f9f7] dark:bg-zinc-950 group-hover:bg-[#e7f0ea] dark:group-hover:bg-zinc-800/60 transition-colors duration-250" />
        
        {hasImage ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="relative z-10 w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-110"
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
          <span
            className="material-symbols-outlined text-3xl sm:text-4xl text-[#157a6d] opacity-80 group-hover:scale-110 transition-transform"
          >
            {category.icon || "medical_services"}
          </span>
        </div>
      </div>

      {/* Category Name */}
      <h3 className="mt-2.5 font-editorial text-xs sm:text-sm font-medium text-[#172b26] dark:text-zinc-200 text-center leading-tight line-clamp-2 group-hover:text-[#157a6d] transition-colors">
        {category.name}
      </h3>
    </Link>
  );
};

export default React.memo(CategoryCard);