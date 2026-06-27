import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  FileText, 
  Users, 
  Activity,
  CheckCircle,
  Package,
  FolderOpen
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProductsCount: 0,
    totalOrdersCount: 0,
    totalUsersCount: 0,
    totalCategoriesCount: 0,
    pendingOrdersCount: 0,
    pendingRxVerification: 0,
    todaySales: 0,
    monthlySales: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getDashboardStats();
      if (statsData) {
        setStats({
          totalSales: statsData.stats?.totalSales || 0,
          totalProductsCount: statsData.stats?.totalProductsCount || 0,
          totalOrdersCount: statsData.stats?.totalOrdersCount || 0,
          totalUsersCount: statsData.stats?.totalUsersCount || 0,
          totalCategoriesCount: statsData.stats?.totalCategoriesCount || 0,
          pendingOrdersCount: statsData.stats?.pendingOrdersCount || 0,
          pendingRxVerification: statsData.stats?.pendingRxVerification || 0,
          todaySales: statsData.stats?.todaySales || 0,
          monthlySales: statsData.stats?.monthlySales || 0
        });
        setRecentOrders(statsData.recentOrders || []);
        setRecentPrescriptions(statsData.recentPrescriptions || []);
        setTopSellingProducts(statsData.topSellingProducts || []);
        setLowStockProducts(statsData.lowStockProducts || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-sm">
        <Loader size="lg" />
        <p className="text-xs text-slate-400 font-medium">Assembling store metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100">Welcome back, Admin</h1>
          <p className="text-xs text-slate-400 font-medium">
            Here's a breakdown of what's happening at WellMeds today.
          </p>
        </div>
      </div>

      {/* Grid: 4 Primary Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        
        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-sm rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#086b53]">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight">
              {formatCurrency(stats.totalSales)}
            </h4>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-sm rounded-xl bg-[#004782]/10 text-[#004782]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight">
              {stats.totalOrdersCount}
            </h4>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-sm rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight">
              {stats.pendingOrdersCount}
            </h4>
          </div>
        </div>

        {/* Pending Rx Reviews Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-sm rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Rx Reviews</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight">
              {stats.pendingRxVerification}
            </h4>
          </div>
        </div>

      </div>

      {/* Grid: 5 Auxiliary Metric Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-sm">
        
        <div className="bg-white dark:bg-zinc-900 p-sm rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Products</p>
          <div className="flex items-center gap-xs mt-xs text-slate-700 dark:text-zinc-200">
            <Package size={14} className="text-[#004782]" />
            <span className="font-extrabold text-sm">{stats.totalProductsCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-sm rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
          <div className="flex items-center gap-xs mt-xs text-slate-700 dark:text-zinc-200">
            <FolderOpen size={14} className="text-secondary" />
            <span className="font-extrabold text-sm">{stats.totalCategoriesCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-sm rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Customers</p>
          <div className="flex items-center gap-xs mt-xs text-slate-700 dark:text-zinc-200">
            <Users size={14} className="text-teal-600" />
            <span className="font-extrabold text-sm">{stats.totalUsersCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-sm rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</p>
          <div className="flex items-center gap-xs mt-xs text-slate-700 dark:text-zinc-200">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="font-extrabold text-sm">{formatCurrency(stats.todaySales)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-sm rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Monthly Sales</p>
          <div className="flex items-center gap-xs mt-xs text-slate-700 dark:text-zinc-200">
            <Calendar size={14} className="text-[#004782]" />
            <span className="font-extrabold text-sm">{formatCurrency(stats.monthlySales)}</span>
          </div>
        </div>

      </div>

      {/* Grid: SVG Performance Chart & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* SVG Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Revenue Tracking</h3>
            <span className="text-[9px] bg-slate-50 dark:bg-zinc-800 px-sm py-0.5 rounded text-slate-400 font-bold">MERN Core Calculations</span>
          </div>
          
          <div className="relative w-full h-48 bg-slate-50 dark:bg-zinc-950 rounded-xl p-md overflow-hidden flex items-end">
            <svg className="absolute inset-0 w-full h-full p-md" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#004782" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#004782" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="100" y2="20" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-zinc-800" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-zinc-800" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-zinc-800" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-zinc-800" />

              <path d="M 0,85 Q 15,62 35,75 T 75,30 T 100,15 L 100,100 L 0,100 Z" fill="url(#gradient-sales)" />
              <path d="M 0,85 Q 15,62 35,75 T 75,30 T 100,15" fill="none" stroke="#004782" strokeWidth="2.5" strokeLinecap="round" />
              
              <circle cx="15" cy="71" r="2.5" fill="#004782" />
              <circle cx="35" cy="75" r="2.5" fill="#004782" />
              <circle cx="75" cy="40" r="2.5" fill="#004782" />
              <circle cx="100" cy="15" r="2.5" fill="#004782" />
            </svg>
            
            <div className="absolute inset-x-0 bottom-1 px-md flex justify-between text-[9px] text-slate-400 font-bold">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-sm border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Low Stock Warnings</h3>
              <AlertCircle size={14} className="text-amber-500 animate-pulse" />
            </div>
            
            <div className="space-y-sm mt-sm">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(p => (
                  <div key={p._id || p.id} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950 p-xs rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-xs truncate">
                      <img src={p.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                      <div className="truncate">
                        <p className="font-bold truncate text-slate-800 dark:text-zinc-200">{p.name}</p>
                        <p className="text-[9px] text-slate-400">Stock level: {p.stock}</p>
                      </div>
                    </div>
                    <span className={`px-sm py-0.5 rounded font-black text-[9px] ${
                      p.stock === 0 ? "bg-red-100 text-red-600 dark:bg-red-950/30" : "bg-amber-100 text-amber-700 dark:bg-amber-950/30"
                    }`}>
                      {p.stock === 0 ? "Out" : `${p.stock} units`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-md">All inventory stock levels are healthy.</p>
              )}
            </div>
          </div>
          <Link to="/admin/products" className="w-full text-center text-xs font-bold text-[#004782] dark:text-[#a4c9ff] hover:underline pt-md">
            Manage Catalog
          </Link>
        </div>

      </div>

      {/* Grid: Top Selling Products & Recent Prescriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm">
          <div className="flex items-center justify-between pb-xs border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Top Selling Items</h3>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>

          <div className="space-y-sm">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map(p => (
                <div key={p._id || p.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-xs truncate">
                    <img src={p.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                    <div className="truncate">
                      <p className="font-bold truncate text-slate-800 dark:text-zinc-200">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.category}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-800 dark:text-zinc-200 shrink-0">
                    {p.unitsSold} units
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-md">No sales logged yet.</p>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm">
          <div className="flex items-center justify-between pb-xs border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Recent Prescriptions</h3>
            <Link to="/admin/prescriptions" className="text-xs text-[#004782] hover:underline font-bold">
              Verification Panel
            </Link>
          </div>

          <div className="space-y-sm">
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map(o => (
                <div key={o._id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{o.user?.name || "Patient"}</p>
                    <p className="text-[10px] text-slate-400">{o.user?.email || "—"} • {formatDate(o.createdAt)}</p>
                  </div>
                  <span className={`px-sm py-0.5 rounded font-black text-[9px] ${
                    o.status === "Approved" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" 
                      : o.status === "Rejected"
                      ? "bg-red-100 text-red-600 dark:bg-red-950/30"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30"
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-md">No recent prescriptions uploaded.</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm">
        <div className="flex items-center justify-between pb-xs border-b border-slate-100 dark:border-zinc-800">
          <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-[#004782] hover:underline font-bold">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-sm rounded-l-xl">Order ID</th>
                <th className="p-sm">Date</th>
                <th className="p-sm">Customer</th>
                <th className="p-sm">Subtotal</th>
                <th className="p-sm">Discount</th>
                <th className="p-sm">Total Paid</th>
                <th className="p-sm">Rx Verification</th>
                <th className="p-sm rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {recentOrders.map((order) => (
                <tr key={order.orderId || order._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-sm font-bold text-slate-800 dark:text-zinc-100 font-mono text-xs">{order.orderId}</td>
                  <td className="p-sm">{formatDate(order.createdAt)}</td>
                  <td className="p-sm">
                    <p className="font-bold text-slate-800 dark:text-zinc-100">{order.customer}</p>
                    <p className="text-[10px] text-slate-400">{order.email}</p>
                  </td>
                  <td className="p-sm">{formatCurrency(order.subtotal)}</td>
                  <td className="p-sm text-red-500 font-semibold">
                    {order.discountAmount > 0 ? `-${formatCurrency(order.discountAmount)}` : "—"}
                  </td>
                  <td className="p-sm font-extrabold text-slate-800 dark:text-zinc-100">
                    {formatCurrency(order.finalAmount || order.total)}
                  </td>
                  <td className="p-sm">
                    {order.rxUploaded ? (
                      <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-bold">
                        Attached
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-zinc-600 text-[10px]">No Rx</span>
                    )}
                  </td>
                  <td className="p-sm text-right">
                    <Link
                      to="/admin/orders"
                      className="text-[#004782] font-bold hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-lg text-center text-slate-400">No recent orders logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
