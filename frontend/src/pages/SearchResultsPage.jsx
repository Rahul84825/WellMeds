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
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`Search results for "${query}" | WellMeds`}
        description={`Find authentic medicines, active molecules, and therapeutic products matching "${query}" at WellMeds.`}
        canonical={`/search?q=${encodeURIComponent(query)}`}
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
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Search</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>UNIVERSAL PHARMACEUTICAL SEARCH</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                {query ? `Search: "${query}"` : "Search Catalogue"}
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Displaying authentic clinical formulations, verified active pharmaceutical ingredients (APIs), and healthcare products.
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

        {/* ── MATCHED ACTIVE MOLECULES SECTION ── */}
        {matchedMolecules.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
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
                  className="bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200 rounded-full px-4 py-2 text-xs font-semibold text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white transition-all flex items-center gap-2"
                >
                  <FlaskConical size={14} />
                  <span>{mol.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCT SEARCH RESULTS GRID ── */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-4 space-y-3 animate-pulse">
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
                itemLabel="Products"
              />
            </div>
          ) : (
            <MedicineNotFound searchQuery={query} suggestions={matchedMolecules} />
          )}
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
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
