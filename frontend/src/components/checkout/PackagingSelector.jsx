import React, { useState, useRef, useEffect } from "react";
import { Package, Snowflake, Info, ChevronDown, Check, ShieldCheck } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { PACKAGING_OPTIONS } from "../../constants/pricing";
import { formatCurrency } from "../../utils/currency";

export const PackagingSelector = ({ compact = false, inline = false }) => {
  const { packagingType, setPackagingType, packagingOption } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const dropdownRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
          <span className="font-medium">Handling & Packaging</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
            className="text-slate-400 hover:text-[#157a6d] dark:hover:text-emerald-400 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Packaging details"
            aria-label="Packaging details"
          >
            <Info size={14} />
          </button>
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
            <span className="line-through text-[11px] text-slate-400 dark:text-zinc-500">
              ₹{packagingOption.mrp}
            </span>
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

      {/* ── Info Tooltip Popover ── */}
      {showInfo && (
        <div className="absolute left-0 top-full mt-1.5 z-40 w-72 sm:w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5 shadow-xl text-xs space-y-2.5 animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
            <span className="font-bold text-[#172b26] dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#157a6d]" /> Packaging Options
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
            <p>
              <strong className="text-slate-800 dark:text-zinc-200">📦 Regular Packaging (₹19):</strong> Tamper-proof, sealed packaging meeting all clinical pharmacy standards.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-zinc-200">❄️ Cold Packaging (₹79):</strong> Temperature-controlled insulated box with ice packs for sensitive biologics, vaccines, and insulin.
            </p>
          </div>
        </div>
      )}

      {/* ── Dropdown / Popover Options List ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-2 shadow-2xl space-y-1.5 animate-[fade-in_0.2s_ease-out]">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Packaging Type
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Instant Update
            </span>
          </div>

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
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? isCold
                            ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                            : "bg-[#157a6d]/15 text-[#157a6d] dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isCold ? <Snowflake size={16} /> : <Package size={16} />}
                    </div>

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
                    <div className="text-right">
                      <span className="line-through text-[11px] text-slate-400 dark:text-zinc-500 block leading-tight">
                        ₹{option.mrp}
                      </span>
                      <span className="font-bold text-sm text-[#157a6d] dark:text-emerald-400 block leading-tight">
                        ₹{option.price}
                      </span>
                    </div>

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
