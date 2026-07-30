import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Percent,
  LogOut,
  LayoutDashboard,
  History,
  ChevronDown,
  FileText,
  Package,
  FlaskConical,
  Search,
  Globe,
  Handshake,
  ArrowLeft,
  MapPin,
  HelpCircle,
  PhoneCall,
  Activity
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useDrawer } from "../context/DrawerContext";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import logoImg from "../assets/logos/logo.png";
import { toast } from "sonner";
import { api } from "../services/api";
import { UniversalSearch } from "./common/UniversalSearch";

const iconMap = {
  Globe,
  Activity,
  Handshake,
  FileText,
  Percent,
  PhoneCall,
  HelpCircle,
  User,
  History,
  Package,
  FlaskConical
};

const renderIcon = (name, className = "w-4 h-4") => {
  const IconComp = iconMap[name] || HelpCircle;
  return <IconComp className={className} />;
};

const Navbar = () => {
  const { user, logout, isAdmin, openLoginModal } = useAuth();
  const { cartCount } = useCart();
  const { isDrawerOpen, setIsDrawerOpen, menuData } = useDrawer();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation states
  const [activeDropdown, setActiveDropdown] = useState(null); // 'medicines' | 'surgical' | 'wellness' | 'library' | 'pap'
  const [showLowerNavbar, setShowLowerNavbar] = useState(true);
  const lastScrollY = useRef(0);

  // Hover timer state for desktop mega menus and dropdowns
  const timeoutRef = useRef(null);

  const handleMouseEnter = (menuKey) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms close delay
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Location selector states
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("wellmeds_location") || "Pune, 411021";
  });
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  // Sync location with custom events and localStorage
  useEffect(() => {
    const handleLocationChange = (e) => {
      setSelectedLocation(e.detail);
    };
    window.addEventListener("wellmeds_location_changed", handleLocationChange);
    return () => {
      window.removeEventListener("wellmeds_location_changed", handleLocationChange);
    };
  }, []);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem("wellmeds_location", loc);
    window.dispatchEvent(new CustomEvent("wellmeds_location_changed", { detail: loc }));
    setLocationMenuOpen(false);
  };

  // Mobile search drawer expansion state
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);

  // Scroll search bar visibility state (For Homepage scroll)
  const [showNavbarSearch, setShowNavbarSearch] = useState(location.pathname !== "/");

  // Discrete State Machine Engine Refs
  const isNavVisibleRef = useRef(true);
  const isScrolledRef = useRef(false);
  const showSearchRef = useRef(location.pathname !== "/");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Single Discrete State Machine Scroll Engine (Passive & RAF Throttled)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollY.current;
          const delta = currentScrollY - prevScrollY;

          // 1. Elevation Shadow State (Threshold: 10px)
          const nextIsScrolled = currentScrollY > 10;
          if (nextIsScrolled !== isScrolledRef.current) {
            isScrolledRef.current = nextIsScrolled;
            setIsScrolled(nextIsScrolled);
          }

          // 2. Search Bar Visibility State
          const nextShowSearch = location.pathname === "/" ? currentScrollY > 180 : true;
          if (nextShowSearch !== showSearchRef.current) {
            showSearchRef.current = nextShowSearch;
            setShowNavbarSearch(nextShowSearch);
          }

          // 3. Unified Header State Machine Thresholds:
          // Near top (<= 80px): Strictly visible in initial position
          // Scroll DOWN (delta > 40px & scrollY > 200px): Hide lower navbar
          // Scroll UP (delta < -50px): Reveal lower navbar (requires intentional scroll up)
          let nextNavVisible = isNavVisibleRef.current;
          if (currentScrollY <= 80) {
            nextNavVisible = true;
          } else if (delta < -50) {
            nextNavVisible = true;
          } else if (delta > 40 && currentScrollY > 200) {
            nextNavVisible = false;
          }

          if (nextNavVisible !== isNavVisibleRef.current) {
            isNavVisibleRef.current = nextNavVisible;
            setIsNavVisible(nextNavVisible);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Click outside to close location & profile menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Profile and Prescription Upload states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [focusedProfileIndex, setFocusedProfileIndex] = useState(-1);

  // Dynamic categories
  const [surgicalCategories, setSurgicalCategories] = useState([]);

  const profileDropdownRef = useRef(null);
  const profileMenuRefs = useRef([]);

  // Fetch Surgical Categories dynamically
  useEffect(() => {
    let active = true;
    const fetchSurg = async () => {
      try {
        const cats = await api.getSurgicalCategories();
        if (active) setSurgicalCategories(cats || []);
      } catch (err) {
        console.error("Failed to load surgical categories", err);
      }
    };
    fetchSurg();
    return () => { active = false; };
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setProfileDropdownOpen(false);
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile search is open
  useEffect(() => {
    if (mobileSearchExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSearchExpanded]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const handleUploadSuccess = (data) => {
    toast.success(`Prescription "${data.fileName}" uploaded successfully!`);
    setUploadModalOpen(false);
  };

  const profileDropdownItems = [];
  if (user) {
    if (isAdmin) {
      profileDropdownItems.push({
        id: "admin-dashboard",
        type: "link",
        to: "/admin",
        label: "Admin Dashboard",
        icon: LayoutDashboard
      });
      profileDropdownItems.push({
        id: "my-profile",
        type: "link",
        to: "/profile",
        label: "Profile",
        icon: User
      });
    } else {
      profileDropdownItems.push({
        id: "my-profile",
        type: "link",
        to: "/profile",
        label: "My Profile",
        icon: User
      });
      profileDropdownItems.push({
        id: "order-history",
        type: "link",
        to: "/orders",
        label: "Orders",
        icon: History
      });
      profileDropdownItems.push({
        id: "my-prescriptions",
        type: "link",
        to: "/upload-prescription",
        label: "Prescriptions",
        icon: FileText
      });
      profileDropdownItems.push({
        id: "addresses",
        type: "link",
        to: "/profile?tab=addresses",
        label: "Addresses",
        icon: MapPin
      });
    }
    profileDropdownItems.push({
      id: "logout",
      type: "button",
      onClick: handleLogout,
      label: "Logout",
      icon: LogOut
    });
  }

  // Keyboard navigation helpers
  const handleDropdownKeyDown = (e, menuKey) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveDropdown(menuKey);
      setTimeout(() => {
        const firstLink = document.querySelector(`#dropdown-${menuKey} a`);
        if (firstLink) firstLink.focus();
      }, 50);
    }
  };

  const handleLinkKeyDown = (e, menuKey) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setActiveDropdown(null);
      const triggerBtn = document.getElementById(`trigger-${menuKey}`);
      if (triggerBtn) triggerBtn.focus();
    }
  };

  const handleProfileKeyDown = (e) => {
    if (!profileDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setProfileDropdownOpen(true);
        setFocusedProfileIndex(0);
      }
      return;
    }

    const total = profileDropdownItems.length;
    if (total === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedProfileIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedProfileIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setProfileDropdownOpen(false);
      const buttonEl = document.getElementById("user-profile-menu-button");
      if (buttonEl) buttonEl.focus();
    }
  };

  useEffect(() => {
    if (focusedProfileIndex >= 0 && profileMenuRefs.current[focusedProfileIndex]) {
      profileMenuRefs.current[focusedProfileIndex].focus();
    }
  }, [focusedProfileIndex]);

  return (
    <nav
      className={`w-full sticky top-0 flex flex-col border-b border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transform-gpu transition-shadow duration-200 ${isScrolled
          ? "shadow-md bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
          : "shadow-xs"
        } ${isDrawerOpen || mobileSearchExpanded ? "z-[999]" : "z-[100]"}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col w-full py-0 lg:py-1 overflow-visible">

        {/* ROW 1: Logo, Location Selector, Search, & Top Actions */}
        <div className="flex items-center justify-between gap-6 relative z-30 w-full h-[76px] lg:h-[64px]">

          {/* Desktop Only Header (Visible on desktop only) */}
          <div className="hidden lg:flex items-center justify-between w-full h-full">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <NavLink
                to="/"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center select-none cursor-pointer"
              >
                <img
                  src={logoImg}
                  alt="WellMeds Logo"
                  className="h-[60px] lg:h-[70px] object-contain"
                />
              </NavLink>
            </div>

            {/* Search bar & Location selector container */}
            <div className="flex items-center justify-center flex-grow flex-1 mx-4 relative z-10">
              <div
                style={{
                  transition: "opacity 280ms cubic-bezier(.22,.61,.36,1), transform 280ms cubic-bezier(.22,.61,.36,1), max-width 300ms ease",
                  transform: showNavbarSearch ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 32px, 0) scale(0.95)",
                  opacity: showNavbarSearch ? 1 : 0,
                }}
                className={`w-full max-w-[560px] transition-all duration-300 ${showNavbarSearch ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <UniversalSearch variant="default" />
              </div>
            </div>

            {/* Desktop Right Side Top Actions */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Upload Rx Button */}
              <button
                onClick={() => navigate("/upload-prescription")}
                className="bg-[#157a6d] hover:bg-[#0f6157] text-white px-5 h-[38px] rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#157a6d] focus:ring-offset-2 flex items-center justify-center active:scale-[0.98] select-none cursor-pointer text-[14.5px] shadow-xs font-mono uppercase tracking-wider"
                aria-label="Upload Doctor Prescription"
              >
                <span>Upload</span>
              </button>

              {/* Offer Button */}
              <Link
                to="/offers"
                className="p-2 flex items-center justify-center text-slate-700 hover:text-[#02665e] focus:outline-none transition-colors"
                aria-label="Discounts & Offers"
              >
                <Percent className="w-[20px] h-[20px]" />
              </Link>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                className="relative p-2 flex items-center justify-center text-slate-700 hover:text-[#02665e] focus:outline-none transition-colors"
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-[20px] h-[20px]" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                {user ? (
                  <button
                    id="user-profile-menu-button"
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                    aria-controls="user-profile-menu"
                    aria-label="User profile menu"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    onKeyDown={handleProfileKeyDown}
                    className={`px-5 h-[38px] border border-slate-200/90 rounded-2xl flex items-center justify-center gap-2 text-slate-800 focus:outline-none transition-all duration-150 cursor-pointer shrink-0 text-[14.5px] font-semibold ${profileDropdownOpen ? "bg-slate-200/80 border-slate-300" : "bg-white hover:bg-slate-50 hover:border-slate-300"
                      }`}
                  >
                    <User className="w-[18px] h-[18px] text-slate-700" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openLoginModal()}
                    className="px-5 h-[38px] border border-slate-200/90 bg-white rounded-2xl flex items-center justify-center gap-2 text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-none font-semibold cursor-pointer shrink-0 text-[14.5px] transition-all duration-150"
                  >
                    <User className="w-[18px] h-[18px] text-slate-700" />
                    <span>Login</span>
                  </button>
                )}

                {profileDropdownOpen && user && (
                  <div
                    id="user-profile-menu"
                    role="menu"
                    aria-label="User Profile Options"
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-3 z-[200] animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* Top Caret Triangle Arrow */}
                    <div className="absolute -top-2 right-6 w-3.5 h-3.5 bg-white border-t border-l border-slate-200/80 rotate-45 z-20" />

                    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 select-none bg-slate-50/80 rounded-xl mb-1.5 relative z-30">
                      <div className="w-9 h-9 rounded-full bg-[#038076]/10 text-[#038076] flex items-center justify-center font-extrabold text-sm shrink-0">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate leading-tight">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate mt-[2px] leading-normal">{user.email || user.phone || ""}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 relative z-30">
                      {profileDropdownItems.map((item, idx) => {
                        const isLink = item.type === "link";
                        const Comp = isLink ? Link : "button";
                        const compProps = isLink ? { to: item.to } : { onClick: item.onClick, type: "button" };
                        const isActive = isLink && (location.pathname === item.to || (item.to === "/admin" && location.pathname.startsWith("/admin")));

                        return (
                          <React.Fragment key={item.id}>
                            {item.id === "logout" && <hr className="border-slate-100 my-1" />}
                            <Comp
                              ref={(el) => (profileMenuRefs.current[idx] = el)}
                              role="menuitem"
                              {...compProps}
                              className={`group flex items-center gap-2.5 px-4 py-2.5 text-[15px] font-medium rounded-lg select-none transition-all duration-150 w-full text-left cursor-pointer outline-none
                                ${item.id === "logout"
                                  ? "text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                                  : isActive
                                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                                    : "text-slate-800 hover:bg-slate-50 hover:text-[#038076]"
                                }
                              `}
                            >
                              <item.icon className={`w-4 h-4 shrink-0 ${item.id === "logout" ? "text-red-500" : "text-slate-400 group-hover:text-[#038076]"}`} />
                              <span>{item.label}</span>
                            </Comp>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header (Visible on mobile/tablet only, centers logo) */}
          <div className="flex lg:hidden items-center justify-between w-full h-full relative">
            {/* Left: Hamburger menu */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="w-[36px] h-[36px] rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-55 cursor-pointer shrink-0"
              aria-label="Toggle Navigation Drawer"
            >
              {isDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Center: Centered Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0">
              <NavLink
                to="/"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center cursor-pointer"
              >
                <img
                  src={logoImg}
                  alt="WellMeds Logo"
                  className="h-[72px] object-contain"
                />
              </NavLink>
            </div>

            {/* Right: Cart */}
            <Link
              to="/cart"
              className="relative w-[36px] h-[36px] rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-55 transition-colors shrink-0"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-[15px] h-[15px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Fullscreen Search Expansion */}
          {mobileSearchExpanded && (
            <div className="flex flex-col w-full h-[100vh] bg-white z-[300] fixed inset-0 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <button
                  onClick={() => setMobileSearchExpanded(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
                  aria-label="Close Search"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="text-sm font-black text-slate-800">Search WellMeds</div>
              </div>
              <div className="flex-grow overflow-y-auto">
                <UniversalSearch
                  variant="mobile"
                  onCloseMobile={() => setMobileSearchExpanded(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navbar: Search bar (Visible on scroll in mobile/tablet) */}
      <div
        className={`w-full bg-white dark:bg-zinc-950 text-slate-800 lg:hidden grid transition-all duration-300 ease-in-out border-slate-200 ${showNavbarSearch
            ? "grid-rows-[1fr] opacity-100 px-6 py-2.5 border-t pointer-events-auto"
            : "grid-rows-[0fr] opacity-0 px-6 py-0 border-t-0 pointer-events-none"
          }`}
      >
        <div className="overflow-hidden">
          <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full pl-3 pr-1 py-1 shadow-sm border border-slate-205 dark:border-zinc-850 w-full">
            <Search className="text-slate-400 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search Medicines..."
              readOnly
              onClick={() => setMobileSearchExpanded(true)}
              className="bg-transparent border-none outline-none text-slate-800 dark:text-zinc-200 text-xs pl-2 pr-4 py-1.5 flex-grow cursor-pointer placeholder-slate-400 animate-none"
            />
            <button
              onClick={() => navigate("/upload-prescription")}
              className="bg-[#086b53] hover:bg-[#055746] text-white px-3 py-1.5 rounded-full font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 text-[10px]"
            >
              <span>Upload</span>
              <FileText className="w-[11px] h-[11px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Primary Bottom Navigation Bar (Desktop Only - GPU Slide Behind Stationary Upper Row) */}
      <div
        style={{
          willChange: "transform, opacity",
          transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out",
        }}
        className={`hidden lg:flex items-center justify-center z-20 relative w-full border-slate-200/60 dark:border-zinc-800/60 transform-gpu ${
          isNavVisible
            ? "translate-y-0 opacity-100 max-h-[54px] border-t pointer-events-auto overflow-visible"
            : "-translate-y-full opacity-0 max-h-0 border-t-0 pointer-events-none overflow-hidden"
        }`}
      >
        <div className={`flex items-center justify-center w-full ${isNavVisible ? "overflow-visible" : "overflow-hidden"}`}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12 flex h-[54px] items-center justify-between w-full relative overflow-visible">

            {/* 1. MEDICINES (Mega Menu) */}
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("medicines")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-medicines"
                onKeyDown={(e) => handleDropdownKeyDown(e, "medicines")}
                className={`flex items-center gap-1.5 text-[17.8px] font-medium transition-all duration-200 outline-none border-none cursor-pointer px-3.5 py-1.5 rounded-xl ${activeDropdown === "medicines"
                    ? "bg-slate-200/80 text-slate-900"
                    : "text-slate-800 hover:bg-slate-200/50 hover:text-[#038076]"
                  }`}
              >
                <span>Medicines</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${activeDropdown === "medicines" ? "rotate-180" : ""}`} />
              </button>

              {/* Medicines Mega Menu Container */}
              <div
                id="dropdown-medicines"
                onMouseEnter={() => handleMouseEnter("medicines")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-2 w-[920px] max-w-[calc(100vw-3rem)] bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 transition-all duration-200 ease-out transform origin-top-left flex gap-8 text-left before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${activeDropdown === "medicines"
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  }`}
              >
                {/* Top Caret Triangle Arrow */}
                <div className="absolute -top-2 left-8 w-3.5 h-3.5 bg-white border-t border-l border-slate-200/80 rotate-45 z-20" />

                {/* COLUMN 1: BY CONDITION (Limit to first 8 dynamic categories) */}
                <div className="flex-1 min-w-[290px]">
                  <h4 className="text-[13.5px] font-black uppercase text-slate-400 tracking-wider mb-3 select-none pb-1.5 border-b border-slate-100/80">BY CONDITION</h4>
                  <div className="grid grid-cols-1 gap-0.5">
                    {menuData.conditions.slice(0, 8).map((cond) => (
                      <Link
                        key={cond._id || cond.id}
                        to={`/category/${cond.slug || encodeURIComponent(cond.linkedCategory || cond.name)}`}
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="text-[16px] font-semibold text-slate-700 py-1.5 px-2 -mx-2 rounded-md hover:bg-slate-50 hover:text-[#038076] transition-colors leading-snug block"
                      >
                        {cond.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* COLUMN 2: SUPER SPECIALITY & SOURCE */}
                <div className="w-[240px] flex flex-col justify-between shrink-0">
                  <div>
                    <h4 className="text-[13.5px] font-black uppercase text-slate-400 tracking-wider mb-3 select-none pb-1.5 border-b border-slate-100/80">SUPER SPECIALITY</h4>
                    <div className="flex flex-col gap-0.5">
                      {menuData.specialities.map((spec) => (
                        <Link
                          key={spec._id || spec.id}
                          to={`/products?speciality=${spec.linkedSpeciality || spec.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                          className="text-[16px] font-semibold text-slate-700 py-1.5 px-2 -mx-2 rounded-md hover:bg-slate-50 hover:text-[#038076] transition-colors leading-snug block"
                        >
                          {spec.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <h4 className="text-[13px] font-black uppercase text-slate-400 tracking-wider mb-2 select-none">SOURCE</h4>
                    <div className="flex flex-col gap-1">
                      {menuData.sources.map((source) => (
                        <Link
                          key={source._id || source.id}
                          to={`/products?${source.queryParam}`}
                          onClick={() => setActiveDropdown(null)}
                          onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                          className="flex items-center gap-2 text-[16px] font-semibold text-slate-700 hover:text-[#038076] px-2 -mx-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          {renderIcon(source.icon || "Globe", "w-4 h-4 text-slate-400 shrink-0")}
                          <span>{source.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: QUICK LINKS */}
                <div className="w-[260px] bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 flex flex-col justify-between shrink-0">
                  <div>
                    <h4 className="text-[13.5px] font-black uppercase text-slate-400 tracking-wider mb-3 select-none pb-1.5 border-b border-slate-100/80">Quick Links</h4>
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const regularQuickLinks = [...menuData.quickLinks.filter(l => !l.isHelpCard)];
                        if (!regularQuickLinks.some(l => l.route === "/molecules")) {
                          regularQuickLinks.push({
                            id: "molecules",
                            name: "Molecules",
                            route: "/molecules",
                            icon: "FlaskConical",
                            isExternal: false
                          });
                        }
                        return regularQuickLinks.map((link) => {
                          const isLinkExternal = link.isExternal || link.route?.startsWith("tel:") || link.route?.startsWith("mailto:");
                          const Comp = isLinkExternal ? "a" : Link;
                          const props = isLinkExternal
                            ? { href: link.route, target: link.openInNewTab ? "_blank" : undefined, rel: link.openInNewTab ? "noopener noreferrer" : undefined }
                            : { to: link.route };

                          return (
                            <Comp
                              key={link._id || link.id}
                              {...props}
                              onClick={() => setActiveDropdown(null)}
                              onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                              className="flex items-center gap-2 text-[16px] font-bold text-slate-700 hover:text-[#038076] transition-colors py-0.5"
                            >
                              {renderIcon(link.icon || "Link", "w-4 h-4 shrink-0 text-slate-400")}
                              <span>{link.name}</span>
                            </Comp>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {menuData.quickLinks.filter(l => l.isHelpCard).map((helpCard) => (
                    <div key={helpCard._id || helpCard.id} className="mt-3 pt-2.5 border-t border-slate-200/60">
                      <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-2xs text-xs">
                        <p className="font-black text-slate-700 uppercase tracking-tight text-[12px] mb-1.5 flex items-center gap-1.5">
                          {renderIcon(helpCard.icon || "HelpCircle", "w-4 h-4 text-[#038076]")}
                          <span>Need Help?</span>
                        </p>
                        <a
                          href={helpCard.route}
                          target={helpCard.openInNewTab ? "_blank" : undefined}
                          rel={helpCard.openInNewTab ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-[#038076] transition-colors mb-0.5 text-[15.5px]"
                        >
                          {renderIcon(helpCard.icon || "PhoneCall", "w-3.5 h-3.5 text-[#038076]")}
                          <span>{helpCard.name}</span>
                        </a>
                        <p className="text-[12px] text-slate-400 font-medium">{helpCard.helpSubtext}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* 2. SURGICAL (Simple Dropdown) */}
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("surgical")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-surgical"
                onKeyDown={(e) => handleDropdownKeyDown(e, "surgical")}
                className={`flex items-center gap-1.5 text-[17.8px] font-medium transition-all duration-200 outline-none border-none cursor-pointer px-3.5 py-1.5 rounded-xl ${activeDropdown === "surgical"
                    ? "bg-slate-200/80 text-slate-900"
                    : "text-slate-800 hover:bg-slate-200/50 hover:text-[#038076]"
                  }`}
              >
                <span>Surgical</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase bg-[#00a79d] text-white tracking-wider leading-none select-none shrink-0 whitespace-nowrap">
                  NEW
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${activeDropdown === "surgical" ? "rotate-180" : ""}`} />
              </button>

              <div
                id="dropdown-surgical"
                onMouseEnter={() => handleMouseEnter("surgical")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-3 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${activeDropdown === "surgical"
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  }`}
              >
                {/* Top Caret Triangle Arrow */}
                <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white border-t border-l border-slate-200/80 rotate-45 z-20" />

                <div className="flex flex-col gap-0.5 text-left relative z-30">
                  {surgicalCategories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/surgical/${cat.slug}`}
                      onClick={() => setActiveDropdown(null)}
                      onKeyDown={(e) => handleLinkKeyDown(e, "surgical")}
                      className="px-4 py-2.5 text-[15.5px] font-medium text-slate-800 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all whitespace-nowrap block"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/surgical/categories"
                    onClick={() => setActiveDropdown(null)}
                    onKeyDown={(e) => handleLinkKeyDown(e, "surgical")}
                    className="px-4 py-2 text-[15px] font-bold text-[#004782] rounded-lg hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <span>View All Surgical Categories</span>
                    <span>&rarr;</span>
                  </Link>
                  <Link
                    to="/surgical/all"
                    onClick={() => setActiveDropdown(null)}
                    onKeyDown={(e) => handleLinkKeyDown(e, "surgical")}
                    className="px-4 py-2 text-[15px] font-extrabold text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-between"
                  >
                    <span>View All Surgical Products</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Wellness (Direct Link) */}
            <div className="relative flex h-full items-center">
              <NavLink
                to="/wellness"
                className={({ isActive }) =>
                  `flex items-center text-[17.8px] font-medium transition-all duration-200 outline-none border-none cursor-pointer px-3.5 py-1.5 rounded-xl ${isActive
                    ? "bg-slate-200/80 text-[#038076] font-semibold"
                    : "text-slate-800 hover:bg-slate-200/50 hover:text-[#038076]"
                  }`
                }
              >
                Wellness
              </NavLink>
            </div>

            {/* 4. HEALTH LIBRARY (Dropdown) */}
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("library")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-library"
                onKeyDown={(e) => handleDropdownKeyDown(e, "library")}
                className={`flex items-center gap-1.5 text-[17.8px] font-medium transition-all duration-200 outline-none border-none cursor-pointer px-3.5 py-1.5 rounded-xl ${activeDropdown === "library"
                    ? "bg-slate-200/80 text-slate-900"
                    : "text-slate-800 hover:bg-slate-200/50 hover:text-[#038076]"
                  }`}
              >
                <span>Health Library</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${activeDropdown === "library" ? "rotate-180" : ""}`} />
              </button>

              <div
                id="dropdown-library"
                onMouseEnter={() => handleMouseEnter("library")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-3 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${activeDropdown === "library"
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  }`}
              >
                {/* Top Caret Triangle Arrow */}
                <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white border-t border-l border-slate-200/80 rotate-45 z-20" />

                <div className="flex flex-col gap-0.5 text-left relative z-30">
                  {[
                    { label: "Articles", to: "/library/articles" },
                    { label: "Health Guides", to: "/library/health-guides" },
                    { label: "Medicine Guides", to: "/library/medicine-guides" },
                    { label: "Disease Awareness", to: "/library/disease-awareness" },
                    { label: "Lifestyle", to: "/library/lifestyle" },
                    { label: "Nutrition", to: "/library/nutrition" }
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setActiveDropdown(null)}
                      onKeyDown={(e) => handleLinkKeyDown(e, "library")}
                      className="px-4 py-2.5 text-[15.5px] font-medium text-slate-800 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all whitespace-nowrap block"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Patient Assistance Program (Direct Link) */}
            <div className="relative flex h-full items-center">
              <NavLink
                to="/patient-assistance-program"
                className={({ isActive }) =>
                  `flex items-center text-[17.8px] font-medium transition-all duration-200 outline-none border-none cursor-pointer px-3.5 py-1.5 rounded-xl ${isActive
                    ? "bg-slate-200/80 text-[#038076] font-semibold"
                    : "text-slate-800 hover:bg-slate-200/50 hover:text-[#038076]"
                  }`
                }
              >
                Patient Assistance Program
              </NavLink>
            </div>

          </div>
        </div>
      </div>



      {/* Prescription Upload Modal trigger */}
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
    </nav>
  );
};

export default Navbar;
