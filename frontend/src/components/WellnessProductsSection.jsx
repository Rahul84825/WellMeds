import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/api/productService";
import ProductCard from "./ProductCard";
import Loader from "./Loader";

const WellnessProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWellness = async () => {
      try {
        setLoading(true);
        // Query the backend for products matching the productType "wellness"
        const data = await productService.getProducts({ productType: "wellness", limit: 8 });
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load wellness products", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWellness();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-14 home-section-container flex justify-center items-center">
        <Loader size="md" />
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-14 home-section-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-2">
        <div className="text-left">
          <h2 className="font-headline-md text-headline-md text-on-surface">Wellness Products</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Carefully selected wellness essentials for everyday health.
          </p>
        </div>
        <Link 
          to="/products?productType=wellness" 
          className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline flex items-center gap-xs shrink-0 self-start md:self-auto"
        >
          <span>Browse Wellness</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px] md:gap-6">
        {products.map((prod) => (
          <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default WellnessProductsSection;
