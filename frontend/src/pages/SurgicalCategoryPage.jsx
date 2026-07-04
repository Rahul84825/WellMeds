import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  Search, 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FolderOpen
} from "lucide-react";

const SurgicalCategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  const LIMIT = 24;

  // Fetch Category Details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoadingCategory(true);
      try {
        const cat = await api.getSurgicalCategory(categorySlug);
        setCategory(cat);

        // Dynamic SEO Optimization
        if (cat) {
          document.title = cat.seoTitle || `${cat.name} Surgical Supplies & Equipment | WellMeds`;
          let metaDesc = document.querySelector("meta[name='description']");
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute("content", cat.seoDescription || cat.description || `Browse quality clinical ${cat.name} products at WellMeds.`);
          
          let canonical = document.querySelector("link[rel='canonical']");
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
          }
          canonical.href = window.location.href;
        }
      } catch (err) {
        console.error("Failed to load category details", err);
      } finally {
        setLoadingCategory(false);
      }
    };
    fetchCategoryDetails();
    setCurrentPage(1); // Reset pagination on category change
  }, [categorySlug]);

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!category) return;
    setLoadingProducts(true);
    try {
      const data = await api.getProducts({
        page: currentPage,
        limit: LIMIT,
        isSurgical: "true",
        surgicalCategory: category.id || category._id,
        search: debouncedSearch || undefined
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (err) {
      console.error("Failed to load category products", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [currentPage, debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side sorting
  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === "price_asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted;
  };

  if (loadingCategory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-margin-desktop py-xxl text-center">
        <ShieldAlert className="mx-auto text-red-500 mb-md" size={48} />
        <h2 className="font-extrabold text-xl text-slate-800 dark:text-zinc-100">Category Not Found</h2>
        <p className="text-xs text-slate-400 mt-xs mb-lg">The surgical category you are looking for does not exist or has been disabled.</p>
        <Link to="/surgical" className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs">
          Back to Surgical Landing
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(totalProducts / LIMIT) || 1;
  const sortedProducts = getSortedProducts();

  return (
    <div className="max-w-7xl mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#004782] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="cursor-pointer hover:text-[#004782] transition-colors" onClick={() => navigate("/surgical")}>Surgical</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#004782] dark:text-[#a4c9ff]">{category.name}</span>
      </nav>

      {/* Category Header with Banner Image */}
      <div 
        className="relative rounded-3xl overflow-hidden bg-cover bg-center text-white p-lg sm:p-xl md:p-xxl shadow-lg border border-slate-100 dark:border-zinc-800 mb-xl select-none"
        style={{ 
          backgroundImage: category.bannerImage 
            ? `url(${category.bannerImage})` 
            : "linear-gradient(to bottom right, #001f3f, #004782, #086b53)" 
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-0"></div>

        <div className="relative z-10 max-w-2xl space-y-md text-left">
          <div className="inline-flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
            <FolderOpen size={12} className="text-white" />
            Surgical Department
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {category.description || `Quality products and equipment categorized under our ${category.name} section.`}
          </p>
        </div>
      </div>

      {/* Catalog Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-md mb-xl">
        
        {/* Search */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl px-sm py-2 w-full max-w-md">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={`Search within ${category.name}...`}
            className="bg-transparent border-none outline-none w-full text-xs ml-xs dark:text-zinc-200"
          />
          {searchVal && (
            <button onClick={() => setSearchVal("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-xs shrink-0">
          <span className="text-slate-400 text-xs font-bold whitespace-nowrap">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-sm bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 focus:border-primary rounded-xl outline-none text-xs dark:text-zinc-200 font-semibold"
          >
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Products Grid */}
      {loadingProducts ? (
        <div className="min-h-[30vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="space-y-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
            {sortedProducts.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-md select-none">
              <div className="text-slate-400 text-xs font-semibold">
                Showing Page {currentPage} of {totalPages} ({totalProducts} items found)
              </div>
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldAlert className="mx-auto text-slate-350 dark:text-zinc-700 mb-md" size={48} />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Products in Category</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-xs">
            There are currently no surgical products assigned to this category. Check back later or explore other sections.
          </p>
        </div>
      )}

    </div>
  );
};

export default SurgicalCategoryPage;
