import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import SEO from "../components/common/SEO";
import SearchHeader from "../components/search/SearchHeader";
import SearchFilterPanel from "../components/search/SearchFilterPanel";
import SearchResultCard from "../components/search/SearchResultCard";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PhoneCall, SlidersHorizontal, ArrowUpDown } from "lucide-react";

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter & Sort State
  const [filters, setFilters] = useState({
    availability: "all", // "all" | "inStock" | "outOfStock"
    rxOnly: false,
    manufacturer: [],
    strength: [],
    maxPrice: null,
  });
  const [sortBy, setSortBy] = useState("relevance"); // "relevance" | "price-asc" | "price-desc" | "discount" | "newest"

  // Fetch search results from backend API
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
    } fontally {
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

  const handleResetFilters = () => {
    setFilters({
      availability: "all",
      rxOnly: false,
      manufacturer: [],
      strength: [],
      maxPrice: null,
    });
  };

  // Client-side filtering & sorting applied over returned page items for responsive UX
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by Availability
    if (filters.availability === "inStock") {
      result = result.filter((p) => p.inStock !== false && p.stock !== 0);
    } else if (filters.availability === "outOfStock") {
      result = result.filter((p) => p.inStock === false || p.stock === 0);
    }

    // 2. Filter by Rx Only
    if (filters.rxOnly) {
      result = result.filter((p) => p.isPrescriptionRequired || p.requiresRx);
    }

    // 3. Filter by Manufacturer / Brand
    if (filters.manufacturer && filters.manufacturer.length > 0) {
      result = result.filter((p) =>
        filters.manufacturer.includes(p.manufacturer || p.brand)
      );
    }

    // 4. Filter by Strength
    if (filters.strength && filters.strength.length > 0) {
      result = result.filter((p) => filters.strength.includes(p.strength));
    }

    // 5. Filter by Max Price
    if (filters.maxPrice) {
      result = result.filter((p) => (p.price || 0) <= filters.maxPrice);
    }

    // Sort logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, filters, sortBy]);

  // Comparison UX: Find lowest price item sharing the active molecule salt
  const cheapestId = useMemo(() => {
    if (processedProducts.length <= 1) return null;
    const sortedByPrice = [...processedProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
    return (sortedByPrice[0]?._id || sortedByPrice[0]?.id)?.toString();
  }, [processedProducts]);

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
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-8 text-left min-h-[75vh] animate-[fade-in_0.3s_ease-out]">
      <SEO title={`Search results for "${query}"`} />

      {/* Header */}
      <SearchHeader
        query={query}
        totalProducts={processedProducts.length}
        loading={loading}
        matchedMolecules={matchedMolecules}
      />

      {/* Main Grid & Filters Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Sidebar Filters */}
        <SearchFilterPanel
          products={products}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Content Area */}
        <div className="flex-1 w-full">
          
          {/* Controls Bar: Mobile Filter Button & Sorting Dropdown */}
          {!loading && processedProducts.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 mb-6 shadow-2xs">
              
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <SlidersHorizontal size={15} className="text-[#038076]" />
                <span>Filters & Refine</span>
              </button>

              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold hidden sm:inline-block">
                Showing <strong className="text-slate-900 dark:text-white font-bold">{processedProducts.length}</strong> items
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <ArrowUpDown size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 hidden sm:inline-block">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#038076]/20 cursor-pointer"
                >
                  <option value="relevance">Popularity / Relevance</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <Loader size="lg" />
            </div>
          ) : processedProducts.length > 0 ? (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
                {processedProducts.map((prod) => {
                  const pId = (prod._id || prod.id)?.toString();
                  const isCheapest = pId === cheapestId && processedProducts.length > 1;
                  const compTag = isCheapest ? "cheapest" : matchedMolecules.length > 0 ? "same-salt" : null;

                  return (
                    <SearchResultCard
                      key={pId || prod.name}
                      product={prod}
                      comparisonTag={compTag}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-6 select-none text-xs font-bold text-slate-400 mt-8">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center w-9 h-9 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center w-9 h-9 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-9 h-9 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          currentPage === pNum
                            ? "bg-[#038076] border-[#038076] text-white shadow-xs"
                            : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center w-9 h-9 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center w-9 h-9 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom Empty State */
            <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-[#038076]/10 text-[#038076] rounded-full flex items-center justify-center shadow-inner">
                <Search size={28} />
              </div>

              <div className="space-y-1 max-w-md">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  No matching medicines found for "{query}"
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  We couldn't find any exact products matching your current filters or query. Try clearing filters or speak directly with our clinical pharmacist team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 w-full max-w-sm">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Clear Active Filters
                </button>
                
                <a
                  href={`https://wa.me/917420909445?text=Hi%2C%20I%20need%20help%20finding%20a%20medicine%20on%20WellMeds.%20Query%3A%20${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#038076] hover:bg-[#02665e] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <PhoneCall size={14} />
                  <span>Contact Pharmacist</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
