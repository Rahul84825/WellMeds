import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Search,
  Globe,
  Activity,
  Handshake,
  Percent,
  FileText,
  FlaskConical,
  ChevronDown,
  LayoutDashboard,
  User,
  History,
  LogOut,
  PhoneCall,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDrawer } from "../context/DrawerContext";
import { api } from "../services/api";
import logoImg from "../assets/logos/logo.png";

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
  FlaskConical
};

const renderIcon = (name, className = "w-4 h-4") => {
  const IconComp = iconMap[name] || HelpCircle;
  return <IconComp className={className} />;
};

const GlobalDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen, menuData, menuLoading } = useDrawer();
  const { user, logout, isAdmin, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation states
  const [activeMobileAccordion, setActiveMobileAccordion] = useState(null); // Accordions on mobile
  const [activeMobileSubAccordion, setActiveMobileSubAccordion] = useState(null); // Nested accordion for Medicines
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  // Dynamic categories
  const [surgicalCategories, setSurgicalCategories] = useState([]);

  const drawerRef = useRef(null);
  const lastActiveElementRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch Surgical Categories dynamically
  useEffect(() => {
    if (!isDrawerOpen) return;
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
  }, [isDrawerOpen]);


  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Accessibility: Focus trap & focus restoration for Mobile Drawer
  useEffect(() => {
    if (isDrawerOpen) {
      lastActiveElementRef.current = document.activeElement;
      // Delay slightly to allow transition animation to complete
      const timer = setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector(
          'button, a, input, select, textarea, [tabindex="0"]'
        );
        if (firstFocusable) firstFocusable.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
        lastActiveElementRef.current = null;
      }
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleFocusTrap = (e) => {
      if (e.key === "Tab") {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => {
      document.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    await logout();
    setIsDrawerOpen(false);
    navigate("/");
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* MOBILE DRAWER BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 lg:hidden ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* MOBILE DRAWER CONTAINER */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed top-0 bottom-0 left-0 w-[90vw] sm:w-[80vw] max-w-[340px] bg-white z-[1001] transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 select-none">
          <Link to="/" onClick={() => setIsDrawerOpen(false)} className="flex items-center h-10">
            <img src={logoImg} alt="WellMeds Logo" className="object-contain max-h-16 w-auto" />
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
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
                  setIsDrawerOpen(false);
                  navigate(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
                }
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
            />
          </div>

          {/* Quick Upload Rx Button */}
          <button
            onClick={() => {
              setIsDrawerOpen(false);
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
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1 cursor-pointer"
              >
                <span>Medicines</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeMobileAccordion === "meds" ? "rotate-180" : ""}`} />
              </button>

              {activeMobileAccordion === "meds" && (
                <div className="pl-3 py-1.5 space-y-2.5 border-l-2 border-slate-100 mt-1 animate-in fade-in duration-200">
                  {/* Sub Accordion: By Condition */}
                  {menuData.conditions.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "cond" ? null : "cond")}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px] cursor-pointer"
                      >
                        <span>By Condition</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "cond" ? "rotate-180" : ""}`} />
                      </button>
                      {activeMobileSubAccordion === "cond" && (
                        <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                          {menuData.conditions.map((cond) => (
                            <Link
                              key={cond._id || cond.id}
                              to={`/products?category=${encodeURIComponent(cond.linkedCategory || cond.name)}`}
                              onClick={() => setIsDrawerOpen(false)}
                              className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center"
                            >
                              {cond.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub Accordion: Super Speciality */}
                  {menuData.specialities.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "spec" ? null : "spec")}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px] cursor-pointer"
                      >
                        <span>Super Speciality</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "spec" ? "rotate-180" : ""}`} />
                      </button>
                      {activeMobileSubAccordion === "spec" && (
                        <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                          {menuData.specialities.map((spec) => (
                            <Link
                              key={spec._id || spec.id}
                              to={`/products?speciality=${spec.linkedSpeciality || spec.slug}`}
                              onClick={() => setIsDrawerOpen(false)}
                              className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center"
                            >
                              {spec.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub Accordion: Source */}
                  {menuData.sources.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "source" ? null : "source")}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px] cursor-pointer"
                      >
                        <span>Source</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "source" ? "rotate-180" : ""}`} />
                      </button>
                      {activeMobileSubAccordion === "source" && (
                        <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                          {menuData.sources.map((source) => (
                            <Link
                              key={source._id || source.id}
                              to={`/products?${source.queryParam}`}
                              onClick={() => setIsDrawerOpen(false)}
                              className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center gap-1.5"
                            >
                              {renderIcon(source.icon || "Globe", "w-3.5 h-3.5 text-slate-400")}
                              <span>{source.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub Accordion: Quick Links */}
                  {menuData.quickLinks.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveMobileSubAccordion(activeMobileSubAccordion === "quick" ? null : "quick")}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 min-h-[44px] cursor-pointer"
                      >
                        <span>Quick Links</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeMobileSubAccordion === "quick" ? "rotate-180" : ""}`} />
                      </button>
                      {activeMobileSubAccordion === "quick" && (
                        <div className="pl-3 py-1 flex flex-col gap-1 border-l border-slate-100 mt-1">
                          {(() => {
                            const list = [...menuData.quickLinks];
                            const helpCardIndex = list.findIndex(l => l.isHelpCard);
                            const newItem = {
                              id: "molecules",
                              name: "Molecules",
                              route: "/molecules",
                              icon: "FlaskConical",
                              isExternal: false
                            };
                            if (helpCardIndex !== -1) {
                              list.splice(helpCardIndex, 0, newItem);
                            } else {
                              list.push(newItem);
                            }
                            return list.map((link) => {
                              const isLinkExternal = link.isExternal || link.route?.startsWith("tel:") || link.route?.startsWith("mailto:");
                              const Comp = isLinkExternal ? "a" : Link;
                              const props = isLinkExternal 
                                ? { href: link.route, target: link.openInNewTab ? "_blank" : undefined, rel: link.openInNewTab ? "noopener noreferrer" : undefined }
                                : { to: link.route };

                              return (
                                <Comp
                                  key={link._id || link.id}
                                  {...props}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center gap-1.5"
                                >
                                  {renderIcon(link.icon || "Link", "w-3.5 h-3.5 text-slate-400")}
                                  <span>{link.name}</span>
                                </Comp>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* 2. Surgical Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "surg" ? null : "surg")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1 cursor-pointer"
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
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="border-slate-100 my-1" />
                  <Link
                    to="/surgical/all"
                    onClick={() => setIsDrawerOpen(false)}
                    className="py-2.5 text-[11px] font-black text-[#004782] block min-h-[48px] flex items-center justify-between"
                  >
                    <span>View All Surgical</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Wellness (Direct Link) */}
            <div className="border-b border-slate-50 pb-1">
              <Link
                to="/wellness"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1 cursor-pointer hover:text-[#038076] transition-colors"
              >
                Wellness
              </Link>
            </div>

            {/* 4. Health Library Accordion */}
            <div className="border-b border-slate-50 pb-1">
              <button
                type="button"
                onClick={() => setActiveMobileAccordion(activeMobileAccordion === "lib" ? null : "lib")}
                className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-800 min-h-[48px] px-1 cursor-pointer"
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
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#038076] block min-h-[48px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Patient Assistance Program (PAP) (Direct Link) */}
            <div className="border-b border-slate-50 pb-1">
              <Link
                to="/patient-assistance-program"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center py-3 text-xs font-bold text-[#004782] min-h-[48px] px-1 cursor-pointer hover:text-[#038076] transition-colors"
              >
                Patient Assistance Program (PAP)
              </Link>
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
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsDrawerOpen(false)}
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
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-2.5 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-xl min-h-[48px]"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      to="/upload-prescription"
                      onClick={() => setIsDrawerOpen(false)}
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
                  setIsDrawerOpen(false);
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
    </>,
    document.body
  );
};

export default GlobalDrawer;
