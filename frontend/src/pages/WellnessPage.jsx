import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ShieldCheck,
  TrendingUp,
  Apple,
  Heart,
  Droplet
} from "lucide-react";

const WellnessPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  
  // Data State
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filtering & Pagination
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Sync selectedCategory with categoryParam changes (e.g. from navbar link click)
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const wellnessCategories = [
    { name: "All", icon: Sparkles },
    { name: "Vitamins", icon: Apple },
    { name: "Supplements", icon: TrendingUp },
    { name: "Personal Care", icon: Droplet },
    { name: "First Aid", icon: ShieldCheck },
    { name: "Medical Devices", icon: Heart }
  ];

  // SEO Setup
  useEffect(() => {
    document.title = "Premium Wellness Storefront | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Explore our dedicated wellness storefront. Shop authentic vitamins, natural supplements, premium personal care, and certified health devices.");
  }, []);

  // Fetch Featured Wellness Products
  useEffect(() => {
    let active = true;
    const fetchFeatured = async () => {
      try {
        const data = await api.getProducts({
          productType: "wellness",
          page: 1,
          limit: 4
        });
        if (active) {
          setFeaturedProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load featured wellness", err);
      } finally {
        if (active) {
          setFeaturedLoading(false);
        }
      }
    };
    fetchFeatured();
    return () => { active = false; };
  }, []);

  // Fetch Wellness Products
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({
          page: currentPage,
          limit,
          productType: "wellness",
          category: selectedCategory === "All" ? undefined : selectedCategory
        });
        if (active) {
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch wellness products", err);
        if (active) {
          setLoading(false);
        }
      }
    };

    // Run asynchronously to prevent synchronous setState inside the render effect loop
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentPage, selectedCategory]);

  // Scroll to grid top when page changes
  useEffect(() => {
    if (currentPage > 1) {
      const gridEl = document.getElementById("wellness-catalog-start");
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const showingStart = totalProducts > 0 ? (currentPage - 1) * limit + 1 : 0;
  const showingEnd = Math.min(currentPage * limit, totalProducts);

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
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">Wellness</span>
      </nav>

      {/* HERO BANNER - Soft Wellness Gradient with Glassmorphism Details */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c5948] via-[#038076] to-[#40a390] text-white p-lg sm:p-xl md:p-xxl shadow-lg border border-[#038076]/20 mb-xl select-none">
        <div className="relative z-10 max-w-2xl space-y-md">
          <div className="inline-flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
            <Sparkles size={12} className="text-white animate-spin-slow" />
            Nourish &amp; Restore
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Nourish Your Body. <br className="hidden sm:inline" />
            Elevate Your Everyday Life.
          </h1>
          <p className="text-sm text-slate-100 font-medium leading-relaxed max-w-xl">
            Explore our curated wellness store. We supply pure vitamins, natural health supplements, premium personal care formulas, and medical diagnostics designed for active preventative care.
          </p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_60%)] pointer-events-none" />
      </div>

      {/* FEATURED WELLNESS SECTION */}
      {!featuredLoading && featuredProducts.length > 0 && (
        <section className="mb-xl animate-[fade-in_0.4s_ease-out]">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h2 className="font-extrabold text-xl md:text-2xl text-slate-800 dark:text-zinc-100 tracking-tight">
                Featured Wellness Selection
              </h2>
              <p className="text-xs text-slate-450 mt-1">Our top-rated nutritional supplements and personal care essentials.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* WELLNESS CATEGORIES ROW */}
      <section className="mb-lg select-none" id="wellness-catalog-start">
        <div className="mb-md">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base tracking-tight">
            Wellness Categories
          </h3>
          <p className="text-xs text-slate-400 mt-1">Select a category to filter the wellness catalog.</p>
        </div>
        <div className="flex flex-wrap gap-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          {wellnessCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  if (cat.name === "All") {
                    setSearchParams({});
                  } else {
                    setSearchParams({ category: cat.name });
                  }
                  setSelectedCategory(cat.name);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-xs px-lg py-sm rounded-xl border text-xs font-bold transition-all select-none cursor-pointer ${
                  isSelected
                    ? "bg-[#038076] border-[#038076] text-white shadow-md shadow-[#038076]/10"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:text-slate-700 dark:hover:text-zinc-200"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* WELLNESS PRODUCT GRID */}
      <main className="space-y-lg">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
            <Loader size="lg" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="flex items-center justify-between pb-sm">
              <p className="text-xs font-semibold text-slate-400">
                Showing <span className="font-extrabold text-slate-700 dark:text-zinc-250">{showingStart}–{showingEnd}</span> of <span className="font-extrabold text-slate-700 dark:text-zinc-250">{totalProducts}</span> Wellness Products
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md">
              {products.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
            <Sparkles className="mx-auto text-slate-300 dark:text-zinc-700 mb-md animate-pulse" size={48} />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Wellness Products Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
              We couldn't find any wellness formulations in the "{selectedCategory}" category.
            </p>
          </div>
        )}

        {/* PAGINATION */}
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
      </main>
    </div>
  );
};

export default WellnessPage;
