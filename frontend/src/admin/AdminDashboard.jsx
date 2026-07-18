import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { toast } from "sonner";
import { 
  DollarSign, 
  ShoppingBag, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users, 
  Activity,
  Package,
  FolderOpen,
  FileSpreadsheet,
  Download,
  Percent,
  Layers,
  ArrowRight
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// CUSTOM RESPONSIVE SVG LINE CHART
// ──────────────────────────────────────────────────────────────────────
const BusinessChart = ({ data, activeTab, setActiveTab }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-zinc-950 rounded-xl">
        <p className="text-xs text-slate-400">No chart data available</p>
      </div>
    );
  }

  const metric = activeTab === "revenue" ? "sales" : "orders";
  const values = data.map(d => d[metric]);
  const maxValue = Math.max(...values, 5); // Fallback limit to avoid division by 0
  
  const width = 600;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const ratio = maxValue > 0 ? d[metric] / maxValue : 0;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { x, y, ...d };
  });
  
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }
  
  let areaD = "";
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }
  
  return (
    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm relative">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Business Analytics</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time daily transaction analysis</p>
        </div>
        <div className="flex bg-slate-50 dark:bg-zinc-950 p-0.5 rounded-lg border border-slate-150 dark:border-zinc-800">
          <button 
            onClick={() => setActiveTab("revenue")}
            className={`px-sm py-1 text-[10px] font-extrabold rounded-md transition-all ${
              activeTab === "revenue" 
                ? "bg-[#004782] text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
          >
            Revenue (₹)
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-sm py-1 text-[10px] font-extrabold rounded-md transition-all ${
              activeTab === "orders" 
                ? "bg-[#004782] text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
          >
            Orders
          </button>
        </div>
      </div>
      
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#004782" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#004782" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = paddingTop + chartHeight * r;
            const gridVal = maxValue - r * maxValue;
            return (
              <g key={i} className="opacity-40 dark:opacity-20">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#cbd5e1" 
                  strokeWidth="0.5" 
                  strokeDasharray="4 4" 
                  className="dark:stroke-zinc-700"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="fill-slate-400 dark:fill-zinc-400 font-bold text-[8px]"
                >
                  {activeTab === "revenue" ? `₹${Math.round(gridVal).toLocaleString()}` : Math.round(gridVal)}
                </text>
              </g>
            );
          })}
          
          {/* Line and Area */}
          <path d={areaD} fill="url(#chart-glow)" className="transition-all duration-300" />
          <path d={pathD} fill="none" stroke="#004782" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />
          
          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="18" 
                fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoverIndex === i ? "5" : "3"} 
                fill={hoverIndex === i ? "#004782" : "#ffffff"} 
                stroke="#004782" 
                strokeWidth={hoverIndex === i ? "2.5" : "1.5"} 
                className="transition-all duration-150 pointer-events-none"
              />
            </g>
          ))}
          
          {/* Labels */}
          {points.map((p, i) => (
            <text 
              key={i} 
              x={p.x} 
              y={height - paddingBottom + 18} 
              textAnchor="middle" 
              className="fill-slate-400 dark:fill-zinc-500 font-extrabold text-[8px]"
            >
              {p.day}
            </text>
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div 
            className="absolute bg-slate-900/95 dark:bg-zinc-950/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 dark:border-zinc-800 text-[10px] space-y-0.5 pointer-events-none z-10"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${(points[hoverIndex].y / height) * 100 - 15}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-extrabold text-slate-400 tracking-wider uppercase text-[8px]">{points[hoverIndex].date}</p>
            <p className="font-semibold">Revenue: <span className="font-extrabold text-emerald-400">₹{points[hoverIndex].sales.toLocaleString()}</span></p>
            <p className="font-semibold">Orders: <span className="font-extrabold text-[#a4c9ff]">{points[hoverIndex].orders}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// DOUGHNUT-PROGRESS CHART FOR ORDER STATUS
// ──────────────────────────────────────────────────────────────────────
const OrderStatusDistribution = ({ distribution }) => {
  if (!distribution || distribution.length === 0) return null;
  
  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  
  const statusThemes = {
    "Pending": { color: "bg-amber-500", text: "text-amber-500" },
    "Processing": { color: "bg-blue-500", text: "text-blue-500" },
    "Prescription Review": { color: "bg-purple-500", text: "text-purple-500" },
    "Approved": { color: "bg-indigo-500", text: "text-indigo-500" },
    "Packed": { color: "bg-emerald-500", text: "text-emerald-500" },
    "Shipped": { color: "bg-cyan-500", text: "text-cyan-500" },
    "Delivered": { color: "bg-teal-600", text: "text-teal-600" },
    "Cancelled": { color: "bg-red-500", text: "text-red-500" },
  };

  const defaultTheme = { color: "bg-slate-500", text: "text-slate-500" };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-md">
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
        <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Order Status Distribution</h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time status analysis of current queue</p>
      </div>

      <div className="space-y-xs max-h-[190px] overflow-y-auto pr-xs custom-scrollbar">
        {distribution.map((item) => {
          const theme = statusThemes[item.status] || defaultTheme;
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.status} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="flex items-center gap-xs">
                  <span className={`w-2 h-2 rounded-full ${theme.color}`} />
                  {item.status}
                </span>
                <span className="font-extrabold">
                  {item.count} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-slate-100/50 dark:border-zinc-800/50">
                <div 
                  className={`h-full rounded-full ${theme.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// CATEGORY PRODUCT DENSITY BAR CHART
// ──────────────────────────────────────────────────────────────────────
const CategoryDistribution = ({ distribution }) => {
  if (!distribution || distribution.length === 0) return null;
  
  const maxVal = Math.max(...distribution.map(d => d.count), 1);
  
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-md">
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
        <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Catalog by Category</h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Product density per category</p>
      </div>

      <div className="space-y-xs max-h-[190px] overflow-y-auto pr-xs custom-scrollbar">
        {distribution.map((item, index) => {
          const percentage = Math.round((item.count / maxVal) * 100);
          return (
            <div key={index} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-350">
                <span className="truncate max-w-[150px]">{item.categoryName}</span>
                <span className="font-extrabold text-[#004782] dark:text-[#a4c9ff]">
                  {item.count} <span className="text-[9px] text-slate-400 font-normal">items</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 dark:bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#004782] dark:bg-[#a4c9ff]/80 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ──────────────────────────────────────────────────────────────────────
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
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue"); // revenue or orders
  const [downloadingSales, setDownloadingSales] = useState(false);
  const [downloadingCustomers, setDownloadingCustomers] = useState(false);

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
        setOutOfStockProducts(statsData.outOfStockProducts || []);
        setDailySales(statsData.dailySales || []);
        setOrderStatusDistribution(statsData.orderStatusDistribution || []);
        setCategoryDistribution(statsData.categoryDistribution || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDownloadSales = async () => {
    if (downloadingSales) return;
    try {
      setDownloadingSales(true);
      toast.info("Assembling sales report, please wait...");
      const blob = await api.downloadSalesReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Sales report downloaded successfully!");
    } catch (err) {
      console.error("Failed to export sales report", err);
      toast.error("Failed to download sales report.");
    } finally {
      setDownloadingSales(false);
    }
  };

  const handleDownloadCustomers = async () => {
    if (downloadingCustomers) return;
    try {
      setDownloadingCustomers(true);
      toast.info("Assembling customer report, please wait...");
      const blob = await api.downloadCustomersReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customer_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Customer report downloaded successfully!");
    } catch (err) {
      console.error("Failed to export customer report", err);
      toast.error("Failed to download customer report.");
    } finally {
      setDownloadingCustomers(false);
    }
  };

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
      
      {/* Title Block with Redesigned Excel Download Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100">Welcome back, Admin</h1>
          <p className="text-xs text-slate-400 font-medium">
            Here's a breakdown of what's happening at WellMeds today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <button
            onClick={handleDownloadSales}
            disabled={downloadingSales}
            className="flex items-center gap-xs text-[11px] font-bold text-white bg-[#004782] hover:bg-[#003c70] active:scale-95 px-md py-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none min-h-[38px]"
          >
            {downloadingSales ? (
              <Loader size="xs" color="text-white" />
            ) : (
              <FileSpreadsheet size={14} className="shrink-0" />
            )}
            <span>Sales Report (Excel)</span>
          </button>
          
          <button
            onClick={handleDownloadCustomers}
            disabled={downloadingCustomers}
            className="flex items-center gap-xs text-[11px] font-bold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 px-md py-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none min-h-[38px]"
          >
            {downloadingCustomers ? (
              <Loader size="xs" color="text-slate-500" />
            ) : (
              <Download size={14} className="shrink-0 text-[#004782] dark:text-[#a4c9ff]" />
            )}
            <span>Customer Report (Excel)</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Primary Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        
        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200 glass-card">
          <div className="p-sm rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#086b53] dark:text-emerald-400">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight mt-0.5">
              {formatCurrency(stats.totalSales)}
            </h4>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200 glass-card">
          <div className="p-sm rounded-xl bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight mt-0.5">
              {stats.totalOrdersCount}
            </h4>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200 glass-card">
          <div className="p-sm rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight mt-0.5">
              {stats.pendingOrdersCount}
            </h4>
          </div>
        </div>

        {/* Pending Rx Reviews Card */}
        <div className="bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-md hover:-translate-y-0.5 transition-all duration-200 glass-card">
          <div className="p-sm rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Rx Reviews</p>
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 leading-tight mt-0.5">
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
            <Users size={14} className="text-teal-650" />
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

      {/* Grid: SVG Performance Chart & Out of Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* Business Analytics Line Graph */}
        <BusinessChart data={dailySales} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Out of Stock Alerts Widget (Replaces numeric low stock warnings) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-sm border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Out of Stock Alerts</h3>
              <AlertCircle size={14} className="text-red-500 animate-pulse" />
            </div>
            
            <div className="space-y-sm mt-sm">
              {outOfStockProducts.length > 0 ? (
                outOfStockProducts.map(p => (
                  <div key={p._id || p.id} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950 p-xs rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-xs truncate">
                      <img src={p.image} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-zinc-700" alt="" />
                      <div className="truncate">
                        <p className="font-bold truncate text-slate-800 dark:text-zinc-200">{p.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {typeof p.category === "object" ? p.category?.name : "OTC Product"}
                        </p>
                      </div>
                    </div>
                    <span className="px-sm py-0.5 rounded font-black text-[9px] bg-red-50 text-red-600 dark:bg-red-950/20 shrink-0">
                      Out of Stock
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-md">All catalog inventory levels are healthy.</p>
              )}
            </div>
          </div>
          <Link to="/admin/products" className="w-full text-center text-xs font-bold text-[#004782] dark:text-[#a4c9ff] hover:underline pt-md">
            Manage Catalog
          </Link>
        </div>

      </div>

      {/* Grid: Order Status & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        
        {/* Status Distribution */}
        <OrderStatusDistribution distribution={orderStatusDistribution} />

        {/* Category Density Chart */}
        <CategoryDistribution distribution={categoryDistribution} />

      </div>

      {/* Grid: Top Selling Products & Recent Prescriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm space-y-sm">
          <div className="flex items-center justify-between pb-xs border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">Top Selling Items</h3>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>

          <div className="space-y-sm max-h-[220px] overflow-y-auto pr-xs custom-scrollbar">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map(p => (
                <div key={p._id || p.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-xs truncate">
                    <img src={p.image} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-zinc-700" alt="" />
                    <div className="truncate">
                      <p className="font-bold truncate text-slate-800 dark:text-zinc-200">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{typeof p.category === "object" ? p.category?.name : p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    <span className={`px-sm py-0.5 rounded font-black text-[9px] ${
                      p.inStock ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-red-50 text-red-650 dark:bg-red-950/20"
                    }`}>
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    <span className="font-black text-slate-800 dark:text-zinc-200">
                      {p.unitsSold} units
                    </span>
                  </div>
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
            <Link to="/admin/prescriptions" className="text-xs text-[#004782] dark:text-[#a4c9ff] hover:underline font-bold flex items-center gap-0.5">
              <span>Verification Panel</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-sm max-h-[220px] overflow-y-auto pr-xs custom-scrollbar">
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
                      ? "bg-red-100 text-red-650 dark:bg-red-950/30"
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
          <Link to="/admin/orders" className="text-xs text-[#004782] dark:text-[#a4c9ff] hover:underline font-bold flex items-center gap-0.5">
            <span>View All Orders</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
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
                      <span className="text-slate-350 dark:text-zinc-600 text-[10px]">No Rx</span>
                    )}
                  </td>
                  <td className="p-sm text-right">
                    <Link
                      to="/admin/orders"
                      className="text-[#004782] dark:text-[#a4c9ff] font-bold hover:underline"
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

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-sm">
          {recentOrders.map((order) => (
            <div key={order.orderId || order._id} className="bg-slate-50 dark:bg-zinc-950/40 p-md rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-sm text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold font-mono text-slate-800 dark:text-zinc-100">{order.orderId}</span>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center pt-xs border-t border-slate-100 dark:border-zinc-800/60">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">{order.customer}</p>
                  <p className="text-[10px] text-slate-400">{order.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-800 dark:text-zinc-100">{formatCurrency(order.finalAmount || order.total)}</p>
                  {order.discountAmount > 0 && (
                    <p className="text-[9px] text-red-500 font-semibold">-{formatCurrency(order.discountAmount)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-xs">
                <div>
                  {order.rxUploaded ? (
                    <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-bold">
                      Rx Attached
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">No Rx</span>
                  )}
                </div>
                <Link
                  to="/admin/orders"
                  className="text-[#004782] dark:text-[#a4c9ff] font-bold hover:underline py-1.5 px-3.5 bg-[#004782]/5 dark:bg-[#a4c9ff]/5 rounded-xl min-h-[40px] flex items-center justify-center cursor-pointer select-none"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <p className="p-lg text-center text-slate-400">No recent orders logged.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
