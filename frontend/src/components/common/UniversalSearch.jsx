import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, MapPin, ChevronDown, Loader2, X, ShoppingBag, Check, Clock, Sparkles
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useLocationContext } from "../../context/LocationContext";
import api from "../../services/api";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";
import SearchPlaceholderCarousel from "./SearchPlaceholderCarousel";

export const INDIAN_DELIVERY_LOCATIONS = [
  {
    name: "Pune",
    state: "Maharashtra",
    deliveryTime: "1 Day Delivery",
    deliveryBadge: "⚡ 1 Day in Pune",
    isExpress: true,
    subtext: "Baner local dispatch hub • Same Day / Next Day"
  },
  {
    name: "Maharashtra (Other)",
    state: "Maharashtra",
    deliveryTime: "More than 2 Days (1–2 Days)",
    deliveryBadge: "🚚 1–2 Days",
    isExpress: false,
    subtext: "Mumbai, Thane, Nagpur, Nashik, Aurangabad"
  },
  {
    name: "Delhi / NCR",
    state: "Delhi",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "New Delhi, Noida, Gurugram, Ghaziabad"
  },
  {
    name: "Karnataka",
    state: "Karnataka",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Bengaluru, Mysuru, Hubballi, Mangaluru"
  },
  {
    name: "Gujarat",
    state: "Gujarat",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Ahmedabad, Surat, Vadodara, Rajkot"
  },
  {
    name: "Telangana",
    state: "Telangana",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Hyderabad, Secunderabad, Warangal"
  },
  {
    name: "Tamil Nadu",
    state: "Tamil Nadu",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Chennai, Coimbatore, Madurai, Salem"
  },
  {
    name: "Andhra Pradesh",
    state: "Andhra Pradesh",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Visakhapatnam, Vijayawada, Guntur"
  },
  {
    name: "Arunachal Pradesh",
    state: "Arunachal Pradesh",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Itanagar, Tawang, Pasighat"
  },
  {
    name: "Assam",
    state: "Assam",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Guwahati, Silchar, Dibrugarh"
  },
  {
    name: "Bihar",
    state: "Bihar",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Patna, Gaya, Muzaffarpur, Bhagalpur"
  },
  {
    name: "Chandigarh",
    state: "Chandigarh",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Tricity Express Logistics"
  },
  {
    name: "Chhattisgarh",
    state: "Chhattisgarh",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Raipur, Bhilai, Bilaspur"
  },
  {
    name: "Goa",
    state: "Goa",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Panaji, Margao, Vasco"
  },
  {
    name: "Haryana",
    state: "Haryana",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Faridabad, Panipat, Ambala, Karnal"
  },
  {
    name: "Himachal Pradesh",
    state: "Himachal Pradesh",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Shimla, Dharamshala, Solan, Mandi"
  },
  {
    name: "Jammu and Kashmir",
    state: "Jammu and Kashmir",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Srinagar, Jammu, Anantnag"
  },
  {
    name: "Jharkhand",
    state: "Jharkhand",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Ranchi, Jamshedpur, Dhanbad, Bokaro"
  },
  {
    name: "Kerala",
    state: "Kerala",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Kochi, Thiruvananthapuram, Kozhikode"
  },
  {
    name: "Ladakh",
    state: "Ladakh",
    deliveryTime: "More than 2 Days (4–6 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Leh, Kargil"
  },
  {
    name: "Madhya Pradesh",
    state: "Madhya Pradesh",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Indore, Bhopal, Jabalpur, Gwalior"
  },
  {
    name: "Manipur",
    state: "Manipur",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Imphal, Churachandpur"
  },
  {
    name: "Meghalaya",
    state: "Meghalaya",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Shillong, Tura, Jowai"
  },
  {
    name: "Mizoram",
    state: "Mizoram",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Aizawl, Lunglei"
  },
  {
    name: "Nagaland",
    state: "Nagaland",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Kohima, Dimapur, Mokokchung"
  },
  {
    name: "Odisha",
    state: "Odisha",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Bhubaneswar, Cuttack, Rourkela"
  },
  {
    name: "Puducherry",
    state: "Puducherry",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Puducherry, Karaikal, Ozhukarai"
  },
  {
    name: "Punjab",
    state: "Punjab",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Ludhiana, Amritsar, Jalandhar, Patiala"
  },
  {
    name: "Rajasthan",
    state: "Rajasthan",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Jaipur, Jodhpur, Udaipur, Kota"
  },
  {
    name: "Sikkim",
    state: "Sikkim",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Gangtok, Namchi, Geyzing"
  },
  {
    name: "Tripura",
    state: "Tripura",
    deliveryTime: "More than 2 Days (3–5 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Agartala, Dharmanagar, Udaipur"
  },
  {
    name: "Uttar Pradesh",
    state: "Uttar Pradesh",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Lucknow, Kanpur, Varanasi, Agra, Prayagraj"
  },
  {
    name: "Uttarakhand",
    state: "Uttarakhand",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Dehradun, Haridwar, Haldwani, Roorkee"
  },
  {
    name: "West Bengal",
    state: "West Bengal",
    deliveryTime: "More than 2 Days (2–4 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Kolkata, Howrah, Siliguri, Durgapur"
  },
  {
    name: "Andaman and Nicobar Islands",
    state: "Andaman and Nicobar Islands",
    deliveryTime: "More than 2 Days (5–7 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Port Blair, Island Air & Sea Cargo"
  },
  {
    name: "Dadra & Nagar Haveli and Daman & Diu",
    state: "Dadra and Nagar Haveli and Daman and Diu",
    deliveryTime: "More than 2 Days (2–3 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Daman, Silvassa"
  },
  {
    name: "Lakshadweep",
    state: "Lakshadweep",
    deliveryTime: "More than 2 Days (5–7 Days)",
    deliveryBadge: "🚚 > 2 Days",
    isExpress: false,
    subtext: "Kavaratti, Agatti"
  }
];

export const UniversalSearch = ({ variant = "default", onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { selectedLocation: globalLocation, openLocationModal } = useLocationContext();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Delivery selector states
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("wellmeds_delivery_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load saved delivery location", e);
    }
    return INDIAN_DELIVERY_LOCATIONS[0]; // Default: Pune (1 Day Delivery)
  });
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  const containerRef = useRef(null);
  const locationMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Handle outside clicks to close the dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        setActiveIndex(-1);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Sync location across components
  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail) {
        if (typeof e.detail === "object" && e.detail.name) {
          setSelectedLocation(e.detail);
        } else if (typeof e.detail === "string") {
          const matched = INDIAN_DELIVERY_LOCATIONS.find(
            (l) => l.name.toLowerCase() === e.detail.toLowerCase() || e.detail.toLowerCase().includes(l.name.toLowerCase())
          );
          if (matched) setSelectedLocation(matched);
        }
      }
    };
    window.addEventListener("wellmeds_location_changed", handleLocationChange);
    return () => {
      window.removeEventListener("wellmeds_location_changed", handleLocationChange);
    };
  }, []);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    try {
      localStorage.setItem("wellmeds_delivery_location", JSON.stringify(loc));
      localStorage.setItem("wellmeds_location", loc.name);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("wellmeds_location_changed", { detail: loc }));
    setLocationMenuOpen(false);
    setLocationSearchQuery("");
  };

  // Filtered locations based on search query
  const filteredLocations = INDIAN_DELIVERY_LOCATIONS.filter((loc) => {
    if (!locationSearchQuery.trim()) return true;
    const q = locationSearchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.subtext.toLowerCase().includes(q)
    );
  });

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

      const targetId = item.value.slug || item.value._id || item.value.id;
      navigate(`/products/${targetId}`);
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

  if (isMobile) {
    return (
      <div className="flex flex-col w-full font-sans pb-16">
        {/* Search Input Bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-zinc-950 pb-3">
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 gap-2 shadow-xs focus-within:border-[#038076] focus-within:ring-2 focus-within:ring-[#038076]/20 transition-all">
            <Search className="w-5 h-5 text-[#038076] shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search 3,000+ medicines, molecules, surgicals..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-0 font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults({});
                  setActiveIndex(-1);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full text-slate-500 transition-colors shrink-0"
                aria-label="Clear Search"
              >
                <X size={16} />
              </button>
            )}
            {loading && (
              <Loader2 className="animate-spin text-[#038076] shrink-0" size={16} />
            )}
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={!query.trim()}
              className="bg-[#038076] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* CONTENT AREA: Results vs Default Suggestions */}
        {query.trim().length >= 2 ? (
          /* ACTIVE SEARCH RESULTS */
          <div className="flex flex-col space-y-4 pt-1">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#038076] w-7 h-7" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Searching 3,000+ specialty SKUs...
                </span>
              </div>
            ) : !hasResults() ? (
              <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 my-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#038076] flex items-center justify-center font-bold text-xl mb-3">
                  ℞
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  No direct match found for "{query}"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  We source hard-to-find & cold-chain medicines on demand across India.
                </p>
                <button
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    navigate("/upload-prescription");
                  }}
                  className="mt-4 bg-[#038076] hover:bg-[#02635c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Upload Prescription for Instant Quote
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Molecule Matches */}
                {results.molecules?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <Search className="w-3.5 h-3.5 text-[#038076]" />
                      <span>Salt & Molecules ({results.molecules.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {results.molecules.map((mol) => (
                        <button
                          key={mol.slug}
                          type="button"
                          onClick={() => handleSelectItem({ type: "molecule", value: mol })}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#038076] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                        >
                          <span>{mol.name}</span>
                          <span className="text-[11px] opacity-70">&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicine / Product Matches */}
                {results.products?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#038076]" />
                      <span>Medicines & Products ({results.products.length})</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {results.products.map((prod) => (
                        <ProductListItem
                          key={prod.id || prod._id}
                          product={prod}
                          active={false}
                          onSelect={() => handleSelectItem({ type: "product", value: prod })}
                          onAddToCart={(p) => addToCart(p, 1)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Search Results Button */}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-3 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>View all results for "{query}"</span>
                  <span>&rarr;</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* DEFAULT SUGGESTIONS & POPULAR CATEGORIES (WHEN EMPTY) */
          <div className="flex flex-col space-y-5 pt-2">
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Mounjaro", "Glenza", "Knee cap", "Cancer", "Transplant", "Hospital Bed", "Lonopin", "Albumin"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      triggerSearch(tag);
                    }}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-teal-50 hover:text-[#038076] hover:border-teal-200 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5">
                <Clock className="w-3.5 h-3.5 text-[#038076]" />
                <span>Popular Specialities</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Oncology Care", icon: "🎗️", link: "/specialities/oncology" },
                  { name: "Cardiology", icon: "🫀", link: "/specialities/cardiology" },
                  { name: "Organ Transplant", icon: "🧬", link: "/specialities/transplant" },
                  { name: "Surgical Supplies", icon: "🩺", link: "/surgicals" },
                  { name: "Nephrology / Renal", icon: "🩸", link: "/specialities/nephrology" },
                  { name: "Cold-Chain Care", icon: "❄️", link: "/specialities/cold-chain" }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      navigate(cat.link);
                    }}
                    className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50/50 dark:hover:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Prescription Promo Card */}
            <div
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                navigate("/upload-prescription");
              }}
              className="p-4 bg-gradient-to-br from-[#038076] to-[#02635c] rounded-2xl text-white flex items-center justify-between cursor-pointer shadow-md active:scale-[0.99] transition-all"
            >
              <div>
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <span>📋 Have a Doctor's Prescription?</span>
                </div>
                <p className="text-[11px] text-teal-100 mt-1">
                  Upload prescription for verified pricing & fast doorstep dispatch.
                </p>
              </div>
              <span className="bg-white text-[#038076] text-xs font-extrabold px-3 py-1.5 rounded-lg shrink-0 ml-2">
                Upload &rarr;
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isPrescription) {
    const isPune = Boolean(
      globalLocation?.isPune ||
      (globalLocation?.pincode && (globalLocation.pincode.startsWith("411") || globalLocation.pincode.startsWith("412"))) ||
      (globalLocation?.city && globalLocation.city.toLowerCase().includes("pune")) ||
      (globalLocation?.district && globalLocation.district.toLowerCase().includes("pune")) ||
      (globalLocation?.displayText && globalLocation.displayText.toLowerCase().includes("pune"))
    );

    const cityOrDistrict = isPune ? "Pune" : (globalLocation?.district || globalLocation?.city || globalLocation?.state || "Pune");
    const displayLocation = globalLocation?.pincode
      ? `${globalLocation.pincode}, ${cityOrDistrict}`
      : (globalLocation?.displayText || cityOrDistrict);
    const estDelivery = globalLocation?.estimatedDelivery || (isPune ? "⚡ 1 Day (Express in Pune)" : "🚚 2–4 Days (Pan-India)");

    return (
      <div ref={containerRef} className="relative w-full font-sans">
        <div className="search-row flex items-center">
          {/* Location Delivery Selector (Triggers LocationSelectorModal with GPS & Pincode check) */}
          <div className="relative hidden sm:block shrink-0 font-sans">
            <button
              type="button"
              onClick={openLocationModal}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#038076] transition-colors select-none pr-3 border-r border-[#c3d4cc] py-1 cursor-pointer group"
              title="Select delivery location & check estimated delivery time"
            >
              <MapPin className="w-4 h-4 text-[#038076] group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium text-[11px]">Deliver to</span>
                  <strong className="text-slate-900 font-extrabold text-xs group-hover:text-[#038076] transition-colors">
                    {displayLocation}
                  </strong>
                </div>
                <span className={`text-[10px] font-bold leading-tight ${isPune ? "text-emerald-700 font-extrabold" : "text-amber-700 font-semibold"}`}>
                  {estDelivery}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#038076] transition-transform duration-200 ml-0.5" />
            </button>
          </div>

          <div className="search-rx flex items-center justify-center">
            <Search className="w-5 h-5 text-[#038076]" />
          </div>
          
          <div className="flex-1 flex items-center relative gap-1 min-w-0 h-full">
            <input
              ref={inputRef}
              type="text"
              placeholder=""
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              className="search-input-field focus:outline-none focus:ring-0 outline-none border-none shadow-none relative z-10 bg-transparent font-sans"
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            />
            <SearchPlaceholderCarousel
              isFocused={focused}
              hasValue={!!query}
              className="text-slate-400 font-sans text-xs sm:text-base font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults({});
                  setActiveIndex(-1);
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors shrink-0"
                aria-label="Clear Search Input"
              >
                <X size={16} />
              </button>
            )}
            {loading && (
              <Loader2 className="animate-spin text-[#038076] shrink-0" size={16} />
            )}
          </div>
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="search-btn font-sans"
          >
            SEARCH
          </button>
        </div>

        <div className="search-hint font-sans pt-2 hidden md:flex flex-wrap items-center gap-2 select-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">POPULAR:</span>
          {["Mounjaro", "Glenza", "Knee cap", "Cancer", "Transplant", "Hospital Bed"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                triggerSearch(tag);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="px-2.5 py-0.5 rounded-full bg-[#edf7f2] hover:bg-[#d6f0e4] text-[#038076] border border-[#c3e6d6] text-xs font-semibold select-none cursor-pointer transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* DROPDOWN AUTOCOMPLETE PANEL (PRESCRIPTION THEMED) */}
        {focused && query.trim().length >= 2 && (
          <div
            ref={dropdownRef}
            className="rx-dropdown-panel absolute -left-3.5 -right-3.5 sm:-left-5 sm:-right-5 md:-left-8 md:-right-8 top-full mt-3 z-[300] overflow-y-auto max-h-[310px] custom-scrollbar animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col font-sans"
          >
            {/* Prescription Catalog Header Strip */}
            <div className="rx-dropdown-header select-none font-sans">
              <span>℞ WellMeds Catalog Matches</span>
              <span className="opacity-75 font-normal text-[10px] font-sans">Specialty Care</span>
            </div>

            {loading ? (
              <div className="p-8 text-center flex items-center justify-center gap-2.5 select-none font-sans">
                <Loader2 className="animate-spin text-[#038076] w-5 h-5" />
                <span className="text-xs font-semibold text-slate-700 font-sans">Searching 3,000+ specialty SKUs...</span>
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
      {/* SEARCH BAR CONTAINER (NAVBAR THEMED) */}
      <div
        className="flex items-center bg-white border border-[#dde8e3] rounded-xl flex-row relative shadow-[0_2px_8px_rgba(23,43,38,0.04)] focus-within:border-[#038076] focus-within:ring-2 focus-within:ring-[#038076]/15 transition-all duration-300 w-full h-[38px] px-2.5 gap-2.5 font-sans"
      >
        {/* Left: Rx Symbol */}
        <div className="font-sans font-extrabold text-[#038076] text-base select-none pl-0.5 leading-none">
          ℞
        </div>

        {/* Input */}
        <div className="flex-1 flex items-center relative gap-2 min-w-0 h-full">
          <input
            ref={inputRef}
            type="text"
            placeholder=""
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            className="w-full bg-transparent border-none text-xs outline-none text-slate-800 focus:ring-0 focus:outline-none p-0 font-sans font-semibold relative z-10"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          />
          <SearchPlaceholderCarousel
            isFocused={focused}
            hasValue={!!query}
            className="text-slate-400 font-sans text-xs font-semibold"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults({});
                setActiveIndex(-1);
              }}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors shrink-0"
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
          className="bg-[#038076] hover:bg-[#02635c] text-white font-sans font-bold text-[11px] h-[28px] px-3.5 rounded-lg uppercase active:scale-[0.97] transition-all shrink-0 shadow-xs cursor-pointer flex items-center justify-center tracking-wider"
        >
          SEARCH
        </button>
      </div>

      {/* DROPDOWN AUTOCOMPLETE PANEL (NAVBAR THEMED) */}
      {focused && query.trim().length >= 2 && (
        <div
          ref={dropdownRef}
          className="rx-dropdown-panel absolute left-0 right-0 top-full mt-2 z-[300] overflow-y-auto max-h-[350px] custom-scrollbar animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col font-sans"
        >
          {/* Prescription Catalog Header Strip */}
          <div className="rx-dropdown-header select-none font-sans">
            <span>℞ WellMeds Catalog Matches</span>
            <span className="opacity-75 font-normal text-[10px] font-sans">Specialty Care</span>
          </div>

          {loading ? (
            <div className="p-6 text-center flex items-center justify-center gap-2 select-none font-sans">
              <Loader2 className="animate-spin text-[#038076] w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700 font-sans">Searching catalog...</span>
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
  };

  return (
    <div
      onClick={handleRowClick}
      data-active={active}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all select-none group text-left cursor-pointer ${active ? "border-[#038076] bg-[#e6f6f4]/20" : "border-transparent hover:bg-slate-50 hover:border-slate-100"
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
