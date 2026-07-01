import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const hasImage = category.image && category.image.trim() !== "";

  return (
    <Link
      to="/products"
      className="flex-none w-32 snap-start group cursor-pointer active:scale-95 transition-all duration-200"
    >
      {/* Image / Icon Container */}
      <div className="aspect-square rounded-xl overflow-hidden mb-sm shadow-sm border border-outline-variant/30 dark:border-zinc-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center group-hover:shadow-md group-hover:scale-[1.03] group-hover:-translate-y-0.5 transition-all duration-200">
        {hasImage ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
            onError={(e) => {
              // If image fails to load, hide it and show icon fallback
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        {/* Icon fallback — always in DOM, hidden when image loads successfully */}
        <span
          className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-4xl group-hover:scale-110 transition-transform"
          style={{ display: hasImage ? "none" : "block" }}
        >
          {category.icon || "category"}
        </span>
      </div>

      {/* Category Name */}
      <p className="text-center font-label-md text-label-md text-on-surface dark:text-on-surface group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors leading-snug px-1">
        {category.name}
      </p>
    </Link>
  );
};

export default CategoryCard;
