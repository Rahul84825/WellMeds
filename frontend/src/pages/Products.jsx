import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(100); // Max $100 default limit
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [stockStatus, setStockStatus] = useState("all"); // 'all', 'in', 'out'
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync parameters from URL query strings on load/change
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update selected categories when URL query parameter updates
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [categoryParam]);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParam]);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories(prev => {
      const index = prev.indexOf(categoryName);
      let updated;
      if (index > -1) {
        updated = prev.filter(c => c !== categoryName);
      } else {
        updated = [...prev, categoryName];
      }
      
      // Update URL param if there is only 1 selected category
      if (updated.length === 1) {
        setSearchParams({ category: updated[0] });
      } else {
        const newParams = {};
        if (searchParam) newParams.search = searchParam;
        setSearchParams(newParams);
      }
      return updated;
    });
  };

  const handleBrandToggle = (brandName) => {
    setSelectedBrands(prev => {
      const index = prev.indexOf(brandName);
      if (index > -1) {
        return prev.filter(b => b !== brandName);
      }
      return [...prev, brandName];
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(100);
    setStockStatus("all");
    setMinRating(0);
    setSortBy("popularity");
    setSearchParams({});
    setCurrentPage(1);
  };

  // Unique list of categories and brands for sidebar checks
  const allBrands = useMemo(() => {
    return [...new Set(products.map(p => p.brand))];
  }, [products]);

  const allCategories = ["Prescription", "Vitamins", "Medical Devices", "First Aid", "Personal Care", "Supplements"];

  // Filtered and sorted products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // 1. Search text match
        if (searchParam) {
          const query = searchParam.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchBrand = p.brand.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchBrand) return false;
        }

        // 2. Category match
        if (selectedCategories.length > 0) {
          if (!selectedCategories.includes(p.category)) return false;
        }

        // 3. Price match
        if (p.price > priceRange) return false;

        // 4. Brand match
        if (selectedBrands.length > 0) {
          if (!selectedBrands.includes(p.brand)) return false;
        }

        // 5. Stock availability match
        if (stockStatus === "in" && p.stock === 0) return false;
        if (stockStatus === "out" && p.stock > 0) return false;

        // 6. Rating match
        if (p.rating && p.rating < minRating) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort matching
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        // Default Popularity (represented by reviews count)
        return b.reviewsCount - a.reviewsCount;
      });
  }, [products, searchParam, selectedCategories, priceRange, selectedBrands, stockStatus, minRating, sortBy]);

  // Paginated chunk
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out]">
      {/* Breadcrumbs & Title */}
      <div className="mb-xl text-left">
        <nav className="flex items-center text-label-sm text-on-surface-variant dark:text-surface-variant gap-xs mb-md">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/")}>Home</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary dark:text-primary-fixed-dim font-bold">Shop</span>
          {categoryParam && (
            <>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary dark:text-primary-fixed-dim font-bold">{categoryParam}</span>
            </>
          )}
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Medical Essentials</h1>
        {searchParam && (
          <p className="text-body-sm text-on-surface-variant mt-1">
            Search results for: <strong className="text-on-surface">"{searchParam}"</strong>
          </p>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-xl text-left">
          {/* Header Action */}
          <div className="flex items-center justify-between pb-sm border-b border-outline-variant dark:border-outline/40">
            <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-body-sm text-primary dark:text-primary-fixed-dim hover:underline font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mb-lg font-semibold">
              Categories
            </h4>
            <ul className="space-y-sm">
              {allCategories.map((cat) => (
                <li key={cat}>
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-body-sm text-on-surface group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors">
                      {cat}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="pt-lg border-t border-outline-variant dark:border-outline/40">
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mb-lg font-semibold">
              Max Price: ${priceRange}
            </h4>
            <div className="px-2">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1 bg-surface-container-high dark:bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-md text-label-sm text-on-surface-variant dark:text-surface-variant">
                <span>$5</span>
                <span>$100+</span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-lg border-t border-outline-variant dark:border-outline/40">
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mb-lg font-semibold">
              Brand
            </h4>
            <div className="space-y-md max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {allBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-outline-variant text-primary h-4 w-4"
                  />
                  <span className="font-body-sm text-on-surface group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="pt-lg border-t border-outline-variant dark:border-outline/40">
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mb-lg font-semibold">
              Availability
            </h4>
            <div className="flex flex-col gap-md">
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={stockStatus === "all"}
                  onChange={() => { setStockStatus("all"); setCurrentPage(1); }}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body-sm text-on-surface">All Products</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={stockStatus === "in"}
                  onChange={() => { setStockStatus("in"); setCurrentPage(1); }}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body-sm text-on-surface">In Stock Only</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={stockStatus === "out"}
                  onChange={() => { setStockStatus("out"); setCurrentPage(1); }}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body-sm text-on-surface">Out of Stock Only</span>
              </label>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pt-lg border-t border-outline-variant dark:border-outline/40">
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mb-lg font-semibold">
              Rating
            </h4>
            <div className="space-y-md">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => { setMinRating(stars); setCurrentPage(1); }}
                  className={`flex items-center gap-sm group w-full py-1 px-2 rounded-lg transition-colors ${
                    minRating === stars ? "bg-primary-container text-on-primary-container font-bold" : "hover:bg-surface-container"
                  }`}
                >
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-body-sm text-on-surface-variant">&amp; Up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid & Results area */}
        <section className="flex-1">
          {/* Top Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl bg-surface-container-lowest dark:bg-inverse-surface p-md rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm transition-colors duration-300">
            <div className="flex flex-wrap items-center gap-sm">
              <button
                onClick={() => { setSelectedCategories([]); setSearchParams({}); }}
                className={`px-md py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                  selectedCategories.length === 0
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "bg-surface-container-high dark:bg-surface-container text-on-surface-variant dark:text-surface-variant hover:bg-primary-fixed"
                }`}
              >
                All Products
              </button>
              {allCategories.slice(0, 3).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`px-md py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "bg-surface-container-high dark:bg-surface-container text-on-surface-variant dark:text-surface-variant hover:bg-primary-fixed"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-lg border-t sm:border-t-0 sm:border-l border-outline-variant dark:border-outline/40 pt-md sm:pt-0 sm:pl-lg">
              <p className="font-body-sm text-on-surface-variant dark:text-surface-variant whitespace-nowrap">
                <span className="font-bold text-on-surface">{filteredProducts.length}</span> results found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-label-md text-label-md focus:ring-0 cursor-pointer text-on-surface dark:bg-inverse-surface"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-lg">
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-xxl bg-surface-container-low dark:bg-inverse-surface/30 rounded-xl border border-outline-variant dark:border-outline/40">
              <span className="material-symbols-outlined text-5xl text-outline mb-md">inventory_2</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No Products Found</h3>
              <p className="font-body-sm text-on-surface-variant dark:text-surface-variant mt-sm">
                We couldn't find any products matching your filters. Try clearing some options.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-lg bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-colors active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-xxl flex justify-center items-center gap-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:bg-inverse-surface"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-primary text-white"
                      : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary dark:bg-inverse-surface"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:bg-inverse-surface"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;
