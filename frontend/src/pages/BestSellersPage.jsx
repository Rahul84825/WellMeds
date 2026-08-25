import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Phone,
  FileText,
  Package,
  Award
} from "lucide-react";

const BestSellersPage = () => {
  const { currentPage, setPage } = usePaginationUrl();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const limit = 20;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        isBestSeller: true,
        page: currentPage,
        limit: limit,
      });
      setProducts(data.products || []);
      setTotalProducts(data.totalProducts || data.total || 0);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (err) {
      console.error("Failed to load best sellers", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Best Sellers", url: "/best-sellers" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Best Selling Prescription Medicines & Healthcare Products | WellMeds"
        description="Shop top-rated, most prescribed medicines and healthcare essentials delivered nationwide by WellMeds licensed pharmacy."
        canonical="/best-sellers"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Best Selling Products
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
                pageSize={limit}
                onPageChange={setPage}
                itemLabel="Best Sellers"
              />
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Package size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Products Found</h3>
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

export default BestSellersPage;
