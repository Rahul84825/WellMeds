import React, { useState, useEffect, useCallback, useRef } from "react";
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
import UniversalSearch from "../components/common/UniversalSearch";
import { Search, X, ChevronRight, Sparkles, FlaskConical, Package, Phone, FileText, ArrowRight, ArrowLeft, Clock, Tag } from "lucide-react";

const POPULAR_SEARCHES = [
  "Mounjaro",
  "Glenza",
  "Knee cap",
  "Cancer",
  "Transplant",
  "Hospital Bed",
  "Crocin",
  "Ozempic",
  "Lonopin",
  "Glucometer"
];

const QUICK_SPECIALITIES = [
  { name: "Oncology Care", icon: "🎗️", link: "/specialities/oncology" },
  { name: "Cardiology", icon: "🫀", link: "/specialities/cardiology" },
  { name: "Organ Transplant", icon: "🧬", link: "/specialities/transplant" },
  { name: "Surgical Supplies", icon: "🩺", link: "/surgicals" },
  { name: "Nephrology / Renal", icon: "🩸", link: "/specialities/nephrology" },
  { name: "Cold-Chain Care", icon: "❄️", link: "/specialities/cold-chain" }
];

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const { currentPage, setPage, searchParams } = usePaginationUrl();
  const query = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(query);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [matchedMolecules, setMatchedMolecules] = useState([]);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const { recordSearchResult } = useMedicineHelp();
  const inputRef = useRef(null);
  const limit = 20;

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setMatchedMolecules([]);
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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  const handleTagClick = (tag) => {
    setInputVal(tag);
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: query ? `Search: "${query}"` : "Search", url: `/search${query ? `?q=${encodeURIComponent(query)}` : ""}` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left">
      <SEO
        title={query ? `Search results for "${query}" | WellMeds` : "Search Medicines & Health Products | WellMeds"}
        description={query ? `Find authentic medicines, active molecules, and therapeutic products matching "${query}" at WellMeds.` : "Search from over 3,000+ authentic medicines, molecules, and surgical products on WellMeds."}
        canonical="/search"
        noindex={true}
        breadcrumbs={breadcrumbs}
      />

      {/* ── MOBILE DEDICATED SEARCH VIEW (MATCHES SCREENSHOT) ── */}
      <div className="block lg:hidden min-h-[100dvh] bg-white dark:bg-zinc-950 p-4 font-sans">
        {/* Mobile Header Bar */}
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">Search WellMeds</div>
        </div>

        {/* Universal Search Mobile Component */}
        <UniversalSearch variant="mobile" />
      </div>

      {/* ── DESKTOP SEARCH VIEW ── */}
      <div className="hidden lg:block">
        {/* ── HERO HEADER WITH DEDICATED SEARCH BAR ── */}
        <div className="relative bg-gradient-to-b from-[#e7f5f0] via-[#f0f9f6] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-center">
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-[#11221e] dark:text-white tracking-tight">
              {query ? `Search: "${query}"` : "Search Medicines & Products"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-sans">
              Compare genuine prescription medicines, rare compositions & surgical supplies
            </p>
          </div>

          {/* Interactive Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="flex items-center bg-white dark:bg-zinc-900 border-2 border-[#038076]/30 dark:border-zinc-700 focus-within:border-[#038076] rounded-2xl sm:rounded-full px-3.5 py-2 sm:py-2.5 shadow-md shadow-[#038076]/5 transition-all gap-2.5">
              <Search className="w-5 h-5 text-[#038076] shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search for medicine, molecules, surgicals..."
                autoFocus
                className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-0 font-medium"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal("");
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  aria-label="Clear Search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="bg-[#038076] hover:bg-[#02635c] disabled:opacity-40 text-white font-sans font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl sm:rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Tag size={12} /> Popular:
            </span>
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  query.toLowerCase() === tag.toLowerCase()
                    ? "bg-[#038076] text-white border-[#038076] font-bold"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-800 hover:border-[#038076] hover:text-[#038076]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* If No Query: Show Discovery Guide */}
          {!query.trim() && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Popular Specialities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[#038076]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                    Browse Popular Specialities
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {QUICK_SPECIALITIES.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => navigate(item.link)}
                      className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50/60 dark:hover:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-800 text-left transition-all cursor-pointer group"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#038076] transition-colors truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 group-hover:text-slate-500">
                          View catalog &rarr;
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Prescription CTA Card */}
              <div
                onClick={() => navigate("/upload-prescription")}
                className="p-5 sm:p-6 bg-gradient-to-br from-[#038076] to-[#02635c] rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                <div className="space-y-1">
                  <div className="text-base font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Have a Doctor's Prescription?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-teal-100 font-sans max-w-lg">
                    Upload prescription for direct verified pricing, expert pharmacist verification, and doorstep dispatch.
                  </p>
                </div>
                <span className="bg-white text-[#038076] text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shrink-0 inline-flex items-center gap-1.5 self-start sm:self-center shadow-xs">
                  <span>Upload Rx</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          )}

          {/* MATCHED ACTIVE MOLECULES SECTION */}
          {query.trim() && matchedMolecules.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical size={18} className="text-[#038076]" />
                <h3 className="font-editorial text-lg sm:text-xl font-semibold text-[#172b26] dark:text-white">
                  Matching Chemical Molecules & Compositions
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {matchedMolecules.map((mol) => (
                  <Link
                    key={mol._id || mol.id || mol.slug}
                    to={`/molecule/${mol.slug}`}
                    className="bg-[#f0f9f6] dark:bg-emerald-950/40 border border-[#cbe8de] dark:border-emerald-800 rounded-full px-4 py-1.5 text-xs font-semibold text-[#038076] dark:text-emerald-400 hover:bg-[#038076] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <FlaskConical size={13} />
                    <span>{mol.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── PRODUCT GRID OR SKELETONS ── */}
          {query.trim() && (
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
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-sans">
                    <span>Showing results for <strong className="text-slate-900 dark:text-white">"{query}"</strong></span>
                    <span>{totalProducts} medicine{totalProducts === 1 ? "" : "s"} found</span>
                  </div>
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
                <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-xs space-y-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#038076] flex items-center justify-center font-bold text-2xl mx-auto">
                    ℞
                  </div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Direct Match Found</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans">
                    We couldn't find medications matching "{query}". Upload your prescription and our team will source it for you.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/upload-prescription")}
                      className="bg-[#038076] hover:bg-[#02635c] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Upload Prescription
                    </button>
                    <Link
                      to="/products"
                      className="border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-full text-xs font-semibold inline-block transition-colors"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── WHY WELLMEDS BAR ── */}
          <WhyWellMedsBar />
        </div>
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

