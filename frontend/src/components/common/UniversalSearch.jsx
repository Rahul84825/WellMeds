import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, MapPin, ChevronDown, Loader2, X, ShoppingBag
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";

export const UniversalSearch = ({ variant = "default", onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

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
      setFocused(false);
      if (onCloseMobile) onCloseMobile();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Compile flat items for keyboard arrow navigation
  const getFlatSelectableItems = () => {
    const items = [];
    if (query.trim().length >= 2) {
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

    if (item.type === "molecule") {
      navigate(`/molecules/${encodeURIComponent(item.value.slug || item.value.name)}`);
    } else if (item.type === "product") {
      // Track recently viewed product locally for the details page carousel
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



  const isHero = variant === "hero";
  const isMobile = variant === "mobile";
  const isPrescription = variant === "prescription";

  if (isPrescription) {
    return (
      <div ref={containerRef} className="relative w-full">
        <div className="search-row">
          <div className="search-rx">℞</div>
          <div className="flex-1 flex items-center relative gap-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Atorvastatin, Insulin, Metformin..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              className="search-input-field focus:outline-none focus:ring-0 outline-none border-none shadow-none"
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            />
            {!query && <span className="cursor" />}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults({});
                  setActiveIndex(-1);
                }}
                className="p-1 hover:bg-[#e7dfc9]/40 rounded text-[#3f544d] transition-colors shrink-0"
                aria-label="Clear Search Input"
              >
                <X size={16} />
              </button>
            )}
            {loading && (
              <Loader2 className="animate-spin text-[#157a6d] shrink-0" size={16} />
            )}
          </div>
          <button 
            type="button"
            onClick={handleSearchSubmit}
            className="search-btn"
          >
            SEARCH
          </button>
        </div>

        <div className="search-hint">
          {["Oncology", "HIV", "Transplant", "Cardiac", "Rare disease"].map((tag) => (
            <span
              key={tag}
              onClick={() => {
                setQuery(tag);
                setActiveIndex(-1);
                triggerSearch(tag);
                navigate(`/search?q=${encodeURIComponent(tag)}`);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setQuery(tag);
                  setActiveIndex(-1);
                  triggerSearch(tag);
                  navigate(`/search?q=${encodeURIComponent(tag)}`);
                }
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* DROPDOWN AUTOCOMPLETE PANEL (PRESCRIPTION THEMED) */}
        {focused && query.trim().length >= 2 && (
          <div 
            ref={dropdownRef}
            className="rx-dropdown-panel absolute -left-3.5 -right-3.5 sm:-left-5 sm:-right-5 md:-left-8 md:-right-8 top-full mt-3 z-[300] overflow-y-auto max-h-[310px] custom-scrollbar animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col"
          >
            {/* Prescription Catalog Header Strip */}
            <div className="rx-dropdown-header select-none">
              <span>℞ WellMeds Catalog Matches</span>
              <span className="opacity-75 font-normal text-[10px]">Specialty Care</span>
            </div>

            {loading ? (
              <div className="p-8 text-center flex items-center justify-center gap-2.5 select-none">
                <Loader2 className="animate-spin text-[#157a6d] w-5 h-5" />
                <span className="text-xs font-semibold text-[#3f544d] font-mono">Searching 3,000+ specialty SKUs...</span>
              </div>
            ) : (
              <div className="flex flex-col text-left">
                {!hasResults() ? (
                  <div className="rx-dropdown-empty">
                    <div className="rx-empty-icon">
                      <span>℞</span>
                    </div>
                    <h3>No specialty medicines found</h3>
                    <p>No results matching "{query}". Check spelling or explore our complete catalog.</p>
                    <button
                      onClick={() => {
                        setFocused(false);
                        if (onCloseMobile) onCloseMobile();
                        navigate("/products");
                      }}
                    >
                      BROWSE ALL MEDICINES
                    </button>
                  </div>
                ) : (
                  <div className="p-3 space-y-4">
                    {/* MOLECULES */}
                    {results.molecules?.length > 0 && (
                      <div>
                        <div className="rx-section-title select-none">
                          <Search className="w-3.5 h-3.5 text-[#157a6d]" />
                          <span>Chemical Molecules & Composition</span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {results.molecules.map((mol) => {
                            const flatItems = getFlatSelectableItems();
                            const flatIndex = flatItems.findIndex(i => i.type === "molecule" && i.value.slug === mol.slug);
                            const active = activeIndex === flatIndex;
                            return (
                              <div
                                key={mol.slug}
                                onClick={() => handleSelectItem({ type: "molecule", value: mol })}
                                data-active={active}
                                className="rx-molecule-badge group"
                              >
                                <span>{mol.name}</span>
                                <span className="rx-arrow text-[12px] font-bold ml-1.5 transition-colors">&rarr;</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* MEDICINES & PRODUCTS */}
                    {results.products?.length > 0 && (
                      <div>
                        <div className="rx-section-title select-none">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#157a6d]" />
                          <span>Prescription Medicines & Care Products</span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1.5">
                          {results.products.map((prod) => {
                            const flatItems = getFlatSelectableItems();
                            const flatIndex = flatItems.findIndex(i => i.type === "product" && (i.value.slug === prod.slug || i.value.id === prod.id || i.value._id === prod._id));
                            const active = activeIndex === flatIndex;
                            return (
                              <RxProductListItem
                                key={prod.id || prod._id}
                                product={prod}
                                active={active}
                                onSelect={() => handleSelectItem({ type: "product", value: prod })}
                                onAddToCart={(p) => addToCart(p, 1)}
                              />
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
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${isHero ? "max-w-2xl mx-auto" : ""}`}
    >
      {/* SEARCH BAR CONTAINER (NAVBAR PRESCRIPTION THEMED) */}
      <div 
        className="flex items-center bg-white border border-[#dde8e3] rounded-xl flex-row relative shadow-[0_4px_16px_rgba(23,43,38,0.06)] focus-within:border-[#157a6d] focus-within:ring-2 focus-within:ring-[#157a6d]/15 transition-all duration-300 w-full p-2 gap-3"
      >
        {/* Left: Rx Symbol */}
        <div className="font-serif font-bold text-[#157a6d] text-2xl select-none pl-1 leading-none">
          ℞
        </div>

        {/* Input */}
        <div className="flex-1 flex items-center relative gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Medicines, Molecules, Wellness, Surgical..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            className="w-full bg-transparent border-none text-xs outline-none text-[#3f544d] placeholder:text-slate-400 focus:ring-0 focus:outline-none p-0 font-mono font-semibold"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults({});
                setActiveIndex(-1);
              }}
              className="p-1 hover:bg-[#e7dfc9]/40 rounded text-[#3f544d] transition-colors shrink-0"
              aria-label="Clear Search Input"
            >
              <X size={14} />
            </button>
          )}
          {loading && (
            <Loader2 className="animate-spin text-[#157a6d] shrink-0" size={14} />
          )}
        </div>

        {/* Right: Search button */}
        <button 
          type="button"
          onClick={handleSearchSubmit}
          className="bg-[#157a6d] hover:bg-[#0f6157] text-white font-mono font-bold text-xs letter-spacing-[1.5px] px-5 py-2 rounded-full uppercase active:scale-[0.97] transition-all shrink-0 shadow-xs cursor-pointer"
        >
          SEARCH
        </button>
      </div>

      {/* DROPDOWN AUTOCOMPLETE PANEL (NAVBAR PRESCRIPTION THEMED) */}
      {focused && query.trim().length >= 2 && (
        <div 
          ref={dropdownRef}
          className="rx-dropdown-panel absolute left-0 right-0 top-full mt-2 z-[300] overflow-y-auto max-h-[350px] custom-scrollbar animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col"
        >
          {/* Prescription Catalog Header Strip */}
          <div className="rx-dropdown-header select-none">
            <span>℞ WellMeds Catalog Matches</span>
            <span className="opacity-75 font-normal text-[10px]">Specialty Care</span>
          </div>

          {loading ? (
            <div className="p-6 text-center flex items-center justify-center gap-2 select-none">
              <Loader2 className="animate-spin text-[#157a6d] w-4 h-4" />
              <span className="text-xs font-semibold text-[#3f544d] font-mono">Searching catalog...</span>
            </div>
          ) : (
            <div className="flex flex-col text-left">
              {!hasResults() ? (
                <div className="rx-dropdown-empty">
                  <div className="rx-empty-icon">
                    <span>℞</span>
                  </div>
                  <h3>No specialty medicines found</h3>
                  <p>No results matching "{query}". Check spelling or explore our complete catalog.</p>
                  <button
                    onClick={() => {
                      setFocused(false);
                      if (onCloseMobile) onCloseMobile();
                      navigate("/products");
                    }}
                  >
                    BROWSE ALL MEDICINES
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {/* MOLECULES */}
                  {results.molecules?.length > 0 && (
                    <div>
                      <div className="rx-section-title select-none">
                        <Search className="w-3.5 h-3.5 text-[#157a6d]" />
                        <span>Chemical Molecules & Composition</span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {results.molecules.map((mol) => {
                          const flatItems = getFlatSelectableItems();
                          const flatIndex = flatItems.findIndex(i => i.type === "molecule" && i.value.slug === mol.slug);
                          const active = activeIndex === flatIndex;
                          return (
                            <div
                              key={mol.slug}
                              onClick={() => handleSelectItem({ type: "molecule", value: mol })}
                              data-active={active}
                              className="rx-molecule-badge group"
                            >
                              <span>{mol.name}</span>
                              <span className="rx-arrow text-[12px] font-bold ml-1.5 transition-colors">&rarr;</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MEDICINES & PRODUCTS */}
                  {results.products?.length > 0 && (
                    <div>
                      <div className="rx-section-title select-none">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#157a6d]" />
                        <span>Prescription Medicines & Care Products</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        {results.products.map((prod) => {
                          const flatItems = getFlatSelectableItems();
                          const flatIndex = flatItems.findIndex(i => i.type === "product" && (i.value.slug === prod.slug || i.value.id === prod.id || i.value._id === prod._id));
                          const active = activeIndex === flatIndex;
                          return (
                            <RxProductListItem
                              key={prod.id || prod._id}
                              product={prod}
                              active={active}
                              onSelect={() => handleSelectItem({ type: "product", value: prod })}
                              onAddToCart={(p) => addToCart(p, 1)}
                            />
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
const ProductListItem = ({ product, onSelect, onAddToCart, active }) => {
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
          src={product.image || DEFAULT_PRODUCT_IMAGE} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
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

// Prescription styled product list item for Hero search
const RxProductListItem = ({ product, onSelect, onAddToCart, active }) => {
  const navigate = useNavigate();
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleRowClick = (e) => {
    if (e.target.closest("button")) return;
    onSelect();
    navigate(`/products/${product.slug || product._id || product.id}`);
  };

  return (
    <div 
      onClick={handleRowClick}
      data-active={active}
      className="rx-product-item select-none"
    >
      {/* Product Image */}
      <div className="w-11 h-11 bg-white border border-[#dde8e3] rounded-lg flex items-center justify-center shrink-0 p-1">
        <img 
          src={product.image || DEFAULT_PRODUCT_IMAGE} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="product-title truncate">
            {product.name}
          </span>
          {product.requiresRx && (
            <span className="rx-tag">Rx</span>
          )}
        </div>
        <p className="product-subtitle truncate">
          {product.strength && <span>{product.strength}</span>}
          {product.strength && product.packSize && <span> &bull; </span>}
          {product.packSize && <span>{product.packSize}</span>}
          {product.manufacturer && <span> &bull; {product.manufacturer}</span>}
        </p>
      </div>

      {/* Price & Action */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <div className="text-right">
          <div className="price-tag">₹{product.price}</div>
          {discount > 0 && (
            <span className="text-[10px] text-[#157a6d] font-bold">-{discount}%</span>
          )}
        </div>
        <button
          type="button"
          disabled={!(product.stock > 0 && product.inStock !== false)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="add-btn disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default UniversalSearch;
