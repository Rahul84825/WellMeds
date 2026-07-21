import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const calculateUnitPrice = (prod) => {
  if (!prod) return 0;
  const pack = prod.packSize || prod.productSpecifications?.packSize || "";
  const match = pack.match(/(\d+(\.\d+)?)/);
  const qty = match ? parseFloat(match[1]) : 1;
  return qty > 0 ? (prod.price / qty) : prod.price;
};

const getSubstituteComparison = (item, baseProduct) => {
  if (!baseProduct || !item) {
    return { diffPercent: 0, isCostlier: false, isCheaper: false, comparisonLabel: "Same price", dosageForm: "Unit" };
  }

  const baseUnit = calculateUnitPrice(baseProduct);
  const itemUnit = calculateUnitPrice(item);

  const hasUnitCalc = baseUnit > 0 && itemUnit > 0 && (baseProduct.packSize || item.packSize);
  const basePrice = hasUnitCalc ? baseUnit : baseProduct.price;
  const itemPrice = hasUnitCalc ? itemUnit : item.price;

  const diffPercent = basePrice > 0 
    ? Math.round(((itemPrice - basePrice) / basePrice) * 100) 
    : 0;

  const isCostlier = diffPercent > 0;
  const isCheaper = diffPercent < 0;

  const comparisonLabel = diffPercent === 0 
    ? "Same price" 
    : isCostlier 
      ? `${diffPercent}% costlier` 
      : `${Math.abs(diffPercent)}% cheaper`;

  const dosageForm = item.productSpecifications?.dosageForm || item.productSpecifications?.packSize || item.packSize || "Injection";

  return {
    diffPercent,
    isCostlier,
    isCheaper,
    comparisonLabel,
    dosageForm,
  };
};

const SubstituteProducts = ({ substituteProducts = [], product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalContainerRef = useRef(null);
  const viewAllBtnRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;

    document.body.style.overflow = "hidden";

    const focusableElements = modalContainerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements?.length - 1];

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
      viewAllBtnRef.current?.focus();
    };
  }, [isModalOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const sortedSubstitutes = useMemo(() => {
    if (!substituteProducts || substituteProducts.length === 0) return [];
    return [...substituteProducts].sort((a, b) => {
      const compA = getSubstituteComparison(a, product).diffPercent;
      const compB = getSubstituteComparison(b, product).diffPercent;
      return compA - compB; // Cheaper substitutes (-20%) before costlier (+5%)
    });
  }, [substituteProducts, product]);

  const hasSubstitutes = sortedSubstitutes && sortedSubstitutes.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm select-none w-full flex flex-col text-left">
      {!hasSubstitutes ? (
        <div className="text-center py-4 text-xs text-slate-400 font-medium">
          No substitute products available.
        </div>
      ) : (
        <>
          {/* Display ONLY 2 items */}
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/80">
            {sortedSubstitutes.slice(0, 2).map((item, idx) => {
              const { diffPercent, isCostlier, comparisonLabel, dosageForm } = getSubstituteComparison(item, product);

              return (
                <Link
                  key={item.slug || item._id || idx}
                  to={`/products/${item.slug}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="py-3.5 first:pt-0 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 px-1 rounded-xl transition-all cursor-pointer min-w-0"
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 truncate leading-snug" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase mt-0.5 truncate">
                      {item.manufacturer || item.brand || "WellMeds"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-300">
                      ₹ {item.price ? item.price.toFixed(2) : "0.00"}/{dosageForm}
                    </p>
                    <p className={`text-[11px] font-bold mt-0.5 ${
                      diffPercent === 0 
                        ? "text-slate-500" 
                        : isCostlier 
                          ? "text-red-500" 
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {comparisonLabel}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button if substituteProducts.length > 2 */}
          {sortedSubstitutes.length > 2 && (
            <button
              ref={viewAllBtnRef}
              onClick={() => setIsModalOpen(true)}
              className="mt-3 w-full bg-[#3f257a] hover:bg-[#321c62] text-white py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 border-2 border-[#2563eb] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              View All <span className="text-sm">→</span>
            </button>
          )}
        </>
      )}

      {/* Centered / Bottom Sheet Portal Modal */}
      {isModalOpen && createPortal(
        <div 
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-[fade-in_0.2s_ease-out]"
        >
          <div 
            ref={modalContainerRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 w-full sm:w-[92vw] max-w-[500px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 animate-[slide-up_0.25s_ease-out] flex flex-col max-h-[85vh] cursor-default"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center text-left">
              <h3 className="font-extrabold text-lg text-[#3f257a] dark:text-[#a4c9ff]">
                Available Substitutes
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close substitutes modal"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* List of All Substitutes */}
            <div className="p-5 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-zinc-800 text-left">
              {sortedSubstitutes.map((item, idx) => {
                const { diffPercent, isCostlier, comparisonLabel, dosageForm } = getSubstituteComparison(item, product);

                return (
                  <Link
                    key={item.slug || item._id || idx}
                    to={`/products/${item.slug}`}
                    onClick={() => {
                      setIsModalOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className="py-3.5 first:pt-0 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 px-1 rounded-xl transition-all cursor-pointer min-w-0"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 truncate leading-snug" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase mt-0.5 truncate">
                        {item.manufacturer || item.brand || "WellMeds"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-300">
                        ₹ {item.price ? item.price.toFixed(2) : "0.00"}/{dosageForm}
                      </p>
                      <p className={`text-[11px] font-bold mt-0.5 ${
                        diffPercent === 0 
                          ? "text-slate-500" 
                          : isCostlier 
                            ? "text-red-500" 
                            : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {comparisonLabel}
                      </p>
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
