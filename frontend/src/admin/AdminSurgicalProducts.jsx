import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
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
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Scissors,
  Package,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers
} from "lucide-react";

const AdminSurgicalProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract URL parameters
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "All";
  const brandFilter = searchParams.get("brand") || "All";
  const stockFilter = searchParams.get("stock") || "All";
  const activeFilter = searchParams.get("status") || "All";
  const sortOption = searchParams.get("sort") || "name-asc";

  // Data states
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  // Local debounced input
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null, deleting: false });

  // Status toggle loading state
  const [togglingId, setTogglingId] = useState(null);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch surgical categories list for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.getSurgicalCategories();
        setCategoriesList(cats || []);
      } catch (err) {
        console.error("Failed to load surgical categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Update URL params helper
  const updateQueryParams = useCallback((newParams, resetPage = false) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (key === "category" && value === "All") ||
        (key === "brand" && value === "All") ||
        (key === "stock" && value === "All") ||
        (key === "status" && value === "All")
      ) {
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

  // Fetch surgical products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        isSurgical: true,
        sort: sortOption,
      };

      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== "All") params.surgicalCategory = categoryFilter;
      if (brandFilter !== "All") params.brand = brandFilter;
      if (stockFilter !== "All") params.stock = stockFilter === "in" ? "instock" : "out";
      if (activeFilter !== "All") params.isActive = activeFilter === "active";

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setTotalProducts(res.totalProducts || res.total || 0);
      setTotalPages(res.totalPages || res.pages || 1);

      // Collect unique brands from products for filter dropdown
      if (Array.isArray(res.products)) {
        const brands = [...new Set(res.products.map(p => p.manufacturer || p.brand).filter(Boolean))];
        setBrandsList(prev => [...new Set([...prev, ...brands])]);
      }
    } catch (err) {
      console.error("Failed to fetch surgical products", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, brandFilter, stockFilter, activeFilter, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Quick toggle stock status
  const handleToggleStock = async (product) => {
    const prodId = product._id || product.id;
    setTogglingId(prodId);
    try {
      const newInStock = product.inStock !== false ? false : true;
      const newStock = newInStock ? 999 : 0;
      await api.updateProduct(prodId, { inStock: newInStock, stock: newStock });
      setProducts(prev =>
        prev.map(p => (p._id === prodId || p.id === prodId ? { ...p, inStock: newInStock, stock: newStock } : p))
      );
    } catch (err) {
      console.error("Failed to toggle stock status", err);
      alert("Failed to update stock status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Quick toggle active/inactive status
  const handleToggleActive = async (product) => {
    const prodId = product._id || product.id;
    setTogglingId(prodId);
    try {
      const newStatus = product.isActive !== false ? false : true;
      await api.updateProduct(prodId, { isActive: newStatus });
      setProducts(prev =>
        prev.map(p => (p._id === prodId || p.id === prodId ? { ...p, isActive: newStatus } : p))
      );
    } catch (err) {
      console.error("Failed to toggle product status", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Open delete confirmation modal
  const promptDelete = (product) => {
    setDeleteModal({ open: true, product, deleting: false });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteModal.product) return;
    const prodId = deleteModal.product._id || deleteModal.product.id;
    setDeleteModal(prev => ({ ...prev, deleting: true }));
    try {
      await api.deleteProduct(prodId);
      setDeleteModal({ open: false, product: null, deleting: false });
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete surgical product", err);
      alert("Failed to delete product. Please try again.");
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="space-y-6 text-left pb-16">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#157a6d]/10 dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400">
              <Scissors size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Surgical Products
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Manage hospital supplies, clinical instruments, variants, and dynamic specifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/surgical-products/add")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add Surgical Product</span>
        </button>
      </div>

      {/* ── FILTER CONTROLS BAR ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
            />
          </div>

          {/* Surgical Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => updateQueryParams({ category: e.target.value }, true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat._id || cat.id} value={cat.slug || cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => updateQueryParams({ stock: e.target.value }, true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer"
            >
              <option value="All">All Stock Levels</option>
              <option value="in">In Stock Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <select
              value={activeFilter}
              onChange={(e) => updateQueryParams({ status: e.target.value }, true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Summary */}
        {(searchQuery || categoryFilter !== "All" || stockFilter !== "All" || activeFilter !== "All") && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs flex-wrap">
            <span className="text-slate-400 font-semibold">Active Filters:</span>
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                Search: "{searchQuery}"
                <button type="button" onClick={() => updateQueryParams({ search: "" }, true)} className="hover:text-red-500 cursor-pointer">×</button>
              </span>
            )}
            {categoryFilter !== "All" && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                Category: {categoryFilter}
                <button type="button" onClick={() => updateQueryParams({ category: "All" }, true)} className="hover:text-red-500 cursor-pointer">×</button>
              </span>
            )}
            {stockFilter !== "All" && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                Stock: {stockFilter === "in" ? "In Stock" : "Out of Stock"}
                <button type="button" onClick={() => updateQueryParams({ stock: "All" }, true)} className="hover:text-red-500 cursor-pointer">×</button>
              </span>
            )}
            {activeFilter !== "All" && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                Status: {activeFilter}
                <button type="button" onClick={() => updateQueryParams({ status: "All" }, true)} className="hover:text-red-500 cursor-pointer">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => updateQueryParams({ search: "", category: "All", stock: "All", status: "All" }, true)}
              className="text-[#157a6d] hover:underline font-bold ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── PRODUCTS TABLE (DESKTOP) ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#157a6d]" />
            <p className="text-xs text-slate-400">Loading surgical products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-16">Image</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Brand / Mfg</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Variants</th>
                    <th className="py-3.5 px-4 text-right">MRP</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    <th className="py-3.5 px-4 text-center">Stock</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {products.map((p) => {
                    const prodId = p._id || p.id;
                    const variantCount = Array.isArray(p.variants) ? p.variants.length : 0;
                    const isItemInStock = p.inStock !== false && (p.stock === undefined || p.stock > 0);
                    const isActive = p.isActive !== false;
                    const rawCategory = p.surgicalCategory || p.category;
                    const categoryName = typeof rawCategory === "object" ? rawCategory?.name : (rawCategory || "Surgical");

                    return (
                      <tr key={prodId} className="hover:bg-slate-50/75 dark:hover:bg-zinc-800/40 transition-colors">
                        {/* Image */}
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={p.image || DEFAULT_PRODUCT_IMAGE}
                              alt={p.name}
                              className="w-full h-full object-contain select-none"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_PRODUCT_IMAGE;
                              }}
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 max-w-[240px]">
                          <p className="font-bold text-slate-900 dark:text-zinc-100 truncate text-sm" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            {p.sku || `SLUG: ${p.slug}`}
                          </p>
                        </td>

                        {/* Brand */}
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 font-medium truncate max-w-[140px]">
                          {p.manufacturer || p.brand || "—"}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-300 text-[11px] font-semibold">
                            <Scissors size={11} />
                            <span>{categoryName}</span>
                          </span>
                        </td>

                        {/* Variants Count */}
                        <td className="py-3 px-4 text-center">
                          {variantCount > 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                              <Layers size={11} />
                              <span>{variantCount} Variants</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Single (1)</span>
                          )}
                        </td>

                        {/* MRP */}
                        <td className="py-3 px-4 text-right text-slate-400 line-through font-mono">
                          {p.originalPrice ? formatCurrency(p.originalPrice) : "—"}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono text-sm">
                          {formatCurrency(p.price)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(p)}
                            disabled={togglingId === prodId}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              isItemInStock
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200"
                            }`}
                            title="Click to toggle In-Stock / Out-of-Stock"
                          >
                            {isItemInStock ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            disabled={togglingId === prodId}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                            }`}
                            title="Click to toggle status"
                          >
                            {togglingId === prodId ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : isActive ? (
                              <CheckCircle size={11} className="text-emerald-600" />
                            ) : (
                              <XCircle size={11} className="text-slate-400" />
                            )}
                            <span>{isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View On Storefront */}
                            <button
                              type="button"
                              onClick={() => navigate(`/surgical/products/${p.slug || prodId}`)}
                              className="p-2 text-slate-400 hover:text-[#157a6d] hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="View on Storefront"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/surgical-products/${prodId}/edit`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Surgical Product"
                            >
                              <Edit size={15} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => promptDelete(p)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {products.map((p) => {
                const prodId = p._id || p.id;
                const variantCount = Array.isArray(p.variants) ? p.variants.length : 0;
                const isItemInStock = p.inStock !== false && (p.stock === undefined || p.stock > 0);
                const isActive = p.isActive !== false;

                return (
                  <div key={prodId} className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={p.image || DEFAULT_PRODUCT_IMAGE}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {p.manufacturer || p.brand || "Surgical"} • {typeof p.surgicalCategory === "object" ? p.surgicalCategory?.name : "General"}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{formatCurrency(p.price)}</span>
                          {p.originalPrice && (
                            <span className="text-xs text-slate-400 line-through font-mono">{formatCurrency(p.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isItemInStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {isItemInStock ? "In Stock" : "OOS"}
                        </span>
                        {variantCount > 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {variantCount} Variants
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/surgical/products/${p.slug || prodId}`)}
                          className="p-1.5 text-slate-400 hover:text-[#157a6d] rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/surgical-products/${prodId}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            {totalProducts > 0 && (
              <div className="bg-slate-50 dark:bg-zinc-950 px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-zinc-400 select-none">
                <span>
                  Showing {startIndex} to {endIndex} of {totalProducts} surgical products
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => updateQueryParams({ page: Math.max(1, currentPage - 1).toString() })}
                    className="p-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-slate-800 dark:text-zinc-200 font-bold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => updateQueryParams({ page: Math.min(totalPages, currentPage + 1).toString() })}
                    className="p-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center space-y-3 max-w-md mx-auto px-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">No Surgical Products Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No products matched your search or filters. Click "Add Surgical Product" to create your first clinical item.
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/surgical-products/add")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
            >
              <Plus size={14} />
              <span>Add Surgical Product</span>
            </button>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal.open && deleteModal.product && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-5 animate-[scale-in_0.15s_ease-out]">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Surgical Product?</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteModal.product.name}"</span>? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={() => setDeleteModal({ open: false, product: null, deleting: false })}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                {deleteModal.deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{deleteModal.deleting ? "Deleting..." : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSurgicalProducts;
