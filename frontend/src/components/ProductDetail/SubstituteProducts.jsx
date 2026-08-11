import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { X, ArrowRight } from "lucide-react";

const parsePackQuantity = (prod) => {
  if (!prod) return 1;
  const pack = prod.packSize || prod.productSpecifications?.packSize || "";
  const match = pack.match(/(\d+(\.\d+)?)/);
  const qty = match ? parseFloat(match[1]) : 1;
  return qty > 0 ? qty : 1;
};

const calculateUnitPrice = (prod) => {
  if (!prod) return 0;
  const qty = parsePackQuantity(prod);
  return prod.price > 0 ? prod.price / qty : 0;
};

const getSubstituteComparison = (item, baseProduct) => {
  if (!baseProduct || !item) {
    return { diffPercent: 0, isCostlier: false, isCheaper: false, comparisonLabel: "Same price", dosageForm: "Unit" };
  }

  const baseUnit = calculateUnitPrice(baseProduct);
  const itemUnit = calculateUnitPrice(item);

  const basePrice = baseUnit > 0 ? baseUnit : baseProduct.price;
  const itemPrice = itemUnit > 0 ? itemUnit : item.price;

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

  const dosageForm = item.productSpecifications?.dosageForm || item.productSpecifications?.packSize || item.packSize || "Unit";

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
      return compA - compB;
    });
  }, [substituteProducts, product]);

  const hasSubstitutes = sortedSubstitutes && sortedSubstitutes.length > 0;
  const cardSubstitutes = sortedSubstitutes.slice(0, 3);

  return (
    <div className="pdp-paper-card p-4 rounded-xl select-none w-full flex flex-col text-left font-sans">
      <h3 className="pdp-serif-title text-sm font-bold text-[#172b26] pb-2 pdp-dashed-line mb-2 flex items-center justify-between">
        <span>Alternative Substitutes</span>
        {hasSubstitutes && (
          <span className="text-[11px] font-semibold text-[#157a6d] bg-[#e6f4f0] px-2 py-0.5 rounded-full">
            {sortedSubstitutes.length} available
          </span>
        )}
      </h3>

      {!hasSubstitutes ? (
        <div className="text-center py-4 px-2 text-xs text-[#5f776e] font-medium leading-relaxed bg-[#f8faf9] rounded-lg border border-[#e2ece8] my-1">
          No clinically equivalent substitutes available. Please consult your doctor or pharmacist.
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-[#dde8e3]">
            {cardSubstitutes.map((item, idx) => {
              const { diffPercent, isCostlier, comparisonLabel, dosageForm } = getSubstituteComparison(item, product);

              return (
                <Link
                  key={item.slug || item._id || idx}
                  to={`/products/${item.slug}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="py-3 first:pt-0 flex items-start justify-between gap-3 hover:bg-[#f0f8f5] px-1.5 rounded-lg transition-all cursor-pointer min-w-0"
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="pdp-serif-title font-bold text-xs text-[#172b26] truncate leading-snug" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-[#5f776e] font-bold uppercase mt-0.5 truncate">
                      {item.manufacturer || item.brand || "WellMeds"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <p className="text-xs font-semibold text-[#172b26]">
                      ₹ {item.price ? item.price.toFixed(2) : "0.00"}
                    </p>
                    <p className={`text-[11px] font-bold mt-0.5 ${diffPercent === 0
                      ? "text-[#5f776e]"
                      : isCostlier
                        ? "text-red-600"
                        : "text-[#157a6d]"
                      }`}>
                      {comparisonLabel}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {sortedSubstitutes.length > 3 && (
            <div className="pt-3 pb-0.5">
              <button
                ref={viewAllBtnRef}
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-sans font-bold uppercase tracking-widest text-[#157a6d] hover:bg-[#157a6d] hover:text-white border border-[#157a6d] bg-white rounded-md transition-all cursor-pointer shadow-2xs"
              >
                VIEW ALL ({sortedSubstitutes.length}) <ArrowRight size={12} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Centered Modal — Displays ALL valid substitutes without truncation */}
      {isModalOpen && createPortal(
        <div
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans"
        >
          <div
            ref={modalContainerRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[92vw] max-w-[540px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] cursor-default bg-white dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 text-left z-[100000]"
          >
            <div className="p-4 bg-[#f0f8f5] dark:bg-zinc-800/90 border-b border-[#dde8e3] dark:border-zinc-700 flex justify-between items-center text-left">
              <div>
                <h3 className="pdp-serif-title text-base font-bold text-[#157a6d] dark:text-[#84d6b9]">
                  Available Substitutes ({sortedSubstitutes.length})
                </h3>
                <p className="text-[11px] text-[#5f776e] dark:text-zinc-400 mt-0.5">
                  Clinically equivalent medicines with matching molecule, strength & dosage form
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close substitutes modal"
                className="p-1.5 text-[#5f776e] hover:text-[#172b26] dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-white/80 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 overflow-y-auto custom-scrollbar divide-y divide-[#dde8e3] dark:divide-zinc-800 text-left">
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
                    className="py-3 first:pt-0 flex items-start justify-between gap-3 hover:bg-[#f0f8f5] dark:hover:bg-zinc-800/50 px-2 rounded-lg transition-all cursor-pointer min-w-0"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="pdp-serif-title font-bold text-sm text-[#172b26] dark:text-zinc-100 truncate leading-snug" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[#5f776e] dark:text-zinc-400 font-bold uppercase mt-0.5 truncate">
                        {item.manufacturer || item.brand || "WellMeds"} • {item.packSize || dosageForm}
                      </p>
                    </div>
                    <div className="text-right shrink-0 whitespace-nowrap">
                      <p className="text-xs font-semibold text-[#172b26] dark:text-zinc-200">
                        ₹ {item.price ? item.price.toFixed(2) : "0.00"}
                      </p>
                      <p className={`text-[11px] font-bold mt-0.5 ${diffPercent === 0
                        ? "text-[#5f776e] dark:text-zinc-400"
                        : isCostlier
                          ? "text-red-600 dark:text-red-400"
                          : "text-[#157a6d] dark:text-[#84d6b9]"
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
