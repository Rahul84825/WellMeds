import React from "react";
import { Link } from "react-router-dom";
import useFeaturedProducts from "../hooks/useFeaturedProducts";
import ProductCard from "./ProductCard";
import Loader from "./Loader";

export const FeaturedProductsSection = () => {
  const { featuredProducts, loading, error } = useFeaturedProducts();

  if (loading) {
    return (
      <section className="py-16 max-w-max-width mx-auto px-margin-desktop flex justify-center items-center">
        <Loader size="md" />
      </section>
    );
  }

  if (error || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 max-w-max-width mx-auto px-margin-desktop">
      <div className="flex items-center justify-between mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface">Best Sellers</h2>
        <Link to="/products" className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline flex items-center gap-xs">
          <span>Browse Products</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((prod) => (
          <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
