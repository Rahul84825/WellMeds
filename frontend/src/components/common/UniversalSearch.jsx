import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, MapPin, ChevronDown, Loader2, X, Heart, ShoppingBag, 
  Clock, Activity
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";

export const UniversalSearch = ({ variant = "default", onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Delivery selector states
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("wellmeds_location") || "Mumbai, 400001";
  });
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  // Dynamic / local static content lists
  const [trendingMedicines, setTrendingMedicines] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Handle location syncing across different search input instances
  useEffect(() => {
    const handleLocationChange = (e) => {
      setSelectedLocation(e.detail);
    };
    window.addEventListener("wellmeds_location_changed", handleLocationChange);
    return () => {
      window.removeEventListener("wellmeds_location_changed", handleLocationChange);
    };
  }, []);

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem("wellmeds_location", loc);
    window.dispatchEvent(new CustomEvent("wellmeds_location_changed", { detail: loc }));
    setLocationMenuOpen(false);
  };

  // Sync wishlist updates across instances
  const updateWishlistFromLocal = useCallback(() => {
    try {
      const saved = localStorage.getItem("wellmeds_wishlist");
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateWishlistFromLocal();
    window.addEventListener("wellmeds_wishlist_updated", updateWishlistFromLocal);
    return () => {
      window.removeEventListener("wellmeds_wishlist_updated", updateWishlistFromLocal);
    };
  }, [updateWishlistFromLocal]);

  const toggleWishlist = (product) => {
    try {
      let current = JSON.parse(localStorage.getItem("wellmeds_wishlist") || "[]");
      const exists = current.find(p => p.id === product.id || p._id === product._id);
      if (exists) {
        current = current.filter(p => p.id !== product.id && p._id !== product._id);
      } else {
        current.push({
          id: product.id || product._id,
          _id: product.id || product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          slug: product.slug
        });
      }
      localStorage.setItem("wellmeds_wishlist", JSON.stringify(current));
      window.dispatchEvent(new Event("wellmeds_wishlist_updated"));
    } catch (err) {
      console.warn("Failed to toggle wishlist", err);
    }
  };

  // Fetch search history (Guest vs Logged-In User)
  const fetchRecentSearches = useCallback(async () => {
    if (user) {
      try {
        const history = await api.getSearchHistory();
        setRecentSearches(history);
      } catch (err) {
        console.warn("Could not fetch search history from server:", err.message);
      }
    } else {
      try {
        const local = localStorage.getItem("wellmeds_recent_searches");
        setRecentSearches(local ? JSON.parse(local) : []);
      } catch {
        setRecentSearches([]);
      }
    }
  }, [user]);

  // Save search query to history
  const addQueryToHistory = async (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();

    if (user) {
      try {
        await api.addSearchHistory(cleanTerm);
      } catch (err) {
        console.warn("Could not save search history to server", err.message);
      }
    } else {
      try {
        let history = JSON.parse(localStorage.getItem("wellmeds_recent_searches") || "[]");
        history = history.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase());
        history.unshift(cleanTerm);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem("wellmeds_recent_searches", JSON.stringify(history));
      } catch (err) {
        console.warn("Could not save search history locally", err.message);
      }
    }
    fetchRecentSearches();
  };

  // Clear search history
  const clearHistory = async (e) => {
    e.stopPropagation();
    if (user) {
      try {
        await api.clearSearchHistory();
        setRecentSearches([]);
      } catch (err) {
        console.warn("Could not clear search history on server", err.message);
      }
    } else {
      localStorage.removeItem("wellmeds_recent_searches");
      setRecentSearches([]);
    }
  };

  // Fetch recently viewed products & trending medicines
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending medicines
        const trending = await api.getTrendingProducts();
        setTrendingMedicines(trending);

        // No recently viewed fetched since it is unused
      } catch (err) {
        console.warn("Could not fetch popular/recently viewed data", err.message);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecentSearches();
  }, [fetchRecentSearches]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Sync state with URL search query if on the Products page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get("search");
    if (searchVal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(searchVal);
    }
  }, [location.search]);

  // Debounced search caller
  const triggerSearch = useCallback((val) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    if (val.trim().length < 2) {
      setResults({});
      setLoading(false);
      return;
    }

    setLoading(true);
    abortControllerRef.current = new AbortController();

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await api.searchAll(val, abortControllerRef.current.signal);
        if (data) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search API failed", err);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    triggerSearch(val);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addQueryToHistory(query);
      setFocused(false);
      if (onCloseMobile) onCloseMobile();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Compile flat items for keyboard arrow navigation
  const getFlatSelectableItems = () => {
    const items = [];
    if (query.trim().length < 2) {
      recentSearches.forEach(term => items.push({ type: "recent", value: term }));
      trendingMedicines.forEach(prod => items.push({ type: "product", value: prod }));
    } else {
      if (results.products?.length) {
        results.products.forEach(prod => items.push({ type: "product", value: prod }));
      }
      if (results.molecules?.length) {
        results.molecules.forEach(mol => items.push({ type: "molecule", value: mol }));
      }
    }
    return items;
  };

  // Keyboard navigation controller
  const handleKeyDown = (e) => {
    const flatItems = getFlatSelectableItems();
    if (flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= flatItems.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? flatItems.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        handleSelectItem(flatItems[activeIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setFocused(false);
      inputRef.current?.blur();
      setActiveIndex(-1);
    }
  };

  const handleSelectItem = (item) => {
    setFocused(false);
    setActiveIndex(-1);
    if (onCloseMobile) onCloseMobile();

    if (item.type === "recent") {
      setQuery(item.value);
      addQueryToHistory(item.value);
      navigate(`/search?q=${encodeURIComponent(item.value)}`);
    } else if (item.type === "molecule") {
      addQueryToHistory(item.value.name);
      navigate(`/products?molecule=${encodeURIComponent(item.value.slug || item.value.name)}`);
    } else if (item.type === "product") {
      addQueryToHistory(item.value.name);
      // Track recently viewed product locally
      let viewed = JSON.parse(localStorage.getItem("wellmeds_recently_viewed") || "[]");
      viewed = viewed.filter(p => p.id !== item.value.id && p._id !== item.value._id);
      viewed.unshift(item.value);
      if (viewed.length > 5) viewed = viewed.slice(0, 5);
      localStorage.setItem("wellmeds_recently_viewed", JSON.stringify(viewed));

      navigate(`/products/${item.value.slug || item.value.id || item.value._id}`);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const hasResults = () => {
    return !!(
      results.molecules?.length ||
      results.products?.length
    );
  };

  // Check if a product is in local wishlist
  const isWishlisted = (prod) => {
    return !!wishlist.find(w => w.id === prod.id || w._id === prod._id);
  };

  const isHero = variant === "hero";
  const isMobile = variant === "mobile";

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${isHero ? "max-w-2xl mx-auto" : ""}`}
    >
      {/* SEARCH BAR CONTAINER */}
      <div 
        className={`flex items-center bg-white border border-slate-200 rounded-full flex-row relative shadow-[0_4px_12px_rgba(0,0,0,0.03)] focus-within:border-[#038076] focus-within:ring-2 focus-within:ring-[#038076]/10 transition-all duration-300 w-full ${
          isHero ? "p-2 md:p-2.5" : "p-1 gap-2"
        }`}
      >
        {/* Left: Delivery location selector (hide in simple search overlays / mobile) */}
        {!isMobile && (
          <div className="relative shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-full transition-all focus:outline-none text-left cursor-pointer"
              aria-label="Select delivery location"
            >
              <MapPin className="w-[16px] h-[16px] text-[#038076] shrink-0" />
              <div className="flex flex-col leading-none select-none">
                <span className="text-[7.5px] text-slate-400 uppercase font-black tracking-wider">Deliver to</span>
                <span className="text-[11px] font-extrabold text-slate-800 mt-[1.5px] flex items-center gap-0.5">
                  {selectedLocation} 
                  <ChevronDown className={`w-[10px] h-[10px] text-slate-500 transition-transform duration-200 ${locationMenuOpen ? "rotate-180" : ""}`} />
                </span>
              </div>
            </button>

            {locationMenuOpen && (
              <>
                <div className="fixed inset-0 z-[105]" onClick={() => setLocationMenuOpen(false)} />
                <div className="absolute left-0 top-full mt-2.5 w-48 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-[110] text-left text-xs text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  {["Pune, 411021", "Mumbai, 400001", "Delhi, 110001", "Bangalore, 560001", "Chennai, 600001"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full px-4 py-2.5 hover:bg-slate-50 hover:text-[#038076] font-bold text-left transition-colors focus:outline-none cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Separator */}
        {!isMobile && <div className="w-px h-6 bg-slate-200 shrink-0"></div>}

        {/* Center: Search input */}
        <div className="flex-1 flex items-center relative gap-2 pl-2">
          <Search className="text-slate-400 shrink-0" size={isHero ? 18 : 15} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Medicines, Molecules, Wellness, Surgical..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            className={`w-full bg-transparent border-none text-xs outline-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none p-0 font-semibold ${
              isHero ? "text-sm" : ""
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults({});
                setActiveIndex(-1);
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              aria-label="Clear Search Input"
            >
              <X size={14} />
            </button>
          )}
          {loading && (
            <Loader2 className="animate-spin text-[#038076] shrink-0" size={14} />
          )}
        </div>

        {/* Right: Search button */}
        <button 
          type="button"
          onClick={handleSearchSubmit}
          className={`bg-[#038076] text-white rounded-full font-bold hover:bg-[#02665e] active:scale-[0.97] transition-all shrink-0 shadow-sm cursor-pointer ${
            isHero ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
          }`}
        >
          Search
        </button>
      </div>

      {/* DROPDOWN AUTOCOMPLETE PANEL */}
      {focused && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100/80 z-[250] overflow-y-auto max-h-[500px] md:max-h-[600px] animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col"
        >
          {query.trim().length < 2 ? (
            /* EMPTY STATE: RECENT SEARCHES & TRENDING PRODUCTS ONLY */
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 mb-1 select-none">
                    <span className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-[pulse_2s_infinite]" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      onClick={clearHistory}
                      className="text-[10px] font-extrabold text-[#038076] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {recentSearches.map((term, idx) => {
                      const flatItems = getFlatSelectableItems();
                      const flatIndex = flatItems.findIndex(i => i.type === "recent" && i.value === term);
                      const active = activeIndex === flatIndex;
                      return (
                        <div
                          key={term + idx}
                          onClick={() => handleSelectItem({ type: "recent", value: term })}
                          data-active={active}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 transition-all border ${
                            active ? "border-[#038076] bg-[#e6f6f4]/20" : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{term}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Products */}
              {trendingMedicines.length > 0 && (
                <div>
                  <div className="px-3 mb-1 select-none">
                    <span className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#038076] animate-[pulse_2.5s_infinite]" />
                      <span>Trending Products</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {trendingMedicines.map((prod) => {
                      const flatItems = getFlatSelectableItems();
                      const flatIndex = flatItems.findIndex(i => i.type === "product" && (i.value.id === prod.id || i.value._id === prod._id));
                      const active = activeIndex === flatIndex;
                      return (
                        <ProductListItem
                          key={prod.id || prod._id}
                          product={prod}
                          active={active}
                          onSelect={() => handleSelectItem({ type: "product", value: prod })}
                          onAddToCart={(p) => {
                            addToCart(p, 1);
                          }}
                          onToggleWishlist={toggleWishlist}
                          isWishlisted={isWishlisted(prod)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="p-8 text-center flex items-center justify-center gap-2 select-none">
              <Loader2 className="animate-spin text-[#038076] w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500">Searching catalog...</span>
            </div>
          ) : (
            <div className="flex flex-col text-left">
              {/* NO RESULTS FALLBACK */}
              {!hasResults() ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center shadow-inner">
                    <Search size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-700 text-sm">No medicines or molecules found.</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full max-w-xs select-none">
                    <button
                      onClick={() => {
                        setFocused(false);
                        if (onCloseMobile) onCloseMobile();
                        navigate("/products");
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#038076] hover:bg-[#02665e] text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>View All Products</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* RESULTS GROUPS LIST: PRODUCTS FIRST, THEN MOLECULES */
                <div className="p-2 md:p-3 space-y-4">
                  
                  {/* GROUP 1: MEDICINES & PRODUCTS */}
                  {results.products?.length > 0 && (
                    <div className="border-b border-slate-50 pb-3">
                      <span className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider px-3 select-none flex items-center gap-1.5 mb-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#038076]" />
                        <span>Medicines & Products</span>
                      </span>
                      <div className="flex flex-col gap-1">
                        {results.products.map((prod) => {
                          const flatItems = getFlatSelectableItems();
                          const flatIndex = flatItems.findIndex(i => i.type === "product" && (i.value.slug === prod.slug || i.value.id === prod.id || i.value._id === prod._id));
                          const active = activeIndex === flatIndex;
                          return (
                            <ProductListItem
                              key={prod.id || prod._id}
                              product={prod}
                              active={active}
                              onSelect={() => handleSelectItem({ type: "product", value: prod })}
                              onAddToCart={(p) => {
                                addToCart(p, 1);
                              }}
                              onToggleWishlist={toggleWishlist}
                              isWishlisted={isWishlisted(prod)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* GROUP 2: MOLECULES */}
                  {results.molecules?.length > 0 && (
                    <div>
                      <span className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider px-3 select-none flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#038076]" />
                        <span>Molecules</span>
                      </span>
                      <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {results.molecules.map((mol) => {
                          const flatItems = getFlatSelectableItems();
                          const flatIndex = flatItems.findIndex(i => i.type === "molecule" && i.value.slug === mol.slug);
                          const active = activeIndex === flatIndex;
                          return (
                            <div
                              key={mol.slug}
                              onClick={() => handleSelectItem({ type: "molecule", value: mol })}
                              data-active={active}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all border duration-250 ${
                                active 
                                  ? "border-[#038076] bg-[#e6f6f4]/20 text-[#038076]" 
                                  : "border-transparent text-slate-700 hover:text-[#038076] hover:bg-slate-50"
                              }`}
                            >
                              <span className="text-xs font-bold">{mol.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact product card inner component
const ProductListItem = ({ product, onSelect, onAddToCart, onToggleWishlist, isWishlisted, active }) => {
  const navigate = useNavigate();
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleRowClick = (e) => {
    // Avoid navigation when clicking cart/wishlist buttons
    if (e.target.closest("button")) return;
    onSelect();
    navigate(`/products/${product.slug || product._id || product.id}`);
  };

  return (
    <div 
      onClick={handleRowClick}
      data-active={active}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all select-none group text-left cursor-pointer ${
        active ? "border-[#038076] bg-[#e6f6f4]/20" : "border-transparent hover:bg-slate-50 hover:border-slate-100"
      }`}
    >
      {/* Product Image */}
      <div 
        className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 p-1 cursor-pointer"
      >
        <img 
          src={product.image || "/assets/placeholder-medicine.png"} 
          alt={product.name} 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start gap-1">
          <span 
            className="font-bold text-xs text-slate-800 hover:text-[#038076] transition-colors truncate cursor-pointer"
          >
            {product.name}
          </span>
          {product.requiresRx && (
            <span className="bg-red-50 text-[8px] font-black text-red-600 px-1 py-0.5 rounded uppercase shrink-0 tracking-wider select-none">
              Rx
            </span>
          )}
        </div>
        
        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
          {product.strength && <span>{product.strength}</span>}
          {product.strength && product.packSize && <span> &bull; </span>}
          {product.packSize && <span>{product.packSize}</span>}
          {product.manufacturer && <span> &bull; {product.manufacturer}</span>}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-black text-slate-800">₹{product.price}</span>
          {discount > 0 && (
            <>
              <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
              <span className="bg-[#e6f6f4] text-[9px] font-extrabold text-[#038076] px-1 py-0.5 rounded select-none">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stock & Actions */}
      <div className="flex flex-col items-end shrink-0 gap-1.5 ml-2">
        {product.stock > 0 && product.inStock !== false ? (
          <span className="text-[8.5px] font-black text-[#038076] uppercase tracking-wider select-none">In Stock</span>
        ) : (
          <span className="text-[8.5px] font-black text-red-500 uppercase tracking-wider select-none">Out of Stock</span>
        )}

        <div className="flex items-center gap-1.5">
          {/* Wishlist toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-1.5 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
              isWishlisted ? "text-red-500 border-red-150 bg-red-50/20" : "text-slate-400 border-slate-200"
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {/* Add to cart */}
          <button
            type="button"
            disabled={!(product.stock > 0 && product.inStock !== false)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-[#038076] disabled:bg-slate-200 text-white p-1.5 rounded-lg font-bold text-xs hover:bg-[#02665e] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;
