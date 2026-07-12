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
  Search,
  Globe,
  Handshake,
  ArrowLeft,
  MapPin,
  HelpCircle,
  PhoneCall,
  Activity,
  Heart
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import logoImg from "../assets/logos/logo.png";
import { toast } from "sonner";
import { api } from "../services/api";

const Navbar = () => {
  const { user, logout, isAdmin, openLoginModal } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'medicines' | 'surgical' | 'wellness' | 'library' | 'pap'
  const [activeMobileAccordion, setActiveMobileAccordion] = useState(null); // Accordions on mobile
  const [activeMobileSubAccordion, setActiveMobileSubAccordion] = useState(null); // Nested accordion for Medicines

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
  const [selectedLocation, setSelectedLocation] = useState("Pune, 411021");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  // Search states
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [showNavbarSearch, setShowNavbarSearch] = useState(location.pathname !== "/");
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);

  // Profile and Prescription Upload states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [focusedProfileIndex, setFocusedProfileIndex] = useState(-1);

  // Dynamic categories
  const [surgicalCategories, setSurgicalCategories] = useState([]);
  const [wellnessCategories, setWellnessCategories] = useState([]);

  const dropdownRef = useRef(null);
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

  // Fetch Wellness Categories dynamically (excluding medicine conditions)
  useEffect(() => {
    let active = true;
    const fetchWellness = async () => {
      try {
        const cats = await api.getCategories();
        if (active) {
          const conditionNames = [
            "Cardiac Care",
            "Kidney / Transplant Care",
            "HIV / AIDS Care",
            "Cancer Care",
            "Hepatitis Care",
            "Diabetes Care",
            "Respiratory Care",
            "Neuro & Mental Health",
            "Rare & Orphan Diseases",
            "Palliative Care",
            "Post-Surgery Recovery",
            "Prescription"
          ];
          const filtered = (cats || []).filter(c => !conditionNames.includes(c.name));
          setWellnessCategories(filtered);
        }
      } catch (err) {
        console.error("Failed to load categories for wellness", err);
      }
    };
    fetchWellness();
    return () => { active = false; };
  }, []);

  // Sync scroll showing of search input on homepage
  useEffect(() => {
    if (location.pathname !== "/") {
      setShowNavbarSearch(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 200) {
            setShowNavbarSearch(true);
          } else {
            setShowNavbarSearch(false);
          }
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

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setProfileDropdownOpen(false);
        setLocationMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <nav className="w-full sticky top-0 z-[100] flex-shrink-0 h-[144px] border-b border-slate-150 bg-white/90 backdrop-blur-md shadow-sm transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 xl:px-16 flex flex-col h-full justify-between py-2">
        
        {/* ROW 1: Logo, Location Selector, Search, & Top Actions */}
        <div className="flex items-center justify-between gap-6 relative z-30 w-full h-[68px]">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center group transition-all duration-150 hover:scale-[1.02] select-none cursor-pointer"
            >
              <img 
                src={logoImg}
                alt="WellMeds Logo"
                style={{ height: "110px" }}
                className="object-contain"
              />
            </NavLink>
          </div>

          {/* Search bar & Location selector container */}
          <div className="hidden lg:flex items-center justify-center flex-grow flex-1 mx-6 relative z-10">
            <div 
              style={{
                transition: "opacity 280ms cubic-bezier(.22,.61,.36,1), transform 280ms cubic-bezier(.22,.61,.36,1)",
                transform: showNavbarSearch ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 32px, 0) scale(0.95)",
                opacity: showNavbarSearch ? 1 : 0,
              }}
              className={`flex items-center bg-white border border-slate-200 rounded-full p-1 flex-row relative gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] focus-within:border-[#038076] focus-within:ring-2 focus-within:ring-[#038076]/10 transition-all duration-300 w-full ${
                showNavbarSearch ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              {/* Delivery Selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-0.5 text-slate-700 hover:bg-slate-50 rounded-full transition-all focus:outline-none text-left cursor-pointer"
                  aria-label="Select delivery location"
                >
                  <MapPin className="w-[16px] h-[16px] text-[#038076] shrink-0" />
                  <div className="flex flex-col leading-none select-none">
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider">Deliver to</span>
                    <span className="text-[11px] font-extrabold text-slate-800 mt-[1px] flex items-center gap-0.5">
                      {selectedLocation} 
                      <ChevronDown className={`w-[10px] h-[10px] text-slate-500 transition-transform duration-200 ${locationMenuOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                </button>

                {locationMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[105]" onClick={() => setLocationMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-150 py-1 z-[110] text-left text-xs text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                      {["Pune, 411021", "Mumbai, 400001", "Delhi, 110001", "Bangalore, 560001", "Chennai, 600001"].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 hover:bg-slate-50 hover:text-[#038076] font-bold text-left transition-colors focus:outline-none cursor-pointer"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Vertical separator */}
              <div className="w-px h-5 bg-slate-200 shrink-0"></div>

              {/* Search inputs */}
              <div className="flex-1 flex items-center relative gap-2">
                <Search className="text-slate-400 ml-1 shrink-0" size={14} />
                <input
                  type="text"
                  placeholder="Search Medicines, Molecules..."
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && desktopSearchQuery.trim()) {
                      navigate(`/products?search=${encodeURIComponent(desktopSearchQuery.trim())}`);
                    }
                  }}
                  className="w-full bg-transparent border-none text-[11px] outline-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none p-0 font-semibold"
                />
              </div>

              {/* Search button */}
              <button 
                type="button"
                onClick={() => {
                  if (desktopSearchQuery.trim()) {
                    navigate(`/products?search=${encodeURIComponent(desktopSearchQuery.trim())}`);
                  }
                }}
                className="bg-[#038076] text-white px-4 py-1.5 rounded-full font-bold text-xs hover:bg-[#02665e] active:scale-[0.97] transition-all shrink-0 shadow-sm cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Desktop Right Side Top Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Upload Rx Button */}
            <button
              onClick={() => navigate("/upload-prescription")}
              className="bg-[#004782] hover:bg-[#086b53] text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 flex items-center justify-center gap-1.5 active:scale-[0.98] select-none cursor-pointer text-xs"
              aria-label="Upload Doctor Prescription"
            >
              <FileText className="w-[14px] h-[14px]" />
              <span>Upload Rx</span>
            </button>

            {/* Offer Button */}
            <Link
              to="/offers"
              className="w-[34px] h-[34px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] transition-colors"
              aria-label="Discounts & Offers"
            >
              <Percent className="w-[15px] h-[15px] text-gray-700" />
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative w-[34px] h-[34px] rounded-full border border-gray-205 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] transition-colors"
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-[15px] h-[15px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center animate-pulse border border-white">
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
                  className="px-4 h-[34px] border border-gray-200 bg-white rounded-full flex items-center justify-center gap-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] cursor-pointer shrink-0 text-xs font-semibold"
                >
                  <User className="w-[14px] h-[14px] text-gray-500" />
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => openLoginModal()}
                  className="w-[90px] h-[34px] border border-gray-200 bg-white rounded-full flex items-center justify-center gap-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004782] font-semibold cursor-pointer shrink-0 text-xs"
                >
                  <User className="w-[14px] h-[14px] text-gray-500" />
                  <span>Login</span>
                </button>
              )}

              {profileDropdownOpen && user && (
                <div
                  id="user-profile-menu"
                  role="menu"
                  aria-label="User Profile Options"
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-150 rounded-xl shadow-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 select-none bg-slate-50/50">
                    <div className="w-8 h-8 rounded-full bg-[#038076]/10 text-[#038076] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate leading-tight">{user.name}</p>
                      <p className="text-[9px] text-gray-400 truncate mt-[2px] leading-normal">{user.email || user.phone || ""}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 p-1">
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
                            className={`group flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold rounded-lg select-none transition-all duration-150 w-full text-left cursor-pointer outline-none
                              ${item.id === "logout"
                                ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                                : isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }
                            `}
                          >
                            <item.icon className={`w-[15px] h-[15px] shrink-0 ${item.id === "logout" ? "text-red-500" : "text-slate-400 group-hover:text-slate-600"}`} />
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

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-2 lg:hidden ml-auto z-10">
            <button
              onClick={() => setMobileSearchExpanded(true)}
              className="w-[36px] h-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none transition-all cursor-pointer"
              aria-label="Open Search"
            >
              <Search className="w-[15px] h-[15px]" />
            </button>
            <Link
              to="/cart"
              className="relative w-[36px] h-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-[15px] h-[15px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-[36px] h-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none transition-all cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Fullscreen Search Expansion */}
          {mobileSearchExpanded && (
            <div className="flex items-center w-full gap-2 px-4 py-2 bg-white z-30 absolute inset-0">
              <button 
                onClick={() => setMobileSearchExpanded(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
                aria-label="Close Search"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mobileSearchQuery.trim()) {
                      navigate(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
                      setMobileSearchExpanded(false);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-primary transition-all font-semibold"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: Primary Bottom Navigation Bar (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-center border-t border-slate-100/60 z-20 relative w-full h-[68px]">
          <div className="flex h-full items-center justify-center gap-x-[48px] lg:gap-x-[56px]">
            
            {/* 1. MEDICINES (Mega Menu) */}
            <div 
              className="static flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("medicines")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-medicines"
                onKeyDown={(e) => handleDropdownKeyDown(e, "medicines")}
                className="flex h-full items-center gap-1.5 text-[14px] font-bold text-slate-800 cursor-pointer transition-colors duration-150 hover:text-[#038076] focus:text-[#038076] outline-none"
              >
                <span>Medicines</span>
                <ChevronDown className={`h-[14px] w-[14px] text-slate-400 transition-transform duration-200 ${activeDropdown === "medicines" ? "rotate-180" : ""}`} />
              </button>

              {/* Medicines Mega Menu Container */}
              <div 
                id="dropdown-medicines"
                onMouseEnter={() => handleMouseEnter("medicines")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-1 w-[900px] bg-white border border-slate-150 rounded-2xl shadow-xl p-8 transition-all duration-200 ease-out transform origin-top flex gap-10 text-left before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${
                  activeDropdown === "medicines" 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                {/* COLUMN 1: BY CONDITION */}
                <div className="flex-1 min-w-[250px]">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 select-none pb-2 border-b border-slate-100/60">BY CONDITION</h4>
                  <div className="grid grid-cols-1 gap-0.5">
                    {[
                      { name: "Oncology / Cancer Care", filter: "Cancer Care" },
                      { name: "HIV / AIDS Care", filter: "HIV / AIDS Care" },
                      { name: "Hepatitis Care", filter: "Hepatitis Care" },
                      { name: "Cardiac Care", filter: "Cardiac Care" },
                      { name: "Diabetes Care", filter: "Diabetes Care" },
                      { name: "Kidney / Transplant Care", filter: "Kidney / Transplant Care" },
                      { name: "Respiratory Care", filter: "Respiratory Care" },
                      { name: "Neuro & Mental Health", filter: "Neuro & Mental Health" },
                      { name: "Rare & Orphan Diseases", filter: "Rare & Orphan Diseases" },
                      { name: "Pain Management / Palliative Care", filter: "Palliative Care" }
                    ].map((cond) => (
                      <Link
                        key={cond.name}
                        to={`/products?category=${encodeURIComponent(cond.filter)}`}
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="text-[13.5px] font-bold text-slate-600 py-1.5 hover:text-[#038076] transition-colors leading-relaxed block"
                      >
                        {cond.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* COLUMN 2: SUPER SPECIALITY & SOURCE */}
                <div className="w-[210px] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 select-none pb-2 border-b border-slate-100/60">SUPER SPECIALITY</h4>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { name: "GLP-1 Injections", slug: "glp-1" },
                        { name: "Biologics", slug: "biologics" },
                        { name: "Immunosuppressants", slug: "immunosuppressants" },
                        { name: "Chemotherapy Support", slug: "chemotherapy-support" },
                        { name: "Specialty Injectables", slug: "specialty-injectables" }
                      ].map((spec) => (
                        <Link
                          key={spec.name}
                          to={`/products?speciality=${spec.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                          className="text-[13.5px] font-bold text-slate-600 py-1.5 hover:text-[#038076] transition-colors leading-relaxed block"
                        >
                          {spec.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[11.5px] font-black uppercase text-slate-400 tracking-wider mb-2.5 select-none">SOURCE</h4>
                    <div className="flex flex-col gap-1.5">
                      <Link
                        to="/products?isImported=true"
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="flex items-center gap-2 text-[13.5px] font-bold text-slate-600 hover:text-[#038076] transition-colors py-1"
                      >
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Imported Medicines</span>
                      </Link>
                      <Link
                        to="/products?isImported=false"
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="flex items-center gap-2 text-[13.5px] font-bold text-slate-600 hover:text-[#038076] transition-colors py-1"
                      >
                        <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Indian Generics</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: QUICK LINKS */}
                <div className="w-[250px] bg-slate-50/70 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 select-none pb-2 border-b border-slate-100/60">Quick Links</h4>
                    <div className="flex flex-col gap-2.5">
                      <Link
                        to="/patient-assistance-program"
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="flex items-center gap-2 text-[13.5px] font-extrabold text-[#004782] hover:text-[#038076] transition-colors py-0.5"
                      >
                        <Handshake className="w-4 h-4 shrink-0 text-[#004782]/70" />
                        <span>PAP Auto Refill</span>
                      </Link>
                      <Link
                        to="/upload-prescription"
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="flex items-center gap-2 text-[13.5px] font-extrabold text-slate-700 hover:text-[#038076] transition-colors py-0.5"
                      >
                        <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>Upload Prescription</span>
                      </Link>
                      <Link
                        to="/offers"
                        onClick={() => setActiveDropdown(null)}
                        onKeyDown={(e) => handleLinkKeyDown(e, "medicines")}
                        className="flex items-center gap-2 text-[13.5px] font-extrabold text-slate-700 hover:text-[#038076] transition-colors py-0.5"
                      >
                        <Percent className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>Today's Offers</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-100 text-xs">
                      <p className="font-black text-slate-700 uppercase tracking-tight text-[11px] mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#038076]" />
                        <span>Need Help?</span>
                      </p>
                      <a href="tel:+917420909445" className="flex items-center gap-2 font-extrabold text-slate-800 hover:text-[#038076] transition-colors mb-1 text-[13px]">
                        <PhoneCall className="w-3 h-3 text-[#038076]" />
                        <span>Talk to Pharmacist</span>
                      </a>
                      <p className="text-[10.5px] text-slate-400 font-medium">Free support from licensed pharmacists.</p>
                    </div>
                  </div>
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
                className="flex h-full items-center gap-1.5 text-[14px] font-bold text-slate-800 cursor-pointer transition-colors duration-150 hover:text-[#038076] focus:text-[#038076] outline-none"
              >
                <span>Surgical</span>
                <ChevronDown className={`h-[14px] w-[14px] text-slate-400 transition-transform duration-200 ${activeDropdown === "surgical" ? "rotate-180" : ""}`} />
              </button>

              <div 
                id="dropdown-surgical"
                onMouseEnter={() => handleMouseEnter("surgical")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-1 w-64 bg-white border border-slate-150 rounded-xl shadow-xl p-2 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${
                  activeDropdown === "surgical" 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  {surgicalCategories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/surgical/${cat.slug}`}
                      onClick={() => setActiveDropdown(null)}
                      onKeyDown={(e) => handleLinkKeyDown(e, "surgical")}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/surgical/all"
                    onClick={() => setActiveDropdown(null)}
                    onKeyDown={(e) => handleLinkKeyDown(e, "surgical")}
                    className="px-4 py-2.5 text-xs font-black text-[#004782] rounded-lg hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <span>View All Surgical</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. WELLNESS (Simple Dropdown) */}
            <div 
              className="relative flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("wellness")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-wellness"
                onKeyDown={(e) => handleDropdownKeyDown(e, "wellness")}
                className="flex h-full items-center gap-1.5 text-[14px] font-bold text-slate-800 cursor-pointer transition-colors duration-150 hover:text-[#038076] focus:text-[#038076] outline-none"
              >
                <span>Wellness</span>
                <ChevronDown className={`h-[14px] w-[14px] text-slate-400 transition-transform duration-200 ${activeDropdown === "wellness" ? "rotate-180" : ""}`} />
              </button>

              <div 
                id="dropdown-wellness"
                onMouseEnter={() => handleMouseEnter("wellness")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-1 w-64 bg-white border border-slate-150 rounded-xl shadow-xl p-2 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${
                  activeDropdown === "wellness" 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  {wellnessCategories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/wellness?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setActiveDropdown(null)}
                      onKeyDown={(e) => handleLinkKeyDown(e, "wellness")}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/wellness"
                    onClick={() => setActiveDropdown(null)}
                    onKeyDown={(e) => handleLinkKeyDown(e, "wellness")}
                    className="px-4 py-2.5 text-xs font-black text-[#004782] rounded-lg hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <span>View All Wellness</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
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
                className="flex h-full items-center gap-1.5 text-[14px] font-bold text-slate-800 cursor-pointer transition-colors duration-150 hover:text-[#038076] focus:text-[#038076] outline-none"
              >
                <span>Health Library</span>
                <ChevronDown className={`h-[14px] w-[14px] text-slate-400 transition-transform duration-200 ${activeDropdown === "library" ? "rotate-180" : ""}`} />
              </button>

              <div 
                id="dropdown-library"
                onMouseEnter={() => handleMouseEnter("library")}
                onMouseLeave={handleMouseLeave}
                className={`absolute left-0 top-full z-[200] mt-1 w-60 bg-white border border-slate-150 rounded-xl shadow-xl p-2 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${
                  activeDropdown === "library" 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
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
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. PATIENT ASSISTANCE PROGRAM (PAP) */}
            <div 
              className="relative flex h-full items-center"
              onMouseEnter={() => handleMouseEnter("pap")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id="trigger-pap"
                onKeyDown={(e) => handleDropdownKeyDown(e, "pap")}
                className="flex h-full items-center gap-1.5 text-[14px] font-bold text-[#004782] cursor-pointer transition-colors duration-150 hover:text-[#038076] focus:text-[#038076] outline-none"
              >
                <span>Patient Assistance Program (PAP)</span>
                <ChevronDown className={`h-[14px] w-[14px] text-slate-400 transition-transform duration-200 ${activeDropdown === "pap" ? "rotate-180" : ""}`} />
              </button>

              <div 
                id="dropdown-pap"
                onMouseEnter={() => handleMouseEnter("pap")}
                onMouseLeave={handleMouseLeave}
                className={`absolute right-0 top-full z-[200] mt-1 w-64 bg-white border border-slate-150 rounded-xl shadow-xl p-2 transition-all duration-200 ease-out transform origin-top before:absolute before:top-[-12px] before:left-0 before:right-0 before:h-[12px] before:content-[''] ${
                  activeDropdown === "pap" 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  {[
                    { label: "Manufacturer PAP", to: "/patient-assistance-program" },
                    { label: "Eligibility", to: "/patient-assistance-program#pap-eligibility" },
                    { label: "Enrollment", to: "/patient-assistance-program#pap-enrollment" },
                    { label: "Available Programs", to: "/patient-assistance-program#pap-programs" },
                    { label: "How It Works", to: "/patient-assistance-program#pap-how-it-works" },
                    { label: "FAQs", to: "/patient-assistance-program#pap-faqs" }
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setActiveDropdown(null)}
                      onKeyDown={(e) => handleLinkKeyDown(e, "pap")}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-[#038076] transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MOBILE DRAWER BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* MOBILE DRAWER CONTAINER */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white z-[201] transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 select-none">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-10">
            <img src={logoImg} alt="WellMeds Logo" className="object-contain max-h-16 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Close Mobile Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-left">
          
          {/* Mobile Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
            />
          </div>

          {/* Quick Upload Rx Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/upload-prescription");
            }}
            className="w-full bg-[#004782] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm min-h-[48px] cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Doctor Rx</span>
          </button>

          {/* ACCORDION MENU ITEMS */}
          <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Navigation Menu</span>

            {/* 1. Medicines Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "meds" ? null : "meds")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1"
              >
                <span>Medicines</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "meds" ? "rotate-180" : ""}`} />
              </button>

              {activeMobileAccordion === "meds" && (
                <div className="pl-3 py-1.5 space-y-2.5 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200">
                  {/* Sub Accordion: By Condition */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "cond" ? null : "cond")}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px]"
                    >
                      <span>By Condition</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "cond" ? "rotate-180" : ""}`} />
                    </button>
                    {activeMobileSubAccordion === "cond" && (
                      <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                        {[
                          { name: "Oncology / Cancer Care", filter: "Cancer Care" },
                          { name: "HIV / AIDS Care", filter: "HIV / AIDS Care" },
                          { name: "Hepatitis Care", filter: "Hepatitis Care" },
                          { name: "Cardiac Care", filter: "Cardiac Care" },
                          { name: "Diabetes Care", filter: "Diabetes Care" },
                          { name: "Kidney / Transplant Care", filter: "Kidney / Transplant Care" },
                          { name: "Respiratory Care", filter: "Respiratory Care" },
                          { name: "Neuro & Mental Health", filter: "Neuro & Mental Health" },
                          { name: "Rare & Orphan Diseases", filter: "Rare & Orphan Diseases" },
                          { name: "Pain Management / Palliative Care", filter: "Palliative Care" }
                        ].map((cond) => (
                          <Link
                            key={cond.name}
                            to={`/products?category=${encodeURIComponent(cond.filter)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                          >
                            {cond.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sub Accordion: Super Speciality */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "spec" ? null : "spec")}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px]"
                    >
                      <span>Super Speciality</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "spec" ? "rotate-180" : ""}`} />
                    </button>
                    {activeMobileSubAccordion === "spec" && (
                      <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                        {[
                          { name: "GLP-1 Injections", slug: "glp-1" },
                          { name: "Biologics", slug: "biologics" },
                          { name: "Immunosuppressants", slug: "immunosuppressants" },
                          { name: "Chemotherapy Support", slug: "chemotherapy-support" },
                          { name: "Specialty Injectables", slug: "specialty-injectables" }
                        ].map((spec) => (
                          <Link
                            key={spec.name}
                            to={`/products?speciality=${spec.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                          >
                            {spec.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sub Accordion: Source */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "source" ? null : "source")}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px]"
                    >
                      <span>Source</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "source" ? "rotate-180" : ""}`} />
                    </button>
                    {activeMobileSubAccordion === "source" && (
                      <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                        <Link
                          to="/products?isImported=true"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>Imported Medicines</span>
                        </Link>
                        <Link
                          to="/products?isImported=false"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <span>Indian Generics</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Sub Accordion: Quick Links */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "quick" ? null : "quick")}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px]"
                    >
                      <span>Quick Links</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "quick" ? "rotate-180" : ""}`} />
                    </button>
                    {activeMobileSubAccordion === "quick" && (
                      <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                        <Link
                          to="/patient-assistance-program"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 text-[11px] font-bold text-[#004782] block min-h-[48px] flex items-center gap-1.5"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>PAP Auto Refill</span>
                        </Link>
                        <Link
                          to="/offers"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 text-[11px] font-bold text-slate-600 block min-h-[48px] flex items-center gap-1.5"
                        >
                          <Percent className="w-3.5 h-3.5 text-slate-400" />
                          <span>Today's Offers</span>
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* 2. Surgical Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "surg" ? null : "surg")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1"
              >
                <span>Surgical</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "surg" ? "rotate-180" : ""}`} />
              </button>
              {activeMobileAccordion === "surg" && (
                <div className="pl-3 py-1.5 space-y-1 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200 flex flex-col">
                  {surgicalCategories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/surgical/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/surgical/all"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-[11px] font-black text-[#004782] block min-h-[48px] flex items-center justify-between"
                  >
                    <span>View All Surgical</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Wellness Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "well" ? null : "well")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1"
              >
                <span>Wellness</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "well" ? "rotate-180" : ""}`} />
              </button>
              {activeMobileAccordion === "well" && (
                <div className="pl-3 py-1.5 space-y-1 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200 flex flex-col">
                  {wellnessCategories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/wellness?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/wellness"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-[11px] font-black text-[#004782] block min-h-[48px] flex items-center justify-between"
                  >
                    <span>View All Wellness</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Health Library Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "lib" ? null : "lib")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1"
              >
                <span>Health Library</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "lib" ? "rotate-180" : ""}`} />
              </button>
              {activeMobileAccordion === "lib" && (
                <div className="pl-3 py-1.5 space-y-1 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200 flex flex-col">
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
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Patient Assistance Program (PAP) Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "pap" ? null : "pap")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-[#004782] min-h-[48px] px-1"
              >
                <span>Patient Assistance Program (PAP)</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "pap" ? "rotate-180" : ""}`} />
              </button>
              {activeMobileAccordion === "pap" && (
                <div className="pl-3 py-1.5 space-y-1 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200 flex flex-col">
                  {[
                    { label: "Manufacturer PAP", to: "/patient-assistance-program" },
                    { label: "Eligibility", to: "/patient-assistance-program#pap-eligibility" },
                    { label: "Enrollment", to: "/patient-assistance-program#pap-enrollment" },
                    { label: "Available Programs", to: "/patient-assistance-program#pap-programs" },
                    { label: "How It Works", to: "/patient-assistance-program#pap-how-it-works" },
                    { label: "FAQs", to: "/patient-assistance-program#pap-faqs" }
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-primary block min-h-[48px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Profile Options / Login for Mobile */}
          <div className="flex flex-col gap-1 pt-4 border-t border-slate-100 select-none">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-1 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#038076]/10 text-[#038076] flex items-center justify-center font-extrabold text-sm shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-[9px] text-gray-400 truncate mt-[1px]">{user.email || user.phone || ""}</p>
                  </div>
                </div>

                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      to="/upload-prescription"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Prescriptions</span>
                    </Link>
                  </>
                )}
                
                <hr className="border-slate-100 my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 rounded-xl min-h-[48px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full py-3 px-4 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs min-h-[48px] cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Login / Register</span>
              </button>
            )}
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
