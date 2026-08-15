import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ShieldAlert,
  CheckCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
  HelpCircle,
  Package
} from "lucide-react";

const ManageProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract URL parameters with safe fallback defaults
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "All";
  const stockFilter = searchParams.get("stock") || "All";
  const rxFilter = searchParams.get("rx") || "All";
  const sortOption = searchParams.get("sort") || "name-asc";

  // Data states
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);

  // Local debounced input for search bar to avoid rapid URL updates
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync search input if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch full category list for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategoriesList(cats || []);
      } catch (err) {
        console.error("Failed to load categories for filter", err);
      }
    };
    fetchCategories();
  }, []);

  // Helper to update URL params
  const updateQueryParams = useCallback((newParams, resetPage = false) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || (key === "category" && value === "All") || (key === "stock" && value === "All") || (key === "rx" && value === "All")) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });

    if (resetPage) {
      updated.set("page", "1");
    }

    setSearchParams(updated, { replace: false });
  }, [searchParams, setSearchParams]);

  // Debounced search query update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateQueryParams({ search: searchInput.trim() }, true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, updateQueryParams]);

  // Fetch products from server whenever pagination or filter parameters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        stock: stockFilter,
        rx: rxFilter,
        sort: sortOption,
      });

      setProducts(res.products || []);
      setTotalProducts(res.totalProducts || res.total || 0);
      setTotalPages(Math.max(1, res.totalPages || res.pages || 1));
    } catch (err) {
      console.error("Failed to load admin products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, stockFilter, rxFilter, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle item deletion with page refetch
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  // Pagination calculation details
  const startIndex = totalProducts > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Package className="text-[#157A6D]" />
            Products Inventory
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage your drug inventory catalog, edit formulas, track stock counts, and verify Rx prescription requirements.
          </p>
        </div>
        <button
          onClick={() => navigate({ pathname: "/admin/products/new", search: location.search })}
          className="bg-[#157A6D] text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:bg-[#116459] active:scale-95 transition-all shadow-md select-none cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Modern Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-sm bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300">

        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, manufacturer, brand..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => updateQueryParams({ category: e.target.value }, true)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Categories</option>
            {categoriesList.map(c => (
              <option key={c._id || c.id || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div className="relative">
          <select
            value={stockFilter}
            onChange={(e) => updateQueryParams({ stock: e.target.value }, true)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Stock Statuses</option>
            <option value="instock">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Sorting option */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => updateQueryParams({ sort: e.target.value }, false)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="name-asc">Sort Name: A-Z</option>
            <option value="name-desc">Sort Name: Z-A</option>
            <option value="price-asc">Sort Price: Low to High</option>
            <option value="price-desc">Sort Price: High to Low</option>
            <option value="stock-asc">Sort Stock: Low to High</option>
            <option value="stock-desc">Sort Stock: High to Low</option>
            <option value="newest">Sort Newest First</option>
          </select>
        </div>
      </div>

      {/* Prescription Filter toggle options bar & Page Size selection */}
      <div className="flex flex-wrap items-center justify-between gap-md text-xs font-semibold text-slate-400 pl-sm">
        <div className="flex flex-wrap gap-xs sm:gap-md items-center">
          <span>Prescription Filter:</span>
          <button
            onClick={() => updateQueryParams({ rx: "All" }, true)}
            className={`px-sm py-0.5 rounded transition-colors ${rxFilter === "All" ? "bg-[#157A6D]/10 text-[#157A6D] dark:text-[#84d6b9]" : "hover:text-slate-600"}`}
          >
            All Items
          </button>
          <button
            onClick={() => updateQueryParams({ rx: "yes" }, true)}
            className={`px-sm py-0.5 rounded transition-colors ${rxFilter === "yes" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400" : "hover:text-slate-600"}`}
          >
            Rx Required
          </button>
          <button
            onClick={() => updateQueryParams({ rx: "no" }, true)}
            className={`px-sm py-0.5 rounded transition-colors ${rxFilter === "no" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400" : "hover:text-slate-600"}`}
          >
            Over-The-Counter (OTC)
          </button>
        </div>

        <div className="flex items-center gap-xs">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => updateQueryParams({ pageSize: e.target.value }, true)}
            className="p-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs outline-none text-slate-700 dark:text-zinc-300"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader size="md" />
          </div>
        )}

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Product</th>
                <th className="p-md">Category</th>
                <th className="p-md">Price</th>
                <th className="p-md">Stock Status</th>
                <th className="p-md">Rx Verify</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {products.map((p) => {
                const isItemInStock = p.inStock !== false && (p.stock === undefined || p.stock > 0);
                const prodId = p.id || p._id;
                return (
                  <tr key={prodId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-md">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-955 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800 shrink-0">
                          <img
                            alt={p.name}
                            className="w-full h-full object-cover"
                            src={p.image || DEFAULT_PRODUCT_IMAGE}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        </div>
                        <div className="truncate max-w-[180px] sm:max-w-xs">
                          <p className="font-bold text-slate-800 dark:text-zinc-100 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{p.manufacturer || p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-md font-medium">{typeof p.category === "object" ? p.category?.name : (p.category || "General")}</td>
                    <td className="p-md font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(p.price)}</td>
                    <td className="p-md">
                      <div className="flex items-center gap-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${isItemInStock ? "bg-emerald-500" : "bg-red-500"
                          }`}></span>
                        <span className="font-semibold">{isItemInStock ? "In Stock" : "Out of Stock"}</span>
                      </div>
                    </td>
                    <td className="p-md">
                      {p.requiresRx || p.isPrescriptionRequired ? (
                        <span className="inline-flex px-2 py-0.5 bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase">
                          Rx Required
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase">
                          OTC Free
                        </span>
                      )}
                    </td>
                    <td className="p-md">
                      {isItemInStock ? (
                        <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold">
                          <ShieldAlert size={10} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => navigate({ pathname: `/admin/products/${prodId}/edit`, search: location.search })}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#157A6D] dark:hover:text-[#84d6b9] rounded-lg transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/products/${p.slug || prodId}`)}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="View details on site"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(prodId, p.name)}
                          className="p-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-lg text-center text-slate-400">No products found matching the specified parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
          {products.map((p) => {
            const isItemInStock = p.inStock !== false && (p.stock === undefined || p.stock > 0);
            const prodId = p.id || p._id;
            return (
              <div key={prodId} className="p-md space-y-sm text-xs">
                <div className="flex gap-md">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-955 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800 shrink-0">
                    <img
                      alt={p.name}
                      className="w-full h-full object-cover"
                      src={p.image || DEFAULT_PRODUCT_IMAGE}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="space-y-xs truncate flex-grow">
                    <p className="font-bold text-slate-800 dark:text-zinc-100 truncate text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {p.manufacturer || p.brand} • {typeof p.category === "object" ? p.category?.name : (p.category || "General")}
                    </p>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-100 text-sm">{formatCurrency(p.price)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-xs items-center justify-between pt-xs">
                  <div className="flex flex-wrap gap-xs items-center">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${isItemInStock ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-red-50 text-red-600 dark:bg-red-955/20"
                      }`}>
                      {isItemInStock ? "In Stock" : "Out of Stock"}
                    </span>

                    {p.requiresRx || p.isPrescriptionRequired ? (
                      <span className="inline-flex px-2 py-0.5 bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-bold uppercase">
                        Rx
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-bold uppercase">
                        OTC
                      </span>
                    )}

                    {isItemInStock ? (
                      <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 rounded-lg text-[9px] font-bold">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-sm">
                    <button
                      onClick={() => navigate({ pathname: `/admin/products/${prodId}/edit`, search: location.search })}
                      className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#157A6D] dark:hover:text-[#84d6b9] rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-100 dark:border-zinc-800 cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => navigate(`/products/${p.slug || prodId}`)}
                      className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-100 dark:border-zinc-800 cursor-pointer"
                      title="View details on site"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(prodId, p.name)}
                      className="p-sm text-red-600 hover:bg-red-55 dark:hover:bg-red-955/20 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-100 dark:border-zinc-800 cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && products.length === 0 && (
            <p className="p-lg text-center text-slate-400">No products found matching the specified parameters.</p>
          )}
        </div>

        {/* Pagination footer */}
        {totalProducts > 0 && (
          <div className="bg-slate-50 dark:bg-zinc-950 px-md py-sm border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-sm text-xs font-semibold text-slate-400 select-none">
            <span>Showing {startIndex} to {endIndex} of {totalProducts} items</span>
            <div className="flex items-center gap-xs">
              <button
                disabled={currentPage <= 1 || loading}
                onClick={() => updateQueryParams({ page: Math.max(1, currentPage - 1).toString() })}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-sm text-slate-700 dark:text-zinc-300 font-bold">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => updateQueryParams({ page: Math.min(totalPages, currentPage + 1).toString() })}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
