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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="All Surgical Products & Medical Equipment | WellMeds"
        description="Shop clinical-grade surgical instruments, diagnostic equipment, sterile dressings, and hospital supplies online at WellMeds."
        canonical="/surgical/all"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            All Surgical Products
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── PRODUCT GRID OR SKELETONS ── */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-300 dark:border-zinc-800 p-4 space-y-3 animate-pulse">
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
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
                <Package size={36} className="mx-auto text-slate-400" />
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Surgical Products Found</h3>
                <p className="text-xs text-slate-500 font-sans">We couldn't find any products in our surgical catalogue at the moment.</p>
              </div>
            )}
          </div>

          {/* ── WHY WELLMEDS BAR ── */}
          <WhyWellMedsBar />
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
