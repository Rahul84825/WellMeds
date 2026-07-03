import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  Search, 
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Dynamic data from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 28;

  // Category filter from URL (?category=...)
  const categoryParam = searchParams.get("category") || "";

  // Search states
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");

  // SEO setup
  useEffect(() => {
    document.title = categoryParam
      ? `${categoryParam} | WellMeds`
      : "Clinical Drug Catalog | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Shop authentic prescription medicines and healthcare products online at WellMeds.");
  }, [categoryParam]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
      // Sync search param to URL, preserve category
      const newParams = {};
      if (searchVal.trim()) newParams.search = searchVal;
      if (categoryParam) newParams.category = categoryParam;
      setSearchParams(Object.keys(newParams).length ? newParams : {});
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal, setSearchParams, categoryParam]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
        category: categoryParam || undefined,
        productType: "medicine",
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryParam]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const showingStart = totalProducts > 0 ? (currentPage - 1) * limit + 1 : 0;
  const showingEnd = Math.min(currentPage * limit, totalProducts);

  // Generate page numbers to show
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

  return (
    <div className="max-w-7xl mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs & Header */}
      <div className="mb-lg">
        <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
          <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
          <span className="text-slate-300">/</span>
          <span
            className="cursor-pointer hover:text-[#038076] transition-colors"
            onClick={() => navigate("/products")}
          >
            Products
          </span>
          {categoryParam && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-[#038076] dark:text-[#a4c9ff]">{categoryParam}</span>
            </>
          )}
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
          <div>
            <h1 className="font-extrabold text-3xl md:text-4xl text-slate-800 dark:text-zinc-100 tracking-tight">
              {categoryParam ? categoryParam : "All Products"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {categoryParam
                ? `Showing all products in the "${categoryParam}" category.`
                : "Secure prescription verification, authentic formulations, and express doorstep delivery."}
            </p>
          </div>
          {categoryParam && (
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-xs text-[11px] font-bold text-[#038076] border border-[#038076]/30 bg-[#038076]/5 hover:bg-[#038076]/10 px-md py-xs rounded-full transition-all select-none"
            >
              <X size={12} />
              Clear Category Filter
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Search & Count */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl p-md shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
        <div className="flex items-center gap-sm flex-wrap">
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-300">
            {totalProducts > 0 ? (
              <>
                Showing <span className="font-extrabold text-slate-800 dark:text-zinc-100">{showingStart}–{showingEnd}</span> of <span className="font-extrabold text-slate-800 dark:text-zinc-100">{totalProducts}</span> Products
              </>
            ) : (
              "0 Products Found"
            )}
          </p>
          {/* Active category filter chip */}
          {categoryParam && (
            <span className="inline-flex items-center gap-xs text-[10px] font-bold text-[#038076] bg-[#038076]/8 border border-[#038076]/25 px-sm py-0.5 rounded-full">
              {categoryParam}
              <button
                onClick={() => navigate("/products")}
                className="hover:text-red-500 transition-colors"
                aria-label="Clear category filter"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search name, brand, description..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-xl pr-md py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#038076] rounded-xl text-xs outline-none transition-all"
          />
          {searchVal && (
            <button 
              onClick={() => setSearchVal("")}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md w-full">
          {products.map((prod) => (
            <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-md animate-pulse">inventory_2</span>
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Products Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            We couldn't find any medical supplies matching your search.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-lg select-none text-xs font-bold text-slate-400 mt-lg">
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage(pNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  currentPage === pNum
                    ? "bg-[#038076] text-white shadow-md shadow-[#038076]/10"
                    : "hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-500"
                }`}
              >
                {pNum}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
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

export default ProductsPage;
