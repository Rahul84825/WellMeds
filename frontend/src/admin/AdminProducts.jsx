import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { formatCurrency } from "../utils/currency";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");
  const [sortOption, setSortOption] = useState("name-asc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    toast.warning(`Are you sure you want to permanently delete "${name}" from the catalog?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
            toast.success("Product deleted successfully.");
          } catch (err) {
            console.error("Failed to delete product", err);
            toast.error("Failed to delete product.");
          }
        }
      }
    });
  };

  // Extract all categories dynamically for filter options
  const categoriesList = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  // Filter products logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    // 2. Category filtering
    if (categoryFilter !== "All") {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 3. Stock warning filtering
    if (stockFilter !== "All") {
      if (stockFilter === "instock") result = result.filter(p => p.stock > 10);
      else if (stockFilter === "lowstock") result = result.filter(p => p.stock <= 10 && p.stock > 0);
      else if (stockFilter === "out") result = result.filter(p => p.stock === 0);
    }

    // 4. Prescription requirement filtering
    if (rxFilter !== "All") {
      const needsRx = rxFilter === "yes";
      result = result.filter(p => p.requiresRx === needsRx);
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, rxFilter, sortOption]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter, rxFilter, sortOption]);

  // Paginated items
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Package className="text-[#004782]" />
            Products Inventory
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage your drug inventory catalog, edit formulas, track stock counts, and verify Rx prescription requirements.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 select-none cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Modern Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-sm bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Categories</option>
            {categoriesList.filter(c => c !== "All").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div className="relative">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Stock Levels</option>
            <option value="instock">In Stock (&gt;10)</option>
            <option value="lowstock">Low Stock (≤10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        {/* Sorting option */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="name-asc">Sort Name: A-Z</option>
            <option value="name-desc">Sort Name: Z-A</option>
            <option value="price-asc">Sort Price: Low to High</option>
            <option value="price-desc">Sort Price: High to Low</option>
            <option value="stock-asc">Sort Stock: Low to High</option>
            <option value="stock-desc">Sort Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Prescription Filter toggle options bar */}
      <div className="flex gap-md text-xs font-semibold text-slate-400 items-center pl-sm">
        <span>Prescription Filter:</span>
        <button 
          onClick={() => setRxFilter("All")}
          className={`px-sm py-0.5 rounded ${rxFilter === "All" ? "bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff]" : "hover:text-slate-600"}`}
        >
          All Items
        </button>
        <button 
          onClick={() => setRxFilter("yes")}
          className={`px-sm py-0.5 rounded ${rxFilter === "yes" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400" : "hover:text-slate-600"}`}
        >
          Rx Required
        </button>
        <button 
          onClick={() => setRxFilter("no")}
          className={`px-sm py-0.5 rounded ${rxFilter === "no" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400" : "hover:text-slate-600"}`}
        >
          Over-The-Counter (OTC)
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Product</th>
                <th className="p-md">Category</th>
                <th className="p-md">Price</th>
                <th className="p-md">Stock Count</th>
                <th className="p-md">Rx Verify</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {paginatedProducts.map((p) => (
                <tr key={p.id || p._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800 shrink-0">
                        <img alt={p.name} className="w-full h-full object-cover" src={p.image} />
                      </div>
                      <div className="truncate max-w-[180px] sm:max-w-xs">
                        <p className="font-bold text-slate-800 dark:text-zinc-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-md font-medium">{p.category}</td>
                  <td className="p-md font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(p.price)}</td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        p.stock > 10 ? "bg-emerald-500" : p.stock > 0 ? "bg-amber-500" : "bg-red-500"
                      }`}></span>
                      <span className="font-semibold">{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="p-md">
                    {p.requiresRx ? (
                      <span className="inline-flex px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase">
                        Rx Required
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase">
                        OTC Free
                      </span>
                    )}
                  </td>
                  <td className="p-md">
                    {p.stock > 0 ? (
                      <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold">
                        <ShieldAlert size={10} /> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <button
                        onClick={() => navigate(`/admin/products/${p.id || p._id}/edit`)}
                        className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] dark:hover:text-[#a4c9ff] rounded-lg"
                        title="Edit Details"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/product/${p.id || p._id}`)}
                        className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg"
                        title="View details on site"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id || p._id, p.name)}
                        className="p-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-lg text-center text-slate-400">No items match the chosen filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-zinc-950 px-md py-sm border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-400 select-none">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</span>
            <div className="flex items-center gap-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-sm text-slate-700 dark:text-zinc-300">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
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
