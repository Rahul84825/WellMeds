import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  SlidersHorizontal,
  FolderOpen,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import SEO from "../components/common/SEO";

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  // Category & Data States
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [relatedCategories, setRelatedCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Filtering, Search & Sorting States
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [rxFilter, setRxFilter] = useState("all"); // 'all' | 'rx' | 'otc'
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'instock'
  const [selectedBrand, setSelectedBrand] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const LIMIT = 24;

  // Available brands extracted from returned products
  const [availableBrands, setAvailableBrands] = useState([]);

  // 1. Fetch Category Details & Related Categories
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryAndRelated = async () => {
      setLoadingCategory(true);
      try {
        const [catData, allCats] = await Promise.all([
          api.getCategory(categorySlug).catch(() => null),
          api.getCategories().catch(() => [])
        ]);

        if (!isMounted) return;

        if (catData) {
          setCategory(catData);

          // SEO Setup
          document.title = `${catData.name} Medicines & Formulations | WellMeds`;
          let metaDesc = document.querySelector("meta[name='description']");
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute(
            "content",
            catData.description || `Browse authentic clinical ${catData.name} prescription medicines and therapeutic treatments at WellMeds.`
          );
        } else {
          setCategory(null);
        }

        // Filter related active categories excluding current one
        const activeCats = (allCats || []).filter(
          (c) => c.status === "Active" || c.isActive === true
        );
        const filteredRelated = activeCats
          .filter((c) => c.slug !== categorySlug && c._id !== catData?._id)
          .slice(0, 8);
        setRelatedCategories(filteredRelated);

      } catch (err) {
        console.error("Failed to load category details", err);
      } finally {
        if (isMounted) setLoadingCategory(false);
      }
    };

    fetchCategoryAndRelated();
    setCurrentPage(1);
    setSearchVal("");
    setDebouncedSearch("");
  }, [categorySlug]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // 2. Fetch Products for this Category
  const fetchProducts = useCallback(async () => {
    if (!category) return;
    setLoadingProducts(true);
    try {
      const data = await api.getProducts({
        page: currentPage,
        limit: LIMIT,
        category: category.name || category.slug,
        search: debouncedSearch || undefined,
      });

      const fetchedList = data.products || [];
      setProducts(fetchedList);
      setTotalProducts(data.total || 0);

      // Extract unique brands for filter sidebar
      const brands = Array.from(
        new Set(fetchedList.map((p) => p.brand || p.manufacturer).filter(Boolean))
      );
      setAvailableBrands(brands);
    } catch (err) {
      console.error("Failed to fetch category products", err);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoadingProducts(false);
    }
  }, [category, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side Filtering & Sorting
  const getFilteredAndSortedProducts = () => {
    let list = [...products];

    // Filter Rx / OTC
    if (rxFilter === "rx") {
      list = list.filter((p) => p.requiresRx === true || p.isPrescriptionRequired === true);
    } else if (rxFilter === "otc") {
      list = list.filter((p) => !p.requiresRx && !p.isPrescriptionRequired);
    }

    // Filter In-Stock
    if (stockFilter === "instock") {
      list = list.filter((p) => p.inStock !== false && (p.stock === undefined || p.stock > 0));
    }

    // Filter Brand
    if (selectedBrand !== "all") {
      list = list.filter((p) => (p.brand || p.manufacturer) === selectedBrand);
    }

    // Sorting
    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const totalPages = Math.max(1, Math.ceil(totalProducts / LIMIT));

  if (loadingCategory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-md text-slate-400">
          <FolderOpen size={32} />
        </div>
        <h2 className="font-extrabold text-2xl text-slate-800 dark:text-zinc-100">Category Not Found</h2>
        <p className="text-xs text-slate-400 mt-xs mb-lg max-w-md mx-auto">
          The requested medicine category could not be located or may have been updated.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-xs bg-[#038076] text-white px-xl py-sm rounded-full font-bold text-xs shadow-md hover:bg-[#02665e] transition-colors"
        >
          Explore All Medicines
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <SEO
        title={`${category.name} Medicines & Healthcare Products`}
        description={category.description || `Browse authentic ${category.name} medicines, healthcare products, and pharmaceutical care online at WellMeds with fast doorstep delivery.`}
        keywords={`${category.name}, ${category.name} medicines, buy ${category.name} online, WellMeds`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Medicines", url: "/products" },
          { name: category.name, url: `/category/${categorySlug}` }
        ]}
      />
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-md font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/products")}>Medicines</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">{category.name}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#04332c] via-[#038076] to-[#004782] text-white p-lg sm:p-xl md:p-xxl shadow-xl border border-[#038076]/20 mb-xl select-none">
        <div className="relative z-10 max-w-3xl space-y-md text-left">
          <div className="inline-flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
            <Pill size={13} className="text-emerald-300" />
            Specialty Medicine Category
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed max-w-2xl opacity-95">
              {category.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-md pt-xs text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-md py-1.5 rounded-xl border border-white/10">
              <Sparkles size={14} className="text-emerald-300" />
              <span>{totalProducts} Verified Formulations</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-md py-1.5 rounded-xl border border-white/10">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>100% Genuine Clinical Guarantee</span>
            </div>
          </div>
        </div>

        {/* Decorative subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_60%)] pointer-events-none" />
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-md mb-lg">
        
        {/* Search within Category */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-md py-2.5 w-full max-w-md shadow-xs">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={`Search within ${category.name}...`}
            className="bg-transparent border-none outline-none w-full text-xs ml-xs dark:text-zinc-200 placeholder-slate-400 font-medium"
          />
          {searchVal && (
            <button onClick={() => setSearchVal("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Badges & Sort Dropdown */}
        <div className="flex items-center gap-sm flex-wrap shrink-0">
          {/* Rx Filter Toggle */}
          <select
            value={rxFilter}
            onChange={(e) => setRxFilter(e.target.value)}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer hover:border-[#038076] transition-colors"
          >
            <option value="all">All Types (Rx & OTC)</option>
            <option value="rx">Prescription Required (Rx)</option>
            <option value="otc">Over The Counter (OTC)</option>
          </select>

          {/* Sort Option */}
          <div className="flex items-center gap-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer"
            >
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="name_desc">Sort: Name (Z to A)</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Grid & Sidebar Layout */}
      {loadingProducts ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-xs">
          <Loader size="lg" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md w-full">
            {filteredProducts.map((prod) => (
              <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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

              <span>Page {currentPage} of {totalPages} ({totalProducts} Formulations)</span>

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
      ) : (
        /* Professional Empty State */
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-3xl shadow-xs p-xl">
          <div className="w-16 h-16 bg-[#038076]/10 text-[#038076] rounded-full flex items-center justify-center mx-auto mb-md">
            <Pill size={32} />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100">No Formulations Available in {category.name}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs mb-lg">
            We are continuously expanding our licensed pharmaceutical catalog. Check back soon or request a custom fulfillment.
          </p>
          <div className="flex items-center justify-center gap-sm">
            <Link
              to="/products"
              className="bg-[#038076] text-white px-lg py-2.5 rounded-full font-bold text-xs hover:bg-[#02665e] transition-colors"
            >
              Browse All Medicines
            </Link>
            <Link
              to="/upload-prescription"
              className="border border-[#038076] text-[#038076] px-lg py-2.5 rounded-full font-bold text-xs hover:bg-[#038076]/5 transition-colors"
            >
              Upload Prescription
            </Link>
          </div>
        </div>
      )}

      {/* Related Categories Grid */}
      {relatedCategories.length > 0 && (
        <section className="mt-2xl pt-xl border-t border-slate-150 dark:border-zinc-800">
          <div className="mb-lg">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-zinc-100 tracking-tight">
              Related Medical Conditions
            </h3>
            <p className="text-xs text-slate-400 mt-1">Explore complementary therapeutic areas and specialist medicines.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
            {relatedCategories.map((relCat) => (
              <Link
                key={relCat._id || relCat.id}
                to={`/category/${relCat.slug}`}
                className="flex items-center gap-sm p-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-[#038076] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#038076]/10 text-[#038076] flex items-center justify-center shrink-0 group-hover:bg-[#038076] group-hover:text-white transition-colors">
                  <Pill size={18} />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-[#038076] transition-colors truncate">
                    {relCat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">View Category &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default CategoryDetailPage;
