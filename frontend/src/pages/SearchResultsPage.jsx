import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import MedicineNotFound from "../components/MedicineNotFound";
import { useMedicineHelp } from "../hooks/useMedicineHelp";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
import { Search, X, ChevronRight, Sparkles, FlaskConical, Package, Phone, FileText } from "lucide-react";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const { currentPage, setPage, searchParams } = usePaginationUrl();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [matchedMolecules, setMatchedMolecules] = useState([]);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const { recordSearchResult } = useMedicineHelp();
  const limit = 20;

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getSearchResults({ q: query, page: currentPage, limit });
      const fetchedProducts = data.products || [];
      setProducts(fetchedProducts);
      setTotalProducts(data.totalProducts || data.total || 0);
      setTotalPages(data.totalPages || data.pages || 1);

      const moleculesData = await api.searchAll(query);
      setMatchedMolecules(moleculesData?.molecules || []);

      recordSearchResult(query, fetchedProducts.length);
    } catch (err) {
      console.error("Failed to fetch search results", err);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, recordSearchResult]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: `Search: "${query}"`, url: `/search?q=${encodeURIComponent(query)}` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`Search results for "${query}" | WellMeds`}
        description={`Find authentic medicines, active molecules, and therapeutic products matching "${query}" at WellMeds.`}
        canonical="/search"
        noindex={true}
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            {query ? `Search: "${query}"` : "Search Catalogue"}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── MATCHED ACTIVE MOLECULES SECTION ── */}
          {matchedMolecules.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FlaskConical size={18} className="text-[#157a6d]" />
                <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
                  Matching Active Ingredients
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {matchedMolecules.map((mol) => (
                  <Link
                    key={mol._id || mol.id}
                    to={`/molecule/${mol.slug}`}
                    className="bg-[#f8fafc] dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800 rounded-full px-4 py-2 text-xs font-semibold text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white transition-all flex items-center gap-2"
                  >
                    <FlaskConical size={14} />
                    <span>{mol.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                  pageSize={limit}
                  onPageChange={setPage}
                  itemLabel="Products"
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
                <Package size={36} className="mx-auto text-slate-400" />
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Results Found</h3>
                <p className="text-xs text-slate-500 font-sans">We couldn't find any medications or formulations matching "{query}".</p>
                <div className="pt-2">
                  <Link to="/products" className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold inline-block transition-colors">
                    Explore All Medicines
                  </Link>
                </div>
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

export default SearchResultsPage;
