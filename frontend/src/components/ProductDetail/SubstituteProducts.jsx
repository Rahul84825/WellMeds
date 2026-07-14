import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const SubstituteProducts = ({ substituteProducts = [], product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalContainerRef = useRef(null);
  const viewAllBtnRef = useRef(null);

  // Focus trap & accessibility inside modal
  useEffect(() => {
    if (!isModalOpen) return;

    // Set body scroll hidden when modal is open
    document.body.style.overflow = "hidden";

    const focusableElements = modalContainerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements?.length - 1];

    // Focus the first element (usually close button)
    firstElement?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus to trigger button
      viewAllBtnRef.current?.focus();
    };
  }, [isModalOpen]);

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const hasSubstitutes = substituteProducts && substituteProducts.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-sm lg:p-md rounded-2xl shadow-xs select-none w-full flex flex-col gap-sm">
      <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-150 uppercase tracking-wider flex items-center gap-xs">
        Substitute Products
      </h3>
      
      {!hasSubstitutes ? (
        <div className="text-center py-6 text-sm text-slate-400 dark:text-zinc-500 font-medium">
          No substitute products available.
        </div>
      ) : (
        <>
          {/* Sidebar List (Display first 3 substitutes) */}
          <div className="flex flex-col gap-xs w-full">
            {substituteProducts.slice(0, 3).map((item) => {
              const itemDisc = item.originalPrice && item.originalPrice > item.price
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;

              return (
                <Link
                  key={item.slug || item._id}
                  to={`/products/${item.slug}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="flex flex-col justify-center px-sm lg:px-md py-xs lg:py-sm rounded-xl transition-all duration-150 border border-slate-105 dark:border-zinc-850 hover:bg-[#038076]/[0.05] dark:hover:bg-[#038076]/[0.03] hover:border-[#038076] dark:hover:border-[#038076]/70 cursor-pointer w-full shrink-0 h-[76px] lg:h-[80px]"
                >
                  {/* Product Name */}
                  <h4 className="font-semibold text-sm lg:text-[18px] text-slate-855 dark:text-zinc-200 line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  
                  {/* Price section */}
                  <div className="flex items-baseline gap-xs mt-1 flex-wrap leading-none">
                    <span className="font-bold text-sm lg:text-base text-slate-800 dark:text-zinc-200">
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <>
                        <span className="text-[11px] lg:text-sm text-slate-400 line-through">
                          MRP {formatCurrency(item.originalPrice)}
                        </span>
                        <span className="text-[11px] lg:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {itemDisc}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <button
            ref={viewAllBtnRef}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-full h-9 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#004782] to-[#038076] hover:opacity-90 transition-all active:scale-[0.98] mt-xs cursor-pointer shadow-sm shadow-[#038076]/10"
          >
            View All →
          </button>
        </>
      )}

      {/* Centered Portal Modal with backdrop blur */}
      {isModalOpen && createPortal(
        <div 
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-hidden={!isModalOpen}
          className="fixed inset-0 w-screen h-screen bg-[#0f172a]/45 backdrop-blur-[8px] -webkit-backdrop-blur-[8px] z-[9999] flex items-center justify-center p-md cursor-zoom-out select-none transition-all duration-200 opacity-100"
        >
          {/* Modal Container */}
          <div 
            ref={modalContainerRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-zinc-900 w-full max-w-[95%] sm:max-w-[90%] md:max-w-[760px] rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-lg z-10 flex flex-col max-h-[85vh] cursor-default select-none transition-all duration-200 transform scale-100 opacity-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-md mb-md">
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-zinc-150 uppercase tracking-wider">
                Substitute Products
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close substitutes modal"
                className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-650 cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#038076]/30"
              >
                <X size={22} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 divide-y divide-slate-100 dark:divide-zinc-800/80">
              {substituteProducts.map((item) => {
                const itemDisc = item.originalPrice && item.originalPrice > item.price
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    key={item.slug || item._id}
                    to={`/products/${item.slug}`}
                    onClick={() => {
                      setIsModalOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center justify-between py-md px-md transition-all duration-150 hover:bg-[#038076]/[0.05] dark:hover:bg-[#038076]/[0.03] cursor-pointer text-left w-full gap-md select-none rounded-xl border border-transparent hover:border-[#038076]/20 focus:outline-none focus:bg-[#038076]/[0.05]"
                  >
                    {/* Name & Manufacturer */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-855 dark:text-zinc-205 truncate">
                        {item.name}
                      </h4>
                      {item.manufacturer && (
                        <p className="text-xs text-slate-455 dark:text-zinc-500 mt-[2px] font-medium">
                          {item.manufacturer}
                        </p>
                      )}
                    </div>

                    {/* Pricing Info */}
                    <div className="flex items-center gap-sm shrink-0">
                      <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-zinc-200">
                        {formatCurrency(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {itemDisc}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubstituteProducts;
