import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  FileText,
  Package,
  Scissors
} from "lucide-react";

const AllSurgicalProductsPage = () => {
  const navigate = useNavigate();
  const { currentPage, setPage } = usePaginationUrl();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        page: currentPage,
        limit: LIMIT,
        isSurgical: true,
        search: debouncedSearch || undefined,
        sortBy: sortBy,
      });

      setProducts(data.products || []);
      setTotalProducts(data.totalProducts || data.total || 0);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch surgical products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Surgical", url: "/surgical" },
    { name: "All Surgical Products", url: "/surgical/all" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="All Surgical Products & Medical Equipment | WellMeds"
        description="Shop clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and hospital supplies online at WellMeds."
        canonical="/surgical/all"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* ── HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <Link to="/" className="hover:text-[#157a6d]">Home</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <Link to="/surgical" className="hover:text-[#157a6d]">Surgical</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">All Products</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL SURGICAL SUPPLIES</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                All Surgical Products
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Browse hospital consumables, sterile dressings, surgical instruments, and diagnostic equipment certified for clinical use.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/upload-prescription"
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <FileText size={15} />
                <span>Upload Prescription</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 px-6 py-2.5 rounded-full text-xs font-semibold transition-all border border-slate-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={15} />
                <span>Talk to Pharmacist</span>
              </button>
            </div>
          </div>
        </div>



        {/* ── PRODUCT GRID OR SKELETONS ── */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-4 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((prod) => (
                  <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                pageSize={LIMIT}
                onPageChange={setPage}
                itemLabel="Surgical Items"
              />
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Package size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Surgical Products Found</h3>
              <p className="text-xs text-slate-500 font-sans">We couldn't find any surgical supplies matching your search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default AllSurgicalProductsPage;
