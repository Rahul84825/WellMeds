import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("Stock Status");
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch product list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProductsList();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load admin products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        alert("Product deleted successfully.");
      } catch (err) {
        console.error("Failed to delete product", err);
        alert("Failed to delete product.");
      }
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredProducts.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search text match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        if (!matchName && !matchSku) return false;
      }

      // 2. Category match
      if (categoryFilter !== "All Categories") {
        if (p.category !== categoryFilter) return false;
      }

      // 3. Stock filter match
      if (stockFilter === "In Stock" && p.stock === 0) return false;
      if (stockFilter === "Low Stock" && (p.stock === 0 || p.stock > 10)) return false;
      if (stockFilter === "Out of Stock" && p.stock > 0) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const allCategories = ["Prescription", "Vitamins", "Medical Devices", "First Aid", "Personal Care", "Supplements"];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Page Title & Count Header */}
      <div className="flex items-center gap-md mb-lg">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Products</h1>
        <span className="bg-surface-container-high dark:bg-surface-container text-on-surface-variant dark:text-surface-variant px-sm py-xs rounded-full font-label-sm text-label-sm">
          {products.length} Total items
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-sm border border-outline-variant dark:border-outline/40 transition-colors duration-300">
        <div className="flex flex-wrap items-center gap-sm">
          {/* Search bar inside filter row */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-xl pr-md py-sm bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface w-[240px] focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-md pr-xl py-sm bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant dark:text-surface-variant focus:ring-primary dark:bg-inverse-surface"
            >
              <option>All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="appearance-none pl-md pr-xl py-sm bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant dark:text-surface-variant focus:ring-primary dark:bg-inverse-surface"
            >
              <option>Stock Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>
        
        <Link
          to="/admin/products/new"
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 font-bold"
        >
          <span className="material-symbols-outlined">add</span>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant dark:border-outline/40 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant dark:border-outline/40">
              <tr>
                <th className="p-md w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedItems.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs">Product</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs">Category</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs">Price</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs">Stock</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs">Status</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-outline/40">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/30 dark:hover:bg-surface-container-high/20 transition-colors">
                  <td className="p-md text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(p.id)}
                      onChange={() => handleSelectItem(p.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden border border-outline-variant shrink-0">
                        <img alt={p.name} className="w-full h-full object-cover" src={p.image} />
                      </div>
                      <div className="truncate max-w-[200px] sm:max-w-xs">
                        <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{p.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant truncate">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-md font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">{p.category}</td>
                  <td className="p-md font-body-sm text-body-sm font-semibold">{formatCurrency(p.price)}</td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        p.stock > 10 ? "bg-secondary" : p.stock > 0 ? "bg-yellow-500" : "bg-error"
                      }`}></div>
                      <span className="font-body-sm text-body-sm">{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="p-md">
                    <div className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${
                      p.stock > 0
                        ? "bg-secondary-container/30 text-on-secondary-container"
                        : "bg-error-container/20 text-error"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 0 ? "bg-secondary" : "bg-error"}`}></span>
                      {p.stock > 0 ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end gap-sm">
                      <button
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="p-sm hover:bg-surface-container-high dark:hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-sm hover:bg-error-container/20 rounded-lg text-error transition-colors"
                        title="Delete Product"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
