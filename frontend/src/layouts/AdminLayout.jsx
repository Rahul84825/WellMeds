import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderOpen, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Users, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Bell, 
  Search, 
  Globe, 
  FileCheck2,
  Calendar,
  X,
  FileText,
  HeartPulse,
  FlaskConical,
  Scissors
} from "lucide-react";
import { api } from "../services/api";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Global search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Stats for notifications (like pending prescriptions count)
  const [pendingRxCount, setPendingRxCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.getDashboardStats();
        if (statsData?.stats?.pendingRxVerification !== undefined) {
          setPendingRxCount(statsData.stats.pendingRxVerification);
        }
      } catch (err) {
        console.error("Failed to load layout notification stats", err);
      }
    };
    fetchStats();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: ShoppingBag },
    { to: "/admin/categories", label: "Categories", icon: FolderOpen },
    { to: "/admin/surgical-categories", label: "Surgical Categories", icon: Scissors },
    { to: "/admin/specialities", label: "Specialities", icon: HeartPulse },
    { to: "/admin/molecules", label: "Molecules", icon: FlaskConical },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/prescriptions", label: "Prescriptions", icon: FileCheck2 },
    { to: "/admin/coupons", label: "Coupons", icon: Tag },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings }
  ];


  // Perform search across products, orders, categories, coupons, and users
  const handleGlobalSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    try {
      // Fetch products, orders, categories, coupons, and users in parallel
      const [prods, cats, ords, coups, usrList] = await Promise.all([
        api.getProductsList().catch(() => []),
        api.getCategories().catch(() => []),
        api.getOrders().catch(() => []),
        api.adminGetCoupons().catch(() => []),
        api.getUsers().catch(() => [])
      ]);

      const query = val.toLowerCase();
      
      const filteredProds = prods.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)).slice(0, 3);
      const filteredCats = cats.filter(c => c.name.toLowerCase().includes(query)).slice(0, 3);
      const filteredOrds = ords.filter(o => o.orderId.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query)).slice(0, 3);
      const filteredCoups = coups.filter(c => c.code.toLowerCase().includes(query)).slice(0, 3);
      const filteredUsrs = usrList.filter(u => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)).slice(0, 3);

      setSearchResults({
        products: filteredProds,
        categories: filteredCats,
        orders: filteredOrds,
        coupons: filteredCoups,
        users: filteredUsrs,
        hasResults: filteredProds.length > 0 || filteredCats.length > 0 || filteredOrds.length > 0 || filteredCoups.length > 0 || filteredUsrs.length > 0
      });
    } catch (err) {
      console.error("Global search failed", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex transition-colors duration-300">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* SIDEBAR PANEL */}
      {/* ──────────────────────────────────────────────────────── */}
      {/* Sidebar Backdrop Overlay on Mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-[fade-in_0.2s_ease-out]" 
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col z-50 transition-all duration-300 shadow-md ${
          collapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-md border-b border-slate-200 dark:border-zinc-800">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-xs font-bold text-lg text-[#004782] dark:text-[#a4c9ff] tracking-tight hover:opacity-90">
              <span className="h-7 w-7 rounded bg-[#004782] text-white flex items-center justify-center text-sm font-black">W</span>
              <span>WellMeds Admin</span>
            </Link>
          ) : (
            <Link to="/" className="mx-auto h-8 w-8 rounded bg-[#004782] text-white flex items-center justify-center font-black">
              W
            </Link>
          )}
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all hidden md:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-md px-sm space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setCollapsed(true);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-sm px-md py-sm rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff]"
                      : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-100"
                  }`
                }
              >
                <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <span className="absolute left-full ml-md px-sm py-xs bg-slate-800 dark:bg-zinc-700 text-white text-[11px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-md my-md border-t border-slate-200 dark:border-zinc-800">
            <Link
              to="/"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setCollapsed(true);
                }
              }}
              className="flex items-center gap-sm px-md py-sm rounded-xl font-medium text-sm text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-100 group relative"
            >
              <Globe size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>Go to Shop</span>}
              {collapsed && (
                <span className="absolute left-full ml-md px-sm py-xs bg-slate-800 dark:bg-zinc-700 text-white text-[11px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                  Go to Shop
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Logout Footer */}
        <div className="p-sm border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-sm px-md py-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all group relative font-medium text-sm"
          >
            <LogOut size={18} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-md px-sm py-xs bg-red-600 text-white text-[11px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN VIEW CONTAINER */}
      {/* ──────────────────────────────────────────────────────── */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pl-0 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        
        {/* ──────────────────────────────────────────────────────── */}
        {/* STICKY TOP HEADER */}
        {/* ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm z-40 flex items-center justify-between px-lg transition-colors duration-300">
          
          {/* Header Left: Toggle & Calendar */}
          <div className="flex items-center gap-md">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-xs text-xs text-slate-400 font-medium">
              <Calendar size={14} className="text-slate-400" />
              <span>{currentDateStr}</span>
            </div>
          </div>

          {/* Header Middle: Global Search */}
          <div className="relative max-w-xs md:max-w-md w-full mx-xs md:mx-md">
            <div className="relative">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Global Search..."
                value={searchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-full pl-lg pr-lg py-1.5 md:py-sm bg-slate-100 dark:bg-zinc-800/60 border border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#004782] dark:focus:border-[#004782] rounded-xl text-[11px] md:text-xs text-slate-700 dark:text-zinc-200 focus:ring-1 focus:ring-[#004782] outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Global Search Result Dropdown Overlay */}
            {searchResults && (
              <div className="absolute left-0 right-0 mt-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl max-h-[380px] overflow-y-auto z-50 p-md space-y-md animate-[slide-up_0.15s_ease-out] text-left">
                <div className="flex items-center justify-between pb-sm border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Results</span>
                  <button onClick={clearSearch} className="text-xs text-slate-400 hover:underline">Close</button>
                </div>

                {searchLoading && <p className="text-xs text-slate-400 text-center py-sm">Searching catalog...</p>}

                {!searchLoading && !searchResults.hasResults && (
                  <p className="text-xs text-slate-400 text-center py-sm">No matches found for "{searchQuery}"</p>
                )}

                {!searchLoading && searchResults.hasResults && (
                  <div className="space-y-sm text-xs">
                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-400 text-[10px] uppercase mb-xs tracking-wider">Products</p>
                        <div className="space-y-xs">
                          {searchResults.products.map(p => (
                            <Link 
                              key={p.id} 
                              to="/admin/products" 
                              onClick={clearSearch}
                              className="flex items-center gap-sm p-sm rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            >
                              <img src={p.image} className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-zinc-700" alt={p.name} />
                              <div className="truncate">
                                <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{p.name}</p>
                                <p className="text-[10px] text-slate-400">SKU: {p.sku} • ₹{p.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Orders */}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-400 text-[10px] uppercase mb-xs tracking-wider">Orders</p>
                        <div className="space-y-xs">
                          {searchResults.orders.map(o => (
                            <Link 
                              key={o.orderId} 
                              to="/admin/orders" 
                              onClick={clearSearch}
                              className="flex justify-between items-center p-sm rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            >
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-zinc-200 font-mono text-[11px]">{o.orderId}</p>
                                <p className="text-[10px] text-slate-400">{o.customer}</p>
                              </div>
                               <span className="text-[10px] font-bold text-primary dark:text-[#a4c9ff]">₹{o.total}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coupons */}
                    {searchResults.coupons.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-400 text-[10px] uppercase mb-xs tracking-wider">Coupons</p>
                        <div className="space-y-xs">
                          {searchResults.coupons.map(c => (
                            <Link 
                              key={c.id} 
                              to="/admin/coupons" 
                              onClick={clearSearch}
                              className="flex justify-between items-center p-sm rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            >
                              <span className="font-bold font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[#004782] dark:text-[#a4c9ff]">
                                {c.code}
                              </span>
                              <span className="text-[10px] text-slate-400">{c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {searchResults.categories.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-400 text-[10px] uppercase mb-xs tracking-wider">Categories</p>
                        <div className="space-y-xs">
                          {searchResults.categories.map(c => (
                            <Link 
                              key={c.id} 
                              to="/admin/categories" 
                              onClick={clearSearch}
                              className="flex items-center gap-xs p-sm rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            >
                              <FolderOpen size={12} className="text-slate-400" />
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">{c.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Right: Notifications & Profile */}
          <div className="flex items-center gap-md">
            
            {/* Quick action: Go to website */}
            <Link 
              to="/" 
              className="p-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors hidden sm:block" 
              title="Open shop website"
            >
              <Globe size={18} />
            </Link>

            {/* Notification bell panel */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all relative"
                title="Notifications"
              >
                <Bell size={18} />
                {pendingRxCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    {pendingRxCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-sm w-72 max-w-[calc(100vw-32px)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-sm z-50 animate-[slide-up_0.15s_ease-out] text-left">
                  <div className="px-md py-sm border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">System Notifications</span>
                    {pendingRxCount > 0 && (
                      <span className="bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-sm py-0.5 rounded text-[10px] font-bold">
                        {pendingRxCount} Pending Review
                      </span>
                    )}
                  </div>
                  <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                    {pendingRxCount > 0 ? (
                      <div className="p-md text-xs space-y-xs hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <div className="flex gap-xs text-red-500 font-semibold">
                          <FileText size={14} />
                          <span>Prescriptions Pending</span>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400">There are {pendingRxCount} prescriptions awaiting review by a pharmacist.</p>
                        <Link 
                          to="/admin/prescriptions" 
                          onClick={() => setNotificationsOpen(false)}
                          className="text-[#004782] dark:text-[#a4c9ff] font-bold hover:underline inline-block pt-xs"
                        >
                          Review Now &rarr;
                        </Link>
                      </div>
                    ) : (
                      <p className="p-md text-xs text-slate-400 text-center">No new notifications. Everything looks clean!</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-sm p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <div className="h-8 w-8 rounded-full bg-[#004782]/10 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  {user?.avatar ? (
                    <img
                      alt="Admin Avatar"
                      className="w-full h-full object-cover"
                      src={user.avatar}
                    />
                  ) : (
                    <div className="h-full w-full bg-[#004782] text-white flex items-center justify-center font-bold text-sm">
                      {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left truncate max-w-[80px]">
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-none truncate">{user?.name || "Admin"}</p>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">Staff</span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-sm w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-sm z-50 animate-[slide-up_0.15s_ease-out] text-left">
                  <div className="px-md py-sm border-b border-slate-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{user?.name || "Admin User"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@medishop.com"}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-xs w-full text-left px-md py-sm text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-xs w-full text-left px-md py-sm text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ──────────────────────────────────────────────────────── */}
        {/* MAIN DISPLAY CANVAS */}
        {/* ──────────────────────────────────────────────────────── */}
        <main className="flex-grow p-md md:p-lg lg:p-xl max-w-7-xl w-full mx-auto animate-[fade-in_0.3s_ease-out]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
