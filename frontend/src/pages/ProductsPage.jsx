import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  Search, 
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FlaskConical
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

  // Speciality filter from URL (?speciality=...)
  const specialityParam = searchParams.get("speciality") || "";

  // Search states
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");

  // Molecule search state
  const [matchedMolecules, setMatchedMolecules] = useState([]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setMatchedMolecules([]);
      return;
    }
    const fetchMolecules = async () => {
      try {
        const list = await api.getMolecules({ search: debouncedSearch });
        setMatchedMolecules(list || []);
      } catch (err) {
        console.error("Failed to fetch matching molecules in search results", err);
      }
    };
    fetchMolecules();
  }, [debouncedSearch]);

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
      // Sync search param to URL, preserve category & speciality
      const newParams = {};
      if (searchVal.trim()) newParams.search = searchVal;
      if (categoryParam) newParams.category = categoryParam;
      if (specialityParam) newParams.speciality = specialityParam;
      setSearchParams(Object.keys(newParams).length ? newParams : {});
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal, setSearchParams, categoryParam, specialityParam]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
        category: categoryParam || undefined,
        speciality: specialityParam || undefined,
        productType: "medicine",
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryParam, specialityParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when search query, category, or speciality changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryParam, specialityParam]);

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



      {/* Matching Molecules Widget */}
      {!loading && matchedMolecules.length > 0 && (
        <div className="bg-gradient-to-r from-[#038076]/5 to-[#004782]/5 border border-[#038076]/25 rounded-2xl p-md mb-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center border border-[#038076]/15 shrink-0">
              <FlaskConical size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-slate-800 dark:text-zinc-150 text-xs tracking-tight uppercase">Molecules Found</h4>
              <p className="text-[11px] text-slate-400">Click a matching active ingredient to explore detailed clinical pages and brand comparison matrices.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-xs">
            {matchedMolecules.map((mol) => (
              <Link
                key={mol.id || mol._id}
                to={`/molecule/${mol.slug}`}
                className="inline-flex items-center gap-xs px-md py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-650 dark:text-zinc-200 hover:border-[#038076]/30 hover:text-[#038076] transition-all font-bold text-xs select-none shadow-xs"
              >
                {mol.name}
              </Link>
            ))}
          </div>
        </div>
      )}

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
