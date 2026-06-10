import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  console.log("[Storefront Navbar] User State:", user, "isAdmin:", isAdmin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const menuItemsRefs = useRef([]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns when location changes
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  // Set up menu items list
  const dropdownItems = [];
  if (user) {
    if (isAdmin) {
      dropdownItems.push({
        id: "admin-dashboard",
        type: "link",
        to: "/admin",
        label: "Admin Dashboard",
        icon: "admin_panel_settings",
        className: "font-bold text-primary dark:text-primary-fixed-dim bg-primary/5 dark:bg-primary-fixed-dim/5 border-l-4 border-primary dark:border-primary-fixed-dim hover:bg-primary/10 dark:hover:bg-primary-fixed-dim/10 focus-visible:bg-primary/10 dark:focus-visible:bg-primary-fixed-dim/10"
      });
    }
    dropdownItems.push({
      id: "my-profile",
      type: "link",
      to: "/profile",
      label: "My Profile",
      icon: "person",
      className: "text-on-surface hover:bg-surface-container dark:hover:bg-surface-container-high focus-visible:bg-surface-container dark:focus-visible:bg-surface-container-high font-medium"
    });
    dropdownItems.push({
      id: "order-history",
      type: "link",
      to: "/orders",
      label: "Order History",
      icon: "history",
      className: "text-on-surface hover:bg-surface-container dark:hover:bg-surface-container-high focus-visible:bg-surface-container dark:focus-visible:bg-surface-container-high font-medium"
    });
    dropdownItems.push({
      id: "my-wishlist",
      type: "link",
      to: "/wishlist",
      label: "My Wishlist",
      icon: "favorite",
      className: "text-on-surface hover:bg-surface-container dark:hover:bg-surface-container-high focus-visible:bg-surface-container dark:focus-visible:bg-surface-container-high font-medium"
    });
    dropdownItems.push({
      id: "logout",
      type: "button",
      onClick: handleLogout,
      label: "Logout",
      icon: "logout",
      className: "text-error hover:bg-error-container/10 focus-visible:bg-error-container/10 font-medium"
    });
  }

  // Focus the item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRefs.current[focusedIndex]) {
      menuItemsRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Reset focus index when dropdown closes
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
      const buttonEl = document.getElementById("profile-menu-button");
      if (buttonEl) buttonEl.focus();
    }
  };

  return (
    <nav className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline/30 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-margin-desktop py-md max-w-max-width mx-auto gap-lg">
        {/* Brand Logo */}
        <div className="flex items-center gap-xl">
          <Link 
            to="/" 
            className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight active:scale-95 transition-transform min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-lg px-2"
          >
            MediShop
          </Link>
          {/* Desktop Links */}
          <div className="hidden md:flex gap-lg">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `relative font-label-md text-label-md transition-colors duration-200 px-3 min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-lg ${
                  isActive
                    ? "text-primary dark:text-primary-fixed-dim font-bold"
                    : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `relative font-label-md text-label-md transition-colors duration-200 px-3 min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-lg ${
                  isActive
                    ? "text-primary dark:text-primary-fixed-dim font-bold"
                    : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `relative font-label-md text-label-md transition-colors duration-200 px-3 min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-lg ${
                  isActive
                    ? "text-primary dark:text-primary-fixed-dim font-bold"
                    : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
                }`
              }
            >
              Contact
            </NavLink>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-[400px] relative items-center">
          <span className="absolute left-md material-symbols-outlined text-outline">search</span>
          <input
            type="text"
            placeholder="Search pharmacy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-2 bg-surface-container dark:bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-fixed-dim focus:outline-none font-body-sm text-body-sm text-on-surface"
          />
        </form>

        {/* Actions (Cart, Auth) */}
        <div className="flex items-center gap-md">
          {/* Cart Button */}
          <Link
            to="/cart"
            aria-label={`Shopping Cart, ${cartCount} items`}
            className="relative hover:bg-surface-container dark:hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none w-11 h-11 rounded-full flex items-center justify-center hover:scale-105 text-on-surface-variant dark:text-surface-variant transition-all duration-200"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <div className="flex items-center gap-sm">
                <button
                  id="profile-menu-button"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                  aria-controls="profile-menu"
                  aria-label="User profile menu"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  onKeyDown={handleKeyDown}
                  className="flex items-center gap-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-lg p-1 min-h-[44px]"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-container dark:bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim w-full h-full flex items-center justify-center text-[22px]">
                      account_circle
                    </span>
                  </div>
                  <span className="hidden lg:inline text-body-sm font-medium text-on-surface">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    {profileDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label="User Profile Menu"
                    onKeyDown={handleKeyDown}
                    className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg shadow-xl py-2 z-50 animate-[slide-up_0.15s_ease-out]"
                  >
                    <div className="px-md py-sm border-b border-outline-variant dark:border-outline mb-1">
                      <p className="text-label-md font-bold text-on-surface truncate">{user.name}</p>
                      <p className="text-body-sm text-on-surface-variant truncate">{user.email}</p>
                    </div>

                    {dropdownItems.map((item, index) => {
                      const isLink = item.type === "link";
                      const Comp = isLink ? Link : "button";
                      const compProps = isLink
                        ? { to: item.to }
                        : { onClick: item.onClick, type: "button" };

                      return (
                        <React.Fragment key={item.id}>
                          {isAdmin && item.id === "my-profile" && (
                            <hr className="border-outline-variant dark:border-outline my-1" />
                          )}
                          {item.id === "logout" && (
                            <hr className="border-outline-variant dark:border-outline my-1" />
                          )}
                          <Comp
                            ref={(el) => (menuItemsRefs.current[index] = el)}
                            role="menuitem"
                            {...compProps}
                            className={`flex items-center gap-xs px-md py-3 min-h-[44px] text-body-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset outline-none cursor-pointer w-full text-left ${item.className}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                          </Comp>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-on-primary px-lg py-sm min-h-[44px] flex items-center justify-center rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container hover:-translate-y-0.5 transition-all active:scale-95 inline-flex focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
            aria-label="Toggle Mobile Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline px-margin-desktop py-lg space-y-md animate-[slide-down_0.25s_ease-out]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <span className="absolute left-md material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              placeholder="Search pharmacy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-xl pr-md py-2 bg-surface-container dark:bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-body-sm text-body-sm text-on-surface"
            />
          </form>
          <div className="flex flex-col gap-sm">
            <Link
              to="/products"
              className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
            >
              Shop All Products
            </Link>
            <Link
              to="/about"
              className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
            >
              Contact Us
            </Link>
            {user && (
              <>
                <Link
                  to="/profile"
                  className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
                >
                  Order History
                </Link>
                <Link
                  to="/wishlist"
                  className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block"
                >
                  My Wishlist
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-primary dark:text-primary-fixed-dim hover:bg-surface-container focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-lg block font-bold"
                  >
                    Go to Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-md py-3 min-h-[44px] flex items-center font-label-md text-label-md text-error hover:bg-error-container/10 focus-visible:bg-error-container/10 outline-none rounded-lg block"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
