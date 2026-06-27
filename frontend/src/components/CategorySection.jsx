import React from "react";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import CategoryCard from "./CategoryCard";
import Loader from "./Loader";

export const CategorySection = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="py-xl bg-surface-container-lowest dark:bg-surface-container-high transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-desktop py-lg flex justify-center items-center">
          <Loader size="md" />
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-xl bg-surface-container-lowest dark:bg-surface-container-high transition-colors duration-300">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Shop by Category</h2>
          <Link to="/products" className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline">
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto pb-md gap-md no-scrollbar snap-x custom-scrollbar">
          {categories.map((cat) => (
            <CategoryCard key={(cat._id || cat.id)?.toString()} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
