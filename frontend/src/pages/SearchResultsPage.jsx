import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FlaskConical, PhoneCall } from "lucide-react";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 28;

  const [matchedMolecules, setMatchedMolecules] = useState([]);

  // Fetch search results from backend
  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setTotalProducts(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getSearchResults({ q: query, page: currentPage, limit });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);

      // Fetch matching molecules for query
      const moleculesData = await api.searchAll(query);
      setMatchedMolecules(moleculesData?.molecules || []);
    } catch (err) {
      console.error("Failed to fetch search results", err);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

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
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl text-left min-h-[70vh] animate-[fade-in_0.3s_ease-out]">
      {/* Search page header */}
      <div className="mb-lg">
        <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-150 tracking-tight">
          Search Results for "{query}"
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {loading ? "Searching product catalog..." : `We found ${totalProducts} products matching your query.`}
        </p>
      </div>

      {/* Matching Molecules Widget */}
      {!loading && matchedMolecules.length > 0 && (
        <div className="bg-gradient-to-r from-[#038076]/5 to-[#004782]/5 border border-[#038076]/25 rounded-2xl p-md mb-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center border border-[#038076]/15 shrink-0">
              <FlaskConical size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-slate-800 dark:text-zinc-150 text-xs tracking-tight uppercase">Molecules Found</h4>
              <p className="text-[11px] text-slate-400">Click a matching active ingredient to explore detailed clinical pages.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-xs">
            {matchedMolecules.map((mol) => (
              <a
                key={mol.id || mol._id}
                href={`/products?molecule=${encodeURIComponent(mol.name)}`}
                className="inline-flex items-center gap-xs px-md py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-650 dark:text-zinc-200 hover:border-[#038076]/30 hover:text-[#038076] transition-all font-bold text-xs select-none shadow-xs"
              >
                {mol.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid or Loading State */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md w-full">
            {products.map((prod) => (
              <ProductCard key={prod.id || prod._id || prod.name} product={prod} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-lg select-none text-xs font-bold text-slate-400 mt-lg">
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                    className={`w-8 h-8 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pNum
                        ? "bg-[#038076] border-[#038076] text-white"
                        : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
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
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center shadow-inner select-none">
            <Search size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800">No results found for "{query}"</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto mt-xs">
              Did not find any matching products. Double check spelling or reach out to our pharmacist support.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full max-w-xs select-none">
            <a
              href={`https://wa.me/917420909445?text=Hi%2C%20I%20need%20help%20finding%20a%20medicine%20on%20WellMeds.%20Query%3A%20${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#038076] hover:bg-[#02665e] text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Pharmacist</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
