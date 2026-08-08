import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";

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
  Droplet,
  Phone,
  ShoppingBag,
  RefreshCw,
  Search,
  Package
} from "lucide-react";

const WellnessPage = () => {
  const navigate = useNavigate();
  const { currentPage, setPage, searchParams, setSearchParams } = usePaginationUrl();
  const categoryParam = searchParams.get("category") || "All";

  // Data State
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Consultation Modal State
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Filtering & Pagination
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const limit = 20;

  // Sync selectedCategory with categoryParam changes
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
          setTotalProducts(data.totalProducts || data.total || 0);
          setTotalPages(data.totalPages || data.pages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch wellness products", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => { active = false; };
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

  const handleShopClick = () => {
    const gridEl = document.getElementById("wellness-catalog-start");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Wellness Storefront", url: "/wellness" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Premium Wellness Storefront | WellMeds Healthcare"
        description="Explore WellMeds dedicated wellness storefront. Shop authentic vitamins, natural supplements, premium personal care, and certified health devices online."
        canonical="/wellness"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">

        {/* ── 1. HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#b08d3e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            {/* Breadcrumb Nav */}
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <span className="cursor-pointer hover:text-[#157a6d] transition-colors" onClick={() => navigate("/")}>Home</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Wellness</span>
            </nav>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3.5 py-1.5 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>PREVENTATIVE HEALTH &amp; WELLNESS</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
                Wellness Essentials
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Discover carefully selected vitamins, supplements, personal care, and diagnostics designed for active preventative care and healthier living.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleShopClick}
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-7 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>Shop Wellness</span>
              </button>

            </div>
          </div>
        </div>

        {/* ── 2. FEATURED WELLNESS SELECTION ── */}
        {!featuredLoading && featuredProducts.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-clinical-mono text-[10px] font-bold text-[#157a6d] uppercase tracking-widest">
                  TOP RATED
                </span>
                <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#172b26] dark:text-white">
                  Featured Wellness Selection
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* ── 3. WELLNESS CATEGORIES ROW ── */}
        <div className="space-y-4 text-left" id="wellness-catalog-start">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#172b26] dark:text-white">
                Wellness Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Select a category to filter the wellness catalog.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${isSelected
                    ? "bg-[#157a6d] border-[#157a6d] text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    }`}
                >
                  <Icon size={14} className={isSelected ? "text-white" : "text-[#157a6d]"} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. WELLNESS CATALOG GRID OR SKELETONS ── */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-4 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-md w-1/2" />
                  <div className="h-8 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id || prod._id} product={prod} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                pageSize={limit}
                onPageChange={setPage}
                itemLabel="Wellness Formulations"
              />
            </div>
          ) : (
            /* Empty State Card */
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center mx-auto border border-emerald-200">
                <Package size={32} />
              </div>
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                No Wellness Products Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                We couldn't find any wellness formulations in the "{selectedCategory}" category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setSelectedCategory("All");
                  setPage(1);
                }}
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Show All Wellness Products</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 5. REUSABLE WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />

      </div>

      {/* ── 7. CONSULTATION MODAL INTEGRATION ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default WellnessPage;
