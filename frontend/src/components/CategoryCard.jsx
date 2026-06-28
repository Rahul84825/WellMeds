import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex-none w-32 snap-start group cursor-pointer active:scale-95 transition-transform"
    >
      <div className="aspect-square bg-surface-container dark:bg-surface-container-high rounded-xl flex items-center justify-center mb-sm group-hover:bg-primary-fixed dark:group-hover:bg-primary-fixed-dim transition-colors duration-200 shadow-sm border border-outline-variant/30">
        <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-4xl group-hover:scale-110 transition-transform">
          {category.icon}
        </span>
      </div>
      <p className="text-center font-label-md text-label-md text-on-surface dark:text-on-surface group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors">
        {category.name}
      </p>
    </Link>
  );
};

export default CategoryCard;
