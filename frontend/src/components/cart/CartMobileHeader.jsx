import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

/**
 * CartMobileHeader
 * Dedicated mobile-only header bar matching native app / dedicated page experience.
 * Hidden on tablet/desktop (md:hidden).
 */
const CartMobileHeader = ({ title = "Your Cart", showAddItem = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800/80 px-4 h-14 flex items-center justify-between shadow-2xs">
      {/* Left: Back Arrow + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="p-1 -ml-1 text-slate-800 dark:text-zinc-200 hover:text-slate-600 active:scale-95 transition-transform cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
        <span className="font-bold text-[18px] text-slate-900 dark:text-white tracking-tight">
          {title}
        </span>
      </div>

      {/* Right: + Add Item pill button */}
      {showAddItem && (
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#038076] dark:text-emerald-400 bg-[#eef8f6] dark:bg-emerald-950/50 hover:bg-[#e0f3f0] dark:hover:bg-emerald-900/50 px-3.5 py-1.5 rounded-full border border-[#c6eae3] dark:border-emerald-800/60 transition-all active:scale-95 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Item</span>
        </Link>
      )}
    </header>
  );
};

export default CartMobileHeader;
