import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
import { Building2, Sparkles, Phone, FileText, ChevronRight, Package } from "lucide-react";

const BrandDetailPage = () => {
  const { brandSlug } = useParams();
  const { currentPage, setPage } = usePaginationUrl();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const limit = 20;

  const formatBrandTitle = (slug) => {
    if (!slug) return "Brand";
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const loadBrandProducts = async () => {
      setLoading(true);
      try {
        const title = formatBrandTitle(brandSlug);
        setBrandName(title);

        const res = await api.getProducts({
          brand: title,
          page: currentPage,
          limit: limit,
        });

        setProducts(res?.products || []);
        setTotalProducts(res?.totalProducts || res?.total || (res?.products ? res.products.length : 0));
        setTotalPages(res?.totalPages || res?.pages || 1);
      } catch (err) {
        console.error("Error loading brand products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBrandProducts();
  }, [brandSlug, currentPage]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Brands", url: "/brands" },
    { name: brandName || "Brand", url: `/brands/${brandSlug}` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`${brandName} Medicines & Formulations | WellMeds`}
        description={`Buy authentic ${brandName} prescription formulations and healthcare products online at WellMeds. Verified licensed pharmacy.`}
        canonical={`/brands/${brandSlug}`}
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            {brandName}
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
                itemLabel={`Formulations from ${brandName}`}
              />
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Package size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Formulations Available</h3>
              <p className="text-xs text-slate-500 font-sans">We couldn't find any products currently listed for this brand.</p>
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

export default BrandDetailPage;
