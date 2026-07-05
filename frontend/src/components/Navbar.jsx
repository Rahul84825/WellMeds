import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Percent,
  LogOut,
  LayoutDashboard,
  Heart,
  History,
  ChevronDown,
  FileText,
  Package,
  Search,
  Globe,
  Handshake
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import logoImg from "../assets/logos/logo.png";
import { toast } from "sonner";
import { api } from "../services/api";

// ──────────────────────────────────────────────────────────────────────────
// NAV CONFIG — this entire shape is what an admin API should return.
// Replace NAV_CONFIG with a fetch() result and nothing else in this file
// needs to change. See useNavConfig() below for the swap point.
//
// type NavItem = {
//   id: string;                 // stable key, also used by admin to reorder
//   label: string;
//   type: "link" | "dropdown";
//   to?: string;                 // required when type === "link"
//   badge?: { text: string; color: string } | null;
//   children?: { id: string; label: string; to: string }[]; // for dropdown
//   order: number;               // admin-controlled sort order
//   enabled: boolean;             // admin can hide without deleting
// };
// ──────────────────────────────────────────────────────────────────────────
const NAV_CONFIG = [
  {
    id: "super-speciality",
    label: "Super Speciality",
    type: "dropdown",
    order: 1,
    enabled: true,
    badge: null,
    children: [
      { id: "by-speciality", label: "By Super Speciality", to: "/super-speciality" },
      { id: "by-molecule", label: "By Molecules", to: "/molecules" },
      { id: "all-medicines", label: "All Medicines", to: "/products" },
      { id: "wellness", label: "Wellness", to: "/wellness" },
    ],
  },
  {
    id: "imported-medicines",
    label: "Imported Medicines",
    type: "link",
    to: "/imported-medicines",
    order: 2,
    enabled: true,
    badge: null,
  },
  {
    id: "patient-assistance",
    label: "Patient Assistance Program",
    type: "link",
    to: "/patient-assistance-program",
    order: 3,
    enabled: true,
    badge: null,
  },
  {
    id: "library",
    label: "Library",
    type: "dropdown",
    order: 4,
    enabled: true,
    badge: null,
    children: [
      { id: "lib-articles", label: "Health Articles", to: "/library/articles" },
      { id: "lib-guides", label: "Dosage Guides", to: "/library/guides" },
      { id: "lib-faq", label: "FAQs", to: "/library/faq" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// useNavConfig — the single swap point for backend integration.
// ──────────────────────────────────────────────────────────────────────────
const useNavConfig = () => {
  const [navConfig, setNavConfig] = useState(() => {
    return NAV_CONFIG.filter((item) => item.enabled);
  });

  useEffect(() => {
    let active = true;
    const fetchSurgicalCategories = async () => {
      try {
        const categories = await api.getSurgicalCategories();
        if (!active) return;

        let surgicalChildren = [];
        if (categories && categories.length > 0) {
          surgicalChildren = categories.map(cat => ({
            id: `surg-${cat.slug}`,
            label: cat.name,
            to: `/surgical/${cat.slug}`
          }));
          surgicalChildren.push({
            id: "surg-view-all",
            label: "View All Surgical Products",
            to: "/surgical/all"
          });
        } else {
          surgicalChildren = [
            {
              id: "surg-browse",
              label: "Browse Surgical Products",
              to: "/surgical/all"
            }
          ];
        }

        const surgicalItem = {
          id: "surgical",
          label: "Surgical",
          type: "dropdown",
          order: 5,
          enabled: true,
          badge: null,
          children: surgicalChildren
        };

        const filteredConfig = NAV_CONFIG.filter((item) => item.enabled);
        const finalConfig = [...filteredConfig, surgicalItem].sort((a, b) => a.order - b.order);
        setNavConfig(finalConfig);
      } catch (err) {
        console.error("Failed to load surgical categories for navbar", err);
        if (active) {
          const fallbackSurgical = {
            id: "surgical",
            label: "Surgical",
            type: "dropdown",
            order: 5,
            enabled: true,
            badge: null,
            children: [
              {
                id: "surg-browse",
                label: "Browse Surgical Products",
                to: "/surgical/all"
              }
            ]
          };
          const filteredConfig = NAV_CONFIG.filter((item) => item.enabled);
          const finalConfig = [...filteredConfig, fallbackSurgical].sort((a, b) => a.order - b.order);
          setNavConfig(finalConfig);
        }
      }
    };

    fetchSurgicalCategories();
    return () => {
      active = false;
    };
  }, []);

  return navConfig;
};

// ──────────────────────────────────────────────────────────────────────────
// Badge
// ──────────────────────────────────────────────────────────────────────────
const NavBadge = ({ badge }) => {
  if (!badge) return null;
  return (
    <span
      style={{ backgroundColor: badge.color }}
      className="select-none rounded-[6px] px-[6px] py-[2px] text-[10px]
                 font-bold uppercase leading-none tracking-wide text-white"
    >
      {badge.text}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenu — generic, driven entirely by `items` prop
// ──────────────────────────────────────────────────────────────────────────
const DropdownMenu = ({ isOpen, onClose, items, activeIndex, setActiveIndex }) => {
  const menuRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    }
  };

  useEffect(() => {
    if (isOpen && activeIndex >= 0 && menuRef.current) {
      const el = menuRef.current.querySelectorAll("a")[activeIndex];
      el?.focus();
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      onKeyDown={handleKeyDown}
      className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl
                 border border-gray-100 bg-white py-2 shadow-lg
                 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {items.map((child, idx) => (
        <Link
          key={child.id}
          to={child.to}
          role="menuitem"
          tabIndex={idx === activeIndex ? 0 : -1}
          className="block px-4 py-2.5 text-[14px] font-medium text-gray-700
                     transition-colors duration-150 hover:bg-gray-50
                     hover:text-[#004782] focus:bg-gray-50 focus:text-[#004782]
                     focus:outline-none"
        >
          {child.label}
        </Link>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// DropdownNavItem — wraps a single dropdown-type nav entry
// ──────────────────────────────────────────────────────────────────────────
const DropdownNavItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    setOpen((prev) => {
      const next = !prev;
      setActiveIndex(next ? 0 : -1);
      return next;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleToggleClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 text-[18px] font-medium text-gray-900
                   tracking-normal py-3 px-2 leading-none
                    transition-colors duration-200 hover:text-[#004782]
                    focus:text-[#004782] focus:outline-none"
      >
        <span>{item.label}</span>
        <NavBadge badge={item.badge} />
        <ChevronDown
          className={`h-[16px] w-[16px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <DropdownMenu
        isOpen={open}
        onClose={() => { setOpen(false); setActiveIndex(-1); }}
        items={item.children || []}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// LinkNavItem — wraps a single link-type nav entry
// ──────────────────────────────────────────────────────────────────────────
const LinkNavItem = ({ item }) => (
  <Link
    to={item.to}
    className="flex items-center gap-2 text-[18px] font-medium text-gray-900
               tracking-normal py-3 px-2 leading-none
                transition-colors duration-200 hover:text-[#004782]
                focus:text-[#004782] focus:outline-none"
  >
    <span>{item.label}</span>
    <NavBadge badge={item.badge} />
  </Link>
);

// ──────────────────────────────────────────────────────────────────────────
// NavMenu — top-level component, fully data-driven
// ──────────────────────────────────────────────────────────────────────────
const NavMenu = () => {
  const items = useNavConfig();

  return (
    <div className="flex h-full items-center justify-center gap-10 lg:gap-12 xl:gap-14">
      {items.map((item) =>
        item.type === "dropdown" ? (
          <DropdownNavItem key={item.id} item={item} />
        ) : (
          <LinkNavItem key={item.id} item={item} />
        )
      )}
    </div>
  );
};

// ==========================================
// Sub-Component: NavActions
// ==========================================
const NavActions = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const menuItemsRefs = useRef([]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownItems = [];
  if (user) {
    if (isAdmin) {
      dropdownItems.push({
        id: "admin-dashboard",
        type: "link",
        to: "/admin",
        label: "Admin Dashboard",
        icon: LayoutDashboard,
        className: "font-bold text-[#004782] bg-[#f2f6fa] border-l-4 border-[#004782] hover:bg-blue-50"
      });
      dropdownItems.push({
        id: "admin-products",
        type: "link",
        to: "/admin/products",
        label: "Products",
        icon: Package,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
      dropdownItems.push({
        id: "admin-orders",
        type: "link",
        to: "/admin/orders",
        label: "Orders",
        icon: History,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
      dropdownItems.push({
        id: "admin-prescriptions",
        type: "link",
        to: "/admin/prescriptions",
        label: "Prescriptions",
        icon: FileText,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
    } else {
      dropdownItems.push({
        id: "my-profile",
        type: "link",
        to: "/profile",
        label: "Profile",
        icon: User,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
      dropdownItems.push({
        id: "order-history",
        type: "link",
        to: "/orders",
        label: "Orders",
        icon: History,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
      dropdownItems.push({
        id: "my-prescriptions",
        type: "link",
        to: "/upload-prescription",
        label: "Prescriptions",
        icon: FileText,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
      dropdownItems.push({
        id: "my-wishlist",
        type: "link",
        to: "/wishlist",
        label: "Wishlist",
        icon: Heart,
        className: "text-gray-700 hover:bg-gray-50 font-medium"
      });
    }
    dropdownItems.push({
      id: "logout",
      type: "button",
      onClick: handleLogout,
      label: "Logout",
      icon: LogOut,
      className: "text-red-600 hover:bg-red-50 font-medium"
    });
  }

  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRefs.current[focusedIndex]) {
      menuItemsRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (!profileDropdownOpen) {
      setFocusedIndex(-1);
    }
  }, [profileDropdownOpen]);

  const handleKeyDown = (e) => {
    if (!profileDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setProfileDropdownOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
      }
      return;
    }

    const totalItems = dropdownItems.length;
    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setProfileDropdownOpen(false);
      const buttonEl = document.getElementById("user-profile-menu-button");
      if (buttonEl) buttonEl.focus();
    }
  };

  const handleUploadSuccess = (data) => {
    toast.success(`Prescription "${data.fileName}" uploaded successfully!`);
    setUploadModalOpen(false);
  };

  return (
    <div className="flex items-center gap-[12px]">
      <button
        onClick={() => navigate("/upload-prescription")}
        className="w-[84px] h-[44px] bg-[#004782] hover:bg-[#086b53] text-white rounded-[12px] font-medium text-[16px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 flex items-center justify-center active:scale-[0.98] select-none"
        aria-label="Upload Prescription"
      >
        <span>Upload</span>
      </button>

      <button
        className="w-[44px] h-[44px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 transition-colors duration-200"
        aria-label="Discounts & Offers"
      >
        <Percent className="w-5 h-5 text-gray-700" />
      </button>

      <Link
        to="/cart"
        className="relative w-[44px] h-[44px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 transition-colors duration-200"
        aria-label={`Shopping Cart with ${cartCount} items`}
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border border-white">
            {cartCount}
          </span>
        )}
      </Link>

      <div className="relative" ref={dropdownRef}>
        {user ? (
          <button
            id="user-profile-menu-button"
            aria-haspopup="true"
            aria-expanded={profileDropdownOpen}
            aria-controls="user-profile-menu"
            aria-label="User profile menu"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            onKeyDown={handleKeyDown}
            className="h-[48px] px-4 border border-gray-200 bg-white rounded-full flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-500" />
            <span className="max-w-[80px] truncate text-sm font-medium">
              {user.name}
            </span>
          </button>
        ) : (
          <Link
            to="/login"
            className="w-[120px] h-[48px] border border-gray-200 bg-white rounded-full flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 transition-colors duration-200 font-medium cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-500" />
            <span>Login</span>
          </Link>
        )}

        {profileDropdownOpen && user && (
          <div
            id="user-profile-menu"
            role="menu"
            aria-label="User Profile Options"
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-[slide-up_0.15s_ease-out]"
          >
            <div className="px-4 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email || user.phone || ""}</p>
            </div>

            {dropdownItems.map((item, index) => {
              const isLink = item.type === "link";
              const Comp = isLink ? Link : "button";
              const compProps = isLink ? { to: item.to } : { onClick: item.onClick, type: "button" };

              return (
                <React.Fragment key={item.id}>
                  {isAdmin && item.id === "admin-products" && (
                    <hr className="border-gray-100 my-1" />
                  )}
                  {item.id === "logout" && (
                    <hr className="border-gray-100 my-1" />
                  )}
                  <Comp
                    ref={(el) => (menuItemsRefs.current[index] = el)}
                    role="menuitem"
                    {...compProps}
                    className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none w-full text-left"
                  >
                    <item.icon className="w-4 h-4 text-gray-500" />
                    <span className={item.className}>{item.label}</span>
                  </Comp>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Prescription"
        maxWidth="max-w-lg"
      >
        <div className="p-1">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed text-left">
            Upload your doctor's prescription here. A pharmacist will review the order details and follow up with you.
          </p>
          <PrescriptionUpload
            onUploadSuccess={handleUploadSuccess}
            onClose={() => setUploadModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// Main Component: Navbar
// ==========================================
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm flex-shrink-0">
      {/* Desktop & Mobile Navbar Container */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 xl:px-16 flex flex-col">
        
        {/* Row 1: Logo & Action Buttons */}
        <div className="h-[72px] lg:h-[80px] flex items-center justify-between relative">
          {/* Left/Centered Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 z-10 flex items-center">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center group rounded-xl p-0.5 text-left h-[58px] md:h-[65px] lg:h-[76px]"
            >
              <img 
                src={logoImg} 
                alt="Logo" 
                className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-200" 
              />
            </NavLink>
          </div>

          {/* Right Side Actions (Desktop) */}
          <div className="hidden lg:block">
            <NavActions />
          </div>

          {/* Right Side Actions (Mobile/Tablet) */}
          <div className="flex items-center gap-2 lg:hidden ml-auto z-10">
            <Link
              to="/cart"
              className="relative w-[42px] h-[42px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] transition-colors"
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-[18px] h-[18px] text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-[42px] h-[42px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] transition-all cursor-pointer"
              aria-label="Toggle Mobile Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Centered Navigation Menu (Desktop Only) */}
        <div className="hidden lg:flex h-[50px] items-center justify-center border-t border-gray-50">
          <NavMenu />
        </div>

      </div>

      {/* Mobile Drawer Menu Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Menu Container */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-[300px] max-w-[80vw] bg-white dark:bg-zinc-900 z-[201] transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-md border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)} 
            className="flex items-center group h-12 w-auto"
          >
            <img 
              src={logoImg} 
              alt="WellMeds Logo" 
              className="h-full w-auto object-contain" 
            />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-md space-y-md text-left">
          {/* Mobile Search input */}
          <div className="relative">
            <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search medicines..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mobileSearchQuery.trim()) {
                  setMobileMenuOpen(false);
                  navigate(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
                }
              }}
              className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-800 rounded-xl border border-outline-variant/60 outline-none text-xs focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
            />
          </div>

          {/* Quick Action Badges */}
          <div className="grid grid-cols-2 gap-sm">
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="h-11 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-xs text-xs text-on-surface font-semibold hover:bg-slate-50"
            >
              <ShoppingCart className="w-4 h-4 text-[#004782]" />
              <span>Cart ({cartCount})</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="h-11 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-xs text-xs text-on-surface font-semibold hover:bg-slate-50"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Wishlist</span>
            </Link>
          </div>

          {/* Menu Links */}
          <div className="flex flex-col gap-xs pt-sm border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-xs px-sm">Navigation</span>

            {user ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
              >
                <User size={16} className="text-slate-400" />
                <span>My Profile ({user.name})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
              >
                <User size={16} className="text-slate-400" />
                <span>Login / Register</span>
              </Link>
            )}

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
            >
              <Package size={16} className="text-slate-400" />
              <span>All Medicines</span>
            </Link>

            <Link
              to="/imported-medicines"
              onClick={() => setMobileMenuOpen(false)}
              className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
            >
              <Globe size={16} className="text-slate-400" />
              <span>Imported Medicines</span>
            </Link>

            <Link
              to="/patient-assistance-program"
              onClick={() => setMobileMenuOpen(false)}
              className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
            >
              <Handshake size={16} className="text-slate-400" />
              <span>Patient Assistance Program</span>
            </Link>

            <Link
              to="/upload-prescription"
              onClick={() => setMobileMenuOpen(false)}
              className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
            >
              <FileText size={16} className="text-slate-400" />
              <span>Upload Prescription</span>
            </Link>

            {user && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-sm py-sm rounded-xl text-xs text-on-surface hover:bg-slate-50 flex items-center gap-sm font-semibold"
              >
                <History size={16} className="text-slate-400" />
                <span>Order History</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-sm py-sm rounded-xl text-xs text-[#004782] hover:bg-blue-50/50 flex items-center gap-sm font-extrabold"
              >
                <LayoutDashboard size={16} />
                <span>Go to Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Log Out button if authenticated */}
          {user && (
            <div className="pt-sm border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full h-11 border border-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
