import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight, 
  PackageX,
  Sparkles
} from "lucide-react";
import SEO from "../components/common/SEO";

const GLP1MedicinesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const currentPage = pageParam;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        isGLP1Medicine: true,
        page: currentPage,
        limit: limit,
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch GLP-1 medicines", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (pageNum) => {
    setSearchParams({ page: pageNum });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "GLP-1 Medicines", url: "/glp-1-medicines" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <SEO
        title="GLP-1 Medicines for Diabetes & Weight Loss | WellMeds"
        description="Browse GLP-1 medicines for diabetes management and weight loss available at WellMeds. Authentic prescription formulations and cold-chain shipping."
        canonical="/glp-1-medicines"
        breadcrumbs={breadcrumbs}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <Link to="/" className="hover:text-[#004782] transition-colors">Home</Link>
        <span className="text-slate-300">/</span>
        <span className="text-[#004782] dark:text-[#a4c9ff]">GLP-1 Medicines</span>
      </nav>

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#002b55] via-[#004782] to-[#038076] text-white p-lg sm:p-xl md:p-xxl mb-lg shadow-lg border border-white/10">
        <div className="relative z-10 max-w-2xl space-y-xs">
          <div className="inline-flex items-center gap-xs px-md py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-teal-200 border border-white/20 mb-xs">
            <Sparkles size={14} />
            <span>Curated Collection</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
            GLP-1 Medicines for Diabetes &amp; Weight Loss
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            Browse authentic GLP-1 receptor agonist formulations for diabetes management and clinically-guided weight management, verified by licensed pharmacists.
          </p>
        </div>
      </div>

      {/* Product Grid / Empty State */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Showing {products.length} of {totalProducts} Products</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md w-full">
            {products.map((prod) => (
              <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-xxl px-md bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <PackageX className="mx-auto text-slate-300 dark:text-zinc-600 mb-sm" size={48} />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
            No products are currently available in this category.
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            Check back soon or search our catalog for alternative clinical formulations.
          </p>
          <Link
            to="/products"
            className="inline-block mt-md bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs hover:bg-[#003666] transition-colors"
          >
            Explore All Products
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-lg select-none text-xs font-bold text-slate-400 mt-lg">
          <div className="flex items-center gap-xs">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          <div className="flex items-center gap-xs">
            {getPageNumbers().map((pNum) => (
              <button
                key={pNum}
                onClick={() => handlePageChange(pNum)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === pNum
                    ? "bg-[#004782] text-white font-bold shadow-xs"
                    : "border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-600 dark:text-zinc-300"
                }`}
              >
                {pNum}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-xs">
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GLP1MedicinesPage;
