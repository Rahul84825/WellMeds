import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/useCart";

/**
 * ProductDetailMobileHeader
 * Mobile-only top header for Product Detail pages.
 * Features an enlarged header card with larger action icons (arrow, search, cart).
 * Hidden on tablet/desktop (md:hidden).
 */
const ProductDetailMobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="md:hidden sticky top-0 z-[100] w-full bg-white dark:bg-zinc-950 shadow-sm border-b border-slate-100 dark:border-zinc-800/80">
      {/* ── ENLARGED TOP BAR: Back Arrow | Title | Search | Cart ── */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between gap-3">
        {/* Left: Back Arrow + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 text-slate-900 dark:text-zinc-100 hover:text-slate-600 dark:hover:text-white active:scale-95 transition-transform cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-[26px] h-[26px] stroke-[2.4]" />
          </button>
          <span className="font-bold text-[19px] sm:text-[20px] text-slate-900 dark:text-white tracking-tight truncate">
            Item details
          </span>
        </div>

        {/* Right: Search + Cart Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search Button */}
          <button
            type="button"
            onClick={() => navigate("/search", { state: { from: location.pathname } })}
            className="p-2 text-[#038076] dark:text-emerald-400 hover:text-[#02665e] dark:hover:text-emerald-300 active:scale-95 transition-transform cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center"
            aria-label="Search items"
          >
            <Search className="w-[25px] h-[25px] stroke-[2.3]" />
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative p-2 text-[#038076] dark:text-emerald-400 hover:text-[#02665e] dark:hover:text-emerald-300 active:scale-95 transition-transform rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-[25px] h-[25px] stroke-[2.3]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#038076] text-white text-[11px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-zinc-900">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailMobileHeader;
