import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";

// Format ISO date string → "Jun 23, 2026"
const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProductsCount: 0,
    totalOrdersCount: 0,
    totalUsersCount: 0,
    pendingRxVerification: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use the dedicated admin stats endpoint for live MongoDB data
        const statsData = await api.getDashboardStats();
        
        if (statsData?.stats) {
          setStats({
            totalSales: statsData.stats.totalSales || 0,
            totalProductsCount: statsData.stats.totalProductsCount || 0,
            totalOrdersCount: statsData.stats.totalOrdersCount || 0,
            totalUsersCount: statsData.stats.totalUsersCount || 0,
            pendingRxVerification: statsData.stats.pendingRxVerification || 0,
          });
        }

        if (Array.isArray(statsData?.recentOrders)) {
          setRecentOrders(statsData.recentOrders.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        // Fall back to fetching orders manually if admin/stats fails
        try {
          const orders = await api.getOrders();
          setRecentOrders(orders.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            totalOrdersCount: orders.length,
            totalSales: orders.reduce((s, o) => s + (o.total || 0), 0),
          }));
        } catch (fallbackErr) {
          console.error("Fallback dashboard fetch also failed", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Admin Dashboard</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            Overview of store status, sales metrics, and pending pharmacist tasks.
          </p>
        </div>
      </div>

      {/* Grid: Metric widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Total Sales Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex items-center gap-md hover:scale-[1.02] transition-transform">
          <div className="p-md rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim">
            <span className="material-symbols-outlined text-[32px]">payments</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-[10px]">
              Total Revenue
            </p>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              ${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex items-center gap-md hover:scale-[1.02] transition-transform">
          <div className="p-md rounded-full bg-secondary-container/20 text-secondary dark:text-secondary-fixed-dim">
            <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-[10px]">
              Total Orders
            </p>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {stats.totalOrdersCount} Orders
            </h4>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex items-center gap-md hover:scale-[1.02] transition-transform">
          <div className="p-md rounded-full bg-tertiary-fixed/20 text-tertiary">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-[10px]">
              Active Products
            </p>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {stats.totalProductsCount} Catalog Items
            </h4>
          </div>
        </div>

        {/* Pending Rx Verifications Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex items-center gap-md hover:scale-[1.02] transition-transform">
          <div className="p-md rounded-full bg-error-container/20 text-error">
            <span className="material-symbols-outlined text-[32px]">verified</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider text-[10px]">
              Pending Rx Reviews
            </p>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {stats.pendingRxVerification} Verification Required
            </h4>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Sales Performance Chart (SVG) */}
        <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold">Sales Performance (Weekly)</h3>
          
          {/* Mock SVG Chart */}
          <div className="relative w-full h-64 bg-surface-container-low dark:bg-surface-container rounded-lg p-md overflow-hidden flex items-end">
            <svg className="absolute inset-0 w-full h-full p-lg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#185fa5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#185fa5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-outline/10" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-outline/10" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-outline/10" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#eceef0" strokeWidth="0.5" className="dark:stroke-outline/10" />

              {/* Area path */}
              <path d="M 0,90 Q 20,60 40,75 T 80,30 T 100,20 L 100,100 L 0,100 Z" fill="url(#gradient-sales)" />
              {/* Trend line */}
              <path d="M 0,90 Q 20,60 40,75 T 80,30 T 100,20" fill="none" stroke="#038076" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-primary-fixed-dim" />
              
              {/* Dots */}
              <circle cx="20" cy="73" r="1.5" fill="#038076" />
              <circle cx="40" cy="71" r="1.5" fill="#038076" />
              <circle cx="80" cy="39" r="1.5" fill="#038076" />
              <circle cx="100" cy="20" r="1.5" fill="#038076" />
            </svg>
            
            <div className="absolute inset-x-0 bottom-2 px-xl flex justify-between text-[11px] text-on-surface-variant dark:text-surface-variant font-medium">
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

        {/* Quick Task List */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold">Quick Administrative Tasks</h3>
          <ul className="divide-y divide-outline-variant/60 text-body-sm text-on-surface-variant dark:text-surface-variant">
            <li className="py-md flex justify-between items-start gap-sm">
              <div>
                <p className="font-semibold text-on-surface">Manage Catalog Inventory</p>
                <p className="text-[12px] opacity-75">Check low stock supplements.</p>
              </div>
              <Link to="/admin/products" className="text-primary hover:underline text-xs">Go</Link>
            </li>
            <li className="py-md flex justify-between items-start gap-sm">
              <div>
                <p className="font-semibold text-on-surface">Prescription Dispensing</p>
                <p className="text-[12px] opacity-75">{stats.pendingRxVerification} order(s) require Rx review.</p>
              </div>
              <Link to="/admin/orders" className="text-primary hover:underline text-xs font-bold">Review</Link>
            </li>
            <li className="py-md flex justify-between items-start gap-sm">
              <div>
                <p className="font-semibold text-on-surface">Update Product Categories</p>
                <p className="text-[12px] opacity-75">Assign filters to health devices.</p>
              </div>
              <Link to="/admin/categories" className="text-primary hover:underline text-xs">Edit</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl shadow-sm overflow-hidden space-y-md p-lg">
        <div className="flex items-center justify-between pb-md border-b border-outline-variant/60 mb-lg">
          <h3 className="font-label-md text-label-md text-on-surface font-bold">Recent Orders Overview</h3>
          <Link to="/admin/orders" className="text-primary dark:text-primary-fixed-dim hover:underline text-body-sm font-semibold">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant/60 text-label-sm text-on-surface-variant">
                <th className="p-md">Order ID</th>
                <th className="p-md">Date</th>
                <th className="p-md">Customer</th>
                <th className="p-md">Total Paid</th>
                <th className="p-md">Rx Verify</th>
                <th className="p-md">Ship Status</th>
                <th className="p-md text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface-variant dark:text-surface-variant">
              {recentOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-surface-container-low/30">
                  <td className="p-md font-bold text-on-surface font-mono text-xs">{order.orderId}</td>
                  <td className="p-md">{formatDate(order.createdAt)}</td>
                  <td className="p-md">
                    <p className="font-semibold text-on-surface">{order.customer}</p>
                    <p className="text-[11px] opacity-75 truncate max-w-[120px]">{order.email}</p>
                  </td>
                  <td className="p-md font-semibold text-on-surface">${order.total.toFixed(2)}</td>
                  <td className="p-md">
                    {order.rxUploaded ? (
                      <span className="inline-flex items-center gap-xs px-sm py-0.5 bg-secondary-container/30 text-on-secondary-container rounded text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Attached
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/50 text-[12px]">N/A</span>
                    )}
                  </td>
                  <td className="p-md">
                    <span className={`inline-flex items-center gap-xs px-md py-0.5 rounded-full text-xs font-semibold ${
                      order.status === "Delivered"
                        ? "bg-secondary-container/30 text-on-secondary-container"
                        : order.status === "Processing"
                        ? "bg-primary-container/20 text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.status === "Delivered" ? "bg-secondary" : order.status === "Processing" ? "bg-primary" : "bg-outline"
                      }`}></span>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-md text-right">
                    <Link
                      to="/admin/orders"
                      className="text-primary hover:text-primary-container font-semibold transition-colors"
                    >
                      Manage
                    </Link>
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

export default Dashboard;
