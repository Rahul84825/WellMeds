import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  SlidersHorizontal, 
  Grid, 
  List, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Tag
} from "lucide-react";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug, brandSlug } = useParams();
  
  // SEO Header State
  const [seoHeader, setSeoHeader] = useState(null);
  
  // Dynamic data from backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 28;

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(2000);
  const [stockStatus, setStockStatus] = useState("all"); // 'all', 'in', 'out'
  const [requiresRx, setRequiresRx] = useState("all"); // 'all', 'true', 'false'
  const [hasDiscount, setHasDiscount] = useState("all"); // 'all', 'true'
  const [sortBy, setSortBy] = useState("popularity");
  
  // Search inputs
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // UI States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [expandedPanels, setExpandedPanels] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    availability: true,
    prescription: true,
    discount: true
  });

  // Fetch categories and brands once on load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsData, brandsData] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        setCategories(catsData);
        setBrands(brandsData);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // Sync category from URL parameter or route slug
  const categoryParam = searchParams.get("category");
  useEffect(() => {
    const activeSlug = categorySlug || categoryParam;
    if (categories.length > 0 && activeSlug) {
      const matchedCat = categories.find(
        (c) =>
          c.slug === activeSlug ||
          c.name.toLowerCase() === activeSlug.toLowerCase() ||
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") === activeSlug.toLowerCase()
      );
      if (matchedCat) {
        setSelectedCategories([matchedCat.slug]);
        setSeoHeader({
          title: matchedCat.name,
          banner: matchedCat.banner || matchedCat.image,
          introduction: matchedCat.introduction || matchedCat.description,
          faqs: matchedCat.faqs || [],
          seoTitle: matchedCat.seoTitle,
          seoDescription: matchedCat.seoDescription,
          seoKeywords: matchedCat.seoKeywords
        });
      } else {
        setSelectedCategories(["non-existent-category-slug-to-force-empty-state"]);
        setSeoHeader({
          title: "No Products Found",
          introduction: "The requested category does not exist."
        });
      }
    } else if (categories.length > 0) {
      setSelectedCategories([]);
      setSeoHeader(null);
    }
  }, [categorySlug, categoryParam, categories]);

  useEffect(() => {
    if (brands.length > 0 && brandSlug) {
      const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const matchedBrand = brands.find(b => slugify(b) === brandSlug);
      if (matchedBrand) {
        setSelectedBrands([matchedBrand]);
        setSeoHeader({
          title: `${matchedBrand} Medicines`,
          introduction: `Explore a wide range of authentic healthcare products and medicines manufactured by ${matchedBrand}.`,
          seoTitle: `${matchedBrand} Medicines Catalog | WellMeds`,
          seoDescription: `Shop authentic ${matchedBrand} medicines online at WellMeds. Licensed pharmacist review and fast delivery.`
        });
      }
    }
  }, [brandSlug, brands]);

  // Inject List Schema & Meta Tags
  useEffect(() => {
    if (!seoHeader) return;

    document.title = seoHeader.seoTitle || `${seoHeader.title} | WellMeds`;

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", seoHeader.seoDescription || `Buy ${seoHeader.title} online at WellMeds.`);

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${window.location.href}#webpage`,
          "name": seoHeader.title,
          "description": seoHeader.seoDescription || seoHeader.introduction,
          "url": window.location.href
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${window.location.href}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Products",
              "item": `${window.location.origin}/products`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": seoHeader.title,
              "item": window.location.href
            }
          ]
        }
      ]
    };

    if (seoHeader.faqs && seoHeader.faqs.length > 0) {
      jsonLd["@graph"].push({
        "@type": "FAQPage",
        "@id": `${window.location.href}#faq`,
        "mainEntity": seoHeader.faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    script.id = "wellmeds-list-jsonld";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("wellmeds-list-jsonld");
      if (existingScript) existingScript.remove();
    };
  }, [seoHeader]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Main Product Fetcher
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
        maxPrice: priceRange < 2000 ? priceRange : undefined,
        stockStatus: stockStatus !== "all" ? stockStatus : undefined,
        requiresRx: requiresRx !== "all" ? requiresRx : undefined,
        hasDiscount: hasDiscount !== "all" ? "true" : undefined,
        sort: sortBy
      };

      const data = await api.getProducts(params);
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategories, selectedBrands, priceRange, stockStatus, requiresRx, hasDiscount, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories, selectedBrands, priceRange, stockStatus, requiresRx, hasDiscount, sortBy]);

  // Toggle handlers
  const handleCategoryToggle = (catSlug) => {
    setSelectedCategories(prev => {
      const updated = prev.includes(catSlug) ? prev.filter(c => c !== catSlug) : [...prev, catSlug];
      if (updated.length === 1) {
        setSearchParams({ category: updated[0] });
      } else {
        setSearchParams({});
      }
      return updated;
    });
  };

  const handleBrandToggle = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const togglePanel = (panelName) => {
    setExpandedPanels(prev => ({ ...prev, [panelName]: !prev[panelName] }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(2000);
    setStockStatus("all");
    setRequiresRx("all");
    setHasDiscount("all");
    setSearchVal("");
    setSortBy("popularity");
    setSearchParams({});
    if (categorySlug || brandSlug) {
      navigate("/products");
    }
  };

  // Filtered lists for sidebar search
  const filteredCategoriesList = useMemo(() => {
    return categories.filter(cat => 
      cat.name?.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const filteredBrandsList = useMemo(() => {
    return brands.filter(brand => 
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brands, brandSearch]);

  // Active filter chips computation
  const activeChips = useMemo(() => {
    const chips = [];
    selectedCategories.forEach(slug => {
      const catObj = categories.find(c => c.slug === slug);
      const label = catObj ? catObj.name : slug;
      chips.push({ id: `cat-${slug}`, label, type: "category", value: slug });
    });
    selectedBrands.forEach(brand => {
      chips.push({ id: `brand-${brand}`, label: brand, type: "brand", value: brand });
    });
    if (priceRange < 2000) {
      chips.push({ id: "price", label: `Under ₹${priceRange}`, type: "price" });
    }
    if (stockStatus !== "all") {
      chips.push({ id: "stock", label: stockStatus === "in" ? "In Stock" : "Out of Stock", type: "stock" });
    }
    if (requiresRx !== "all") {
      chips.push({ id: "rx", label: requiresRx === "true" ? "Rx Required" : "OTC Only", type: "rx" });
    }
    if (hasDiscount !== "all") {
      chips.push({ id: "discount", label: "Discounted", type: "discount" });
    }
    return chips;
  }, [selectedCategories, selectedBrands, priceRange, stockStatus, requiresRx, hasDiscount, categories]);

  const handleRemoveChip = (chip) => {
    if (chip.type === "category") handleCategoryToggle(chip.value);
    if (chip.type === "brand") handleBrandToggle(chip.value);
    if (chip.type === "price") setPriceRange(2000);
    if (chip.type === "stock") setStockStatus("all");
    if (chip.type === "rx") setRequiresRx("all");
    if (chip.type === "discount") setHasDiscount("all");
  };

  const showingStart = (currentPage - 1) * limit + 1;
  const showingEnd = Math.min(currentPage * limit, totalProducts);

  // Render Filters inside a component for reuse in sidebar and drawer
  const renderFilterContent = () => (
    <div className="space-y-lg text-xs text-left">
      {/* Header action */}
      <div className="flex items-center justify-between pb-sm border-b border-slate-200 dark:border-zinc-850">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <SlidersHorizontal size={16} className="text-primary" />
          FILTERS
        </h3>
        {activeChips.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-[#086b53] dark:text-[#84d6b9] font-bold hover:underline flex items-center gap-0.5 animate-[fade-in_0.2s_ease-out]"
          >
            <RotateCcw size={12} />
            Reset All
          </button>
        )}
      </div>

      {/* Category Accordion */}
      <div className="border-b border-slate-100 dark:border-zinc-850 pb-md">
        <button
          onClick={() => togglePanel("categories")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>CATEGORIES</span>
          {expandedPanels.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.categories && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out]">
            <div className="relative">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-lg pr-sm py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none text-[11px]"
              />
            </div>
            <div className="space-y-xs max-h-48 overflow-y-auto custom-scrollbar pr-xs">
              {filteredCategoriesList.map((cat) => (
                <label key={cat.id || cat._id} className="flex items-center gap-sm cursor-pointer py-0.5 group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-[#004782] focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-slate-600 dark:text-zinc-300 group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400">({cat.count || 0})</span>
                </label>
              ))}
              {filteredCategoriesList.length === 0 && (
                <p className="text-slate-400 py-2 text-center text-[11px]">No matching categories</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Range Accordion */}
      <div className="border-b border-slate-100 dark:border-zinc-850 pb-md">
        <button
          onClick={() => togglePanel("price")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>PRICE RANGE</span>
          {expandedPanels.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.price && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out] px-xs">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
              <span>₹50</span>
              <span className="text-primary dark:text-primary-fixed-dim bg-primary/5 px-2 py-0.5 rounded">Max: ₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Min</span>
              <span>₹2000+</span>
            </div>
          </div>
        )}
      </div>

      {/* Brand Accordion */}
      <div className="border-b border-slate-100 dark:border-zinc-850 pb-md">
        <button
          onClick={() => togglePanel("brands")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>BRANDS</span>
          {expandedPanels.brands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.brands && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out]">
            <div className="relative">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-lg pr-sm py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none text-[11px]"
              />
            </div>
            <div className="space-y-xs max-h-48 overflow-y-auto custom-scrollbar pr-xs">
              {filteredBrandsList.map((brand) => (
                <label key={brand} className="flex items-center gap-sm cursor-pointer py-0.5 group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-[#004782] focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-slate-600 dark:text-zinc-300 group-hover:text-primary transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
              {filteredBrandsList.length === 0 && (
                <p className="text-slate-400 py-2 text-center text-[11px]">No matching brands</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Availability Accordion */}
      <div className="border-b border-slate-100 dark:border-zinc-850 pb-md">
        <button
          onClick={() => togglePanel("availability")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>AVAILABILITY</span>
          {expandedPanels.availability ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.availability && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out] px-xs">
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="stockStatus"
                checked={stockStatus === "all"}
                onChange={() => setStockStatus("all")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300">All Items</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="stockStatus"
                checked={stockStatus === "in"}
                onChange={() => setStockStatus("in")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300 text-emerald-600 dark:text-emerald-450 font-medium">In Stock Only</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="stockStatus"
                checked={stockStatus === "out"}
                onChange={() => setStockStatus("out")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300 text-red-550 font-medium">Out of Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Prescription Required Accordion */}
      <div className="border-b border-slate-100 dark:border-zinc-850 pb-md">
        <button
          onClick={() => togglePanel("prescription")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>PRESCRIPTION CHECK</span>
          {expandedPanels.prescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.prescription && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out] px-xs">
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="requiresRx"
                checked={requiresRx === "all"}
                onChange={() => setRequiresRx("all")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300">All Items</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="requiresRx"
                checked={requiresRx === "true"}
                onChange={() => setRequiresRx("true")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300 flex items-center gap-1 font-medium text-amber-600 dark:text-amber-500">
                Rx Required
              </span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="requiresRx"
                checked={requiresRx === "false"}
                onChange={() => setRequiresRx("false")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300">OTC (No Rx)</span>
            </label>
          </div>
        )}
      </div>

      {/* Discount Accordion */}
      <div className="pb-md">
        <button
          onClick={() => togglePanel("discount")}
          className="w-full flex justify-between items-center py-xs font-bold text-slate-700 dark:text-zinc-200"
        >
          <span>OFFERS & DISCOUNTS</span>
          {expandedPanels.discount ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedPanels.discount && (
          <div className="mt-sm space-y-sm animate-[fade-in_0.2s_ease-out] px-xs">
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="hasDiscount"
                checked={hasDiscount === "all"}
                onChange={() => setHasDiscount("all")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300">All Items</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer py-0.5">
              <input
                type="radio"
                name="hasDiscount"
                checked={hasDiscount === "true"}
                onChange={() => setHasDiscount("true")}
                className="text-[#004782] focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-slate-600 dark:text-zinc-300 flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-550">
                <Tag size={13} />
                Discounted Only
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs & Header */}
      <div className="mb-lg">
        <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
          <span className="cursor-pointer hover:text-[#004782] transition-colors" onClick={() => navigate("/")}>Home</span>
          <span className="material-symbols-outlined text-[12px] text-slate-300">chevron_right</span>
          <span className="text-[#004782] dark:text-[#a4c9ff]">Shop</span>
          {(categorySlug || categoryParam) && (
            <>
              <span className="material-symbols-outlined text-[12px] text-slate-300">chevron_right</span>
              <span className="text-slate-600 dark:text-zinc-200">
                {seoHeader?.title || categorySlug || categoryParam}
              </span>
            </>
          )}
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
          <div className="w-full">
            {seoHeader ? (
              <div className="space-y-sm">
                {seoHeader.banner && (
                  <div className="w-full h-40 md:h-48 rounded-3xl overflow-hidden border border-outline-variant/30 dark:border-outline/20 mb-md relative">
                    <img src={seoHeader.banner} alt={seoHeader.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-lg">
                      <h1 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                        {seoHeader.title}
                      </h1>
                    </div>
                  </div>
                )}
                {!seoHeader.banner && (
                  <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100 tracking-tight">
                    {seoHeader.title}
                  </h1>
                )}
                {seoHeader.introduction && (
                  <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-4xl">
                    {seoHeader.introduction}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100 tracking-tight">
                  Clinical Drug Catalog
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secure prescription verification, authentic formulations, and express doorstep delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-lg items-start relative">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 p-md rounded-2xl shadow-sm sticky top-24 self-start max-h-[82vh] overflow-y-auto custom-scrollbar transition-all duration-300">
          {renderFilterContent()}
        </aside>

        {/* Products Catalogue Area */}
        <section className="flex-grow w-full space-y-md">
          
          {/* Top Toolbar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-md">
            
            {/* Left side: Results Count & Filter Button */}
            <div className="flex items-center justify-between sm:justify-start gap-md">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-300">
                {totalProducts > 0 ? (
                  <>
                    Showing <span className="font-extrabold text-slate-800 dark:text-zinc-100">{showingStart}–{showingEnd}</span> of <span className="font-extrabold text-slate-800 dark:text-zinc-100">{totalProducts}</span> Products
                  </>
                ) : (
                  "0 Products Found"
                )}
              </p>
              
              {/* Mobile/Tablet Filter Trigger */}
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-xs border border-slate-200 dark:border-zinc-800 px-md py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            {/* Right side: Search, Sort, View toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm sm:gap-md">
              
              {/* Debounced Search */}
              <div className="relative flex-grow sm:w-60">
                <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search name, brand, description..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-xl pr-md py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none transition-all"
                />
                {searchVal && (
                  <button 
                    onClick={() => setSearchVal("")}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Selection */}
              <div className="flex items-center gap-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 pr-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="alpha-asc">Name: A–Z</option>
                  <option value="alpha-desc">Name: Z–A</option>
                </select>
              </div>

              {/* View Grid/List toggle */}
              <div className="hidden sm:flex items-center border border-slate-200 dark:border-zinc-800 rounded-xl p-0.5 bg-slate-50 dark:bg-zinc-950">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid" 
                      ? "bg-white dark:bg-zinc-800 text-[#004782] shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "bg-white dark:bg-zinc-800 text-[#004782] shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

            </div>

          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-xs py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-xs select-none">Active Filters:</span>
              {activeChips.map((chip) => (
                <div 
                  key={chip.id} 
                  className="bg-[#004782]/5 dark:bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff] border border-[#004782]/10 text-[11px] font-semibold px-md py-0.5 rounded-lg flex items-center gap-1 animate-[fade-in_0.15s_ease-out]"
                >
                  <span>{chip.label}</span>
                  <button 
                    onClick={() => handleRemoveChip(chip)} 
                    className="hover:bg-[#004782]/10 rounded p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Products Catalogue */}
          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
              <Loader size="lg" />
            </div>
          ) : products.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
                {products.map((prod) => (
                  <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {products.map((prod) => (
                  <div 
                    key={(prod._id || prod.id)?.toString()} 
                    className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl p-md shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center justify-between">
                      
                      {/* Left: Product Thumbnail & Name Info */}
                      <div className="flex items-center gap-md">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-850 shrink-0">
                          <img alt={prod.name} className="w-full h-full object-cover" src={prod.image} />
                        </div>
                        <div className="space-y-xs">
                          <span className="inline-block bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {prod.category}
                          </span>
                          <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-sm leading-snug">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Brand: {prod.brand}
                          </p>
                        </div>
                      </div>

                      {/* Right: Price & Quick actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-lg w-full sm:w-auto border-t sm:border-t-0 pt-sm sm:pt-0 border-slate-100 dark:border-zinc-850">
                        
                        <div className="text-left sm:text-right">
                          <p className="font-black text-slate-800 dark:text-zinc-100 text-base">
                            {Number(prod.price).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                          </p>
                          {prod.originalPrice > prod.price && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {Number(prod.originalPrice).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                            </p>
                          )}
                        </div>

                        {/* We reuse the custom ProductCard internally or provide a clean checkout link */}
                        <div className="w-28 shrink-0">
                          <ProductCard product={prod} />
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-md animate-pulse">inventory_2</span>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Products Registered</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
                We couldn't find any medical supplies matching your selected criteria. Try resetting all filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-lg bg-primary text-white px-lg py-sm rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalProducts > limit && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-lg select-none text-xs font-bold text-slate-400">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-xs px-md py-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span>&larr; Previous</span>
              </button>

              <div className="flex items-center gap-xs">
                {[...Array(Math.ceil(totalProducts / limit))].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                        currentPage === pNum
                          ? "bg-primary text-white shadow-md shadow-primary/10"
                          : "hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-500"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalProducts / limit), prev + 1))}
                disabled={currentPage === Math.ceil(totalProducts / limit)}
                className="flex items-center gap-xs px-md py-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span>Next &rarr;</span>
              </button>
            </div>
          )}

          {/* Category/Brand FAQs */}
          {seoHeader && seoHeader.faqs && seoHeader.faqs.length > 0 && (
            <div className="mt-xxl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-3xl shadow-xs space-y-md text-left">
              <h3 className="font-bold text-base text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                Frequently Asked Questions about {seoHeader.title}
              </h3>
              <div className="space-y-xs divide-y divide-slate-100 dark:divide-zinc-850">
                {seoHeader.faqs.map((faq, idx) => (
                  <details key={idx} className="group pt-sm first:pt-0">
                    <summary className="flex justify-between items-center py-sm font-bold text-slate-700 dark:text-zinc-200 text-xs cursor-pointer list-none">
                      <span className="flex items-center gap-xs">
                        <HelpCircle size={14} className="text-[#004782]" />
                        {faq.question}
                      </span>
                      <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="pb-sm px-md text-[11px] text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

        </section>

      </div>

      {/* Slide-out Mobile/Tablet Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-[fade-in_0.2s_ease-out]">
          
          {/* Dark backdrop */}
          <div 
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-xs"
          ></div>
          
          {/* Filter Card panel */}
          <div className="relative w-80 bg-white dark:bg-zinc-900 h-full p-md shadow-2xl flex flex-col gap-md overflow-y-auto custom-scrollbar animate-[slide-left_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-xs border-b border-slate-100 dark:border-zinc-800">
              <span className="font-black text-sm text-slate-800 dark:text-zinc-100">FILTER SHOP</span>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-850 rounded-lg text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            
            {renderFilterContent()}
            
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="mt-auto bg-primary text-white py-sm rounded-xl font-bold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default ProductsPage;
