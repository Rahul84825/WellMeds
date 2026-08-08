import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import MedicineNotFound from "../components/MedicineNotFound";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";

import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FlaskConical,
  Sparkles,
  Phone,
  FileText,
  Package,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle
} from "lucide-react";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { currentPage, setPage, searchParams, setSearchParams } = usePaginationUrl();

  // Dynamic data from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Consultation Modal State
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const limit = 20;

  // Category & Speciality filters from URL
  const categoryParam = searchParams.get("category") || "";
  const specialityParam = searchParams.get("speciality") || "";
  const brandParam = searchParams.get("brand") || "";
  const moleculeParam = searchParams.get("molecule") || "";

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
      const newParams = new URLSearchParams(searchParams);
      if (searchVal.trim()) newParams.set("search", searchVal);
      else newParams.delete("search");
      setSearchParams(newParams, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal, setSearchParams, searchParams]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const isGLP1Param = searchParams.get("isGLP1Medicine");
      const isSuppParam = searchParams.get("isHealthSupplement");
      const isBestSellerParam = searchParams.get("isBestSeller");
      const isSurgParam = searchParams.get("isSurgical");
      const prodTypeParam = searchParams.get("productType");

      const data = await api.getProducts({
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
        category: categoryParam || undefined,
        speciality: specialityParam || undefined,
        brand: brandParam || undefined,
        molecule: moleculeParam || undefined,
        productType: prodTypeParam || undefined,
        isGLP1Medicine: isGLP1Param === "true" ? true : undefined,
        isHealthSupplement: isSuppParam === "true" ? true : undefined,
        isBestSeller: isBestSellerParam === "true" ? true : undefined,
        isSurgical: isSurgParam === "true" ? true : undefined,
      });
      setProducts(data.products || []);
      setTotalProducts(data.totalProducts || data.total || 0);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryParam, specialityParam, brandParam, moleculeParam, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const pageTitle = categoryParam
    ? `${categoryParam} Medicines & Formulations | WellMeds`
    : specialityParam
      ? `${specialityParam} Medications | WellMeds`
      : "Shop Prescription Medicines & Healthcare Catalog | WellMeds";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
  ];
  if (categoryParam) breadcrumbs.push({ name: categoryParam, url: `/products?category=${encodeURIComponent(categoryParam)}` });

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={pageTitle}
        description="Browse authentic prescription medicines, chronic disease care, vitamins, and healthcare products online at WellMeds. Licensed pharmacy fulfillment and express delivery across India."
        canonical="/products"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">

        {/* ── 1. HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#b08d3e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            {/* Breadcrumb nav */}
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <span className="cursor-pointer hover:text-[#157a6d] transition-colors" onClick={() => navigate("/")}>Home</span>
              <span className="text-slate-300">/</span>
              <span className="cursor-pointer hover:text-[#157a6d] transition-colors" onClick={() => navigate("/products")}>Products</span>
              {categoryParam && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-[#157a6d] dark:text-emerald-400">{categoryParam}</span>
                </>
              )}
              {specialityParam && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-[#157a6d] dark:text-emerald-400">{specialityParam}</span>
                </>
              )}
            </nav>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3.5 py-1.5 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL DRUG CATALOG</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
                {categoryParam ? categoryParam : specialityParam ? specialityParam : "Explore Medicines"}
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Explore thousands of genuine prescription medicines, specialty therapies, surgical products, and wellness formulations with guaranteed cold-chain integrity.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. MATCHING MOLECULES WIDGET ── */}
        {!loading && matchedMolecules.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 shrink-0">
                <FlaskConical size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider font-clinical-mono">
                  Matching Active Ingredients
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Click a molecule to view detailed clinical guidelines and brand comparison matrices.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedMolecules.map((mol) => (
                <Link
                  key={mol.id || mol._id}
                  to={`/molecule/${mol.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f9f7] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-slate-700 dark:text-zinc-200 hover:border-[#157a6d] hover:text-[#157a6d] transition-all font-semibold text-xs shadow-xs"
                >
                  <FlaskConical size={12} className="text-[#157a6d]" />
                  <span>{mol.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. MAIN PRODUCT GRID OR LOADING SKELETONS ── */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 w-full">
                {products.map((prod) => (
                  <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                pageSize={limit}
                onPageChange={setPage}
                itemLabel="Products"
              />
            </div>
          ) : (searchVal || categoryParam || specialityParam || brandParam || moleculeParam) ? (
            <MedicineNotFound searchQuery={searchVal || categoryParam || specialityParam || brandParam || moleculeParam} />
          ) : (
            /* Empty State Card */
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center mx-auto border border-emerald-200">
                <Package size={32} />
              </div>
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                No Medicines Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                We couldn't find any medical supplies matching your active filter. Try broadening your criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  navigate("/products");
                }}
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 4. REUSABLE WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />

      </div>

      {/* ── 6. CONSULTATION MODAL INTEGRATION ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
