import React from "react";
import { ShieldAlert, CheckCircle2, XCircle, Sparkles, Tag, TrendingDown } from "lucide-react";

export const RxBadge = ({ className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 text-[#02665e] dark:text-purple-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60 shadow-2xs select-none ${className}`}
    title="Prescription required by law for this medicine"
  >
    <span className="w-3.5 h-3.5 bg-[#02665e] text-white rounded-full flex items-center justify-center text-[9px] font-black leading-none">
      Rx
    </span>
    <span>Prescription Required</span>
  </span>
);

export const StockBadge = ({ inStock = true, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border shadow-2xs select-none ${
      inStock
        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
        : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
    } ${className}`}
  >
    {inStock ? (
      <>
        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
        <span>In Stock</span>
      </>
    ) : (
      <>
        <XCircle size={13} className="text-amber-600 dark:text-amber-400" />
        <span>Out of Stock</span>
      </>
    )}
  </span>
);

export const SavingsBadge = ({ discountPercent, amountSaved, className = "" }) => {
  if (!discountPercent || discountPercent <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/60 text-[#15803d] dark:text-emerald-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700/60 shadow-2xs ${className}`}
    >
      <Tag size={12} className="shrink-0" />
      <span>{discountPercent}% OFF</span>
      {amountSaved > 0 && <span className="opacity-90">• Save ₹{amountSaved}</span>}
    </span>
  );
};

export const BestValueBadge = ({ className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/60 shadow-2xs uppercase tracking-wider ${className}`}
  >
    <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
    <span>Best Value</span>
  </span>
);

export const ComparisonBadge = ({ type = "cheapest", className = "" }) => {
  if (type === "cheapest") {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider ${className}`}
      >
        <TrendingDown size={11} />
        <span>Cheapest Option</span>
      </span>
    );
  }

  if (type === "same-salt") {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] dark:bg-[#038076]/20 border border-[#038076]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs ${className}`}
      >
        <span>Same Salt</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-md ${className}`}
    >
      <span>Alternative</span>
    </span>
  );
};

export default {
  RxBadge,
  StockBadge,
  SavingsBadge,
  BestValueBadge,
  ComparisonBadge,
};
