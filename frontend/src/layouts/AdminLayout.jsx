import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { to: "/admin", end: true, label: "Dashboard", icon: "dashboard" },
    { to: "/admin/products", label: "Products", icon: "inventory_2" },
    { to: "/admin/products/new", label: "Add Product", icon: "add_box" },
    { to: "/admin/orders", label: "Orders", icon: "shopping_bag" },
    { to: "/admin/categories", label: "Categories", icon: "category" }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background text-on-surface transition-colors duration-300">
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container dark:bg-surface-container-high border-r border-outline-variant dark:border-outline/40 flex flex-col gap-sm p-md z-50 transition-colors duration-300">
        <div className="mb-lg px-md">
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim block hover:scale-[0.98] transition-transform">
            MediShop Admin
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            {user?.name || "System Administrator"}
          </p>
        </div>
        
        <nav className="flex-grow flex flex-col gap-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-md py-sm rounded-lg flex items-center gap-sm font-label-md text-label-md transition-all duration-200 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high hover:translate-x-1"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="px-md py-sm rounded-lg flex items-center gap-sm font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high hover:translate-x-1 transition-all mt-lg"
          >
            <span className="material-symbols-outlined">shopping_basket</span>
            Go to Shop
          </Link>
        </nav>

        <div className="mt-auto border-t border-outline-variant dark:border-outline/40 pt-md px-md">
          <button
            onClick={handleLogout}
            className="flex items-center gap-sm text-error hover:bg-error-container/20 w-full p-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="ml-[240px] min-h-screen flex flex-col">
        {/* TopNavBar Shell */}
        <header className="sticky top-0 w-full bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline/40 shadow-sm z-40 flex items-center justify-between px-lg py-sm transition-colors duration-300">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">Admin Portal</h2>
          </div>
          
          <div className="flex items-center gap-lg">
            {/* Profile info & avatar */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-sm focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary-container dark:bg-surface-container-highest border border-outline-variant overflow-hidden">
                  <img
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU-rD_DhET0glsjROzxuQOJ4UxSl3ZjzvTW6BCqF1Ytd-zayFaACSoBY12NKbSSijmeu85DOsRPGhyS0iGfGxYQEJcpP-vuC6A-H-Z5GYd-bWI64XWotJEqpBd6RBoR21x86HFUIIyvuIdDiYUwgICJfkUp1kco9-ANVkx19Tdp7dj_ydLhxULRmMYlUjicJF7hS1gPiQLpHyEGcexE1asXkDGFlCcZczPRo__wmeDOQ7Y_gpO3HIHr-74NcuBa6Xe579pjnf_dq8I"
                  />
                </div>
                <span className="hidden sm:inline font-label-md text-label-md text-on-surface font-semibold">
                  Admin
                </span>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  {profileDropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg shadow-xl py-2 z-50 animate-[slide-up_0.15s_ease-out]">
                  <div className="px-md py-sm border-b border-outline-variant dark:border-outline">
                    <p className="text-label-md font-bold text-on-surface truncate">Admin User</p>
                    <p className="text-body-sm text-on-surface-variant truncate">admin@medishop.com</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-xs w-full text-left px-md py-2 text-body-sm text-error hover:bg-error-container/10 transition-colors mt-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Canvas Section */}
        <main className="flex-grow p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
