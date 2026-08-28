import React, { useState, useRef, useEffect } from "react";
import { Package, Snowflake, Info, ChevronDown, Check } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { PACKAGING_OPTIONS, PRICING_CONFIG } from "../../constants/pricing";
import { formatCurrency } from "../../utils/currency";

// Custom Parcel Illustration Icons matching reference
const RegularParcelIcon = () => (
  <div className="relative w-8 h-8 shrink-0">
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-lg shadow-2xs">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#f59e0b" />
      <path d="M15 2 L25 2 L25 18 L20 14 L15 18 Z" fill="#78350f" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2563eb] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-2xs">
      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#2563eb" />
        <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" />
      </svg>
    </div>
  </div>
);

const ColdParcelIcon = () => (
  <div className="relative w-8 h-8 shrink-0">
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-lg shadow-2xs">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#38bdf8" />
      <path d="M15 2 L25 2 L25 16 L20 12 L15 16 Z" fill="#78350f" />
      <g stroke="white" strokeWidth="2" strokeLinecap="round">
        <line x1="20" y1="18" x2="20" y2="34" />
        <line x1="12" y1="26" x2="28" y2="26" />
        <line x1="14" y1="20" x2="26" y2="32" />
        <line x1="14" y1="32" x2="26" y2="20" />
      </g>
    </svg>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2563eb] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-2xs">
      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#2563eb" />
        <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" />
      </svg>
    </div>
  </div>
);

export const PackagingSelector = ({ compact = false, inline = false }) => {
  const { packagingType, setPackagingType, packagingOption } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const dropdownRef = useRef(null);
  const infoRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    setPackagingType(type);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* ── Summary Row / Dropdown Trigger ── */}
      <div className="flex items-center justify-between gap-1.5 text-xs sm:text-sm">
        {/* Left Label with Hover Tooltip Popover */}
        <div 
          ref={infoRef}
          className="relative inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300 select-none shrink-0"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <span className="font-medium whitespace-nowrap">Handling & Packaging:</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
            className="text-slate-400 hover:text-[#157a6d] dark:hover:text-emerald-400 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer inline-flex items-center justify-center shrink-0"
            title="Packaging details"
            aria-label="Packaging details"
          >
            <Info size={14} />
          </button>

          {/* ── Hover Popover (with Caret Arrow) ── */}
          {showInfo && (
            <div 
              className="absolute bottom-full left-0 mb-3 z-50 w-72 sm:w-80 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/90 rounded-2xl p-4 shadow-xl text-left animate-[fade-in_0.15s_ease-out] pointer-events-auto"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium mb-3.5 leading-snug">
                Basic fee to ensure quality and secure packaging
              </p>

              <div className="space-y-3">
                {/* Regular Packaging Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RegularParcelIcon />
                    <span className="font-medium text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
                      Regular Packaging
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
                      ₹{PRICING_CONFIG.PACKAGING.regular.price}
                    </span>
                  </div>
                </div>

                {/* Cold Packaging Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ColdParcelIcon />
                    <span className="font-medium text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
                      Cold Packaging
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
                      ₹{PRICING_CONFIG.PACKAGING.cold.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caret / Arrow pointing down to the (i) info icon */}
              <div className="absolute -bottom-1.5 left-[155px] w-3 h-3 bg-white dark:bg-zinc-900 border-r border-b border-slate-200/90 dark:border-zinc-700/90 transform rotate-45" />
            </div>
          )}
        </div>

        {/* Clickable selector trigger showing current selection */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-[#f4f9f7] hover:bg-[#e8f4f0] dark:bg-zinc-800 dark:hover:bg-zinc-750 px-2.5 py-1 rounded-lg border border-[#157a6d]/20 dark:border-zinc-700 transition-all cursor-pointer group select-none text-left"
        >
          <div className="flex items-center gap-1.5">
            {packagingType === "cold" ? (
              <Snowflake size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
            ) : (
              <Package size={13} className="text-[#157a6d] dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
              {packagingOption.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-1">
            <span className="font-bold text-[#157a6d] dark:text-emerald-400 text-xs">
              ₹{packagingOption.price}
            </span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#157a6d]" : "group-hover:text-slate-600"
              }`}
            />
          </div>
        </button>
      </div>

      {/* ── Dropdown / Popover Options List ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-3 shadow-2xl space-y-2 animate-[fade-in_0.2s_ease-out]">
          <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 font-medium px-1 leading-snug">
            Basic fee to ensure quality and secure packaging
          </p>

          <div className="space-y-1.5 pt-1">
            {PACKAGING_OPTIONS.map((option) => {
              const isSelected = packagingType === option.type;
              const isCold = option.type === "cold";

              return (
                <div
                  key={option.type}
                  onClick={() => handleSelect(option.type)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-[#157a6d] bg-[#f4f9f7] dark:bg-[#157a6d]/10 dark:border-emerald-500/50 shadow-xs"
                      : "border-slate-150 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCold ? <ColdParcelIcon /> : <RegularParcelIcon />}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 dark:text-zinc-100">
                          {option.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#157a6d] dark:bg-emerald-400 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[140px] sm:max-w-[160px]">
                        {isCold ? "Insulated + ice gel packs" : "Standard clinical box"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-bold text-sm text-[#157a6d] dark:text-emerald-400 block">
                      ₹{option.price}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "border-[#157a6d] bg-[#157a6d] text-white dark:border-emerald-500 dark:bg-emerald-500"
                          : "border-slate-300 dark:border-zinc-700"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagingSelector;
