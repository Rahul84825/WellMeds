import React, { useMemo } from "react";
import { Filter, RotateCcw, Check, X, Shield, DollarSign, Building2, Zap, SlidersHorizontal } from "lucide-react";

const SearchFilterPanel = ({
  products = [],
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  isOpen = false,
  onClose = () => {},
}) => {
  // Extract dynamic options from the search results set
  const dynamicOptions = useMemo(() => {
    const manufacturers = new Set();
    const strengths = new Set();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach((p) => {
      if (p.manufacturer || p.brand) {
        manufacturers.add(p.manufacturer || p.brand);
      }
      if (p.strength) {
        strengths.add(p.strength);
      }
      const price = Number(p.price || 0);
      if (price > 0) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }
    });

    return {
      manufacturers: Array.from(manufacturers).sort(),
      strengths: Array.from(strengths).sort(),
      minPrice: minPrice === Infinity ? 0 : Math.floor(minPrice),
      maxPrice: maxPrice === -Infinity ? 10000 : Math.ceil(maxPrice),
    };
  }, [products]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.availability && filters.availability !== "all") count++;
    if (filters.rxOnly) count++;
    if (filters.manufacturer && filters.manufacturer.length > 0) count += filters.manufacturer.length;
    if (filters.strength && filters.strength.length > 0) count += filters.strength.length;
    if (filters.maxPrice && filters.maxPrice < dynamicOptions.maxPrice) count++;
    return count;
  }, [filters, dynamicOptions]);

  const toggleArrayFilter = (key, value) => {
    const currentList = filters[key] || [];
    const updated = currentList.includes(value)
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const FilterContent = (
    <div className="space-y-6 text-left">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#038076] dark:text-[#84d6b9]" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
            Filters
          </h3>
          {activeCount > 0 && (
            <span className="bg-[#038076] text-white font-bold text-xs px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-[#038076] dark:text-[#52d6c9] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* 1. Availability Filter */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Zap size={13} className="text-[#038076]" /> Availability
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                availability: filters.availability === "inStock" ? "all" : "inStock",
              })
            }
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filters.availability === "inStock"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
            }`}
          >
            {filters.availability === "inStock" && <Check size={14} />}
            <span>In Stock</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                availability: filters.availability === "outOfStock" ? "all" : "outOfStock",
              })
            }
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filters.availability === "outOfStock"
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300"
                : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
            }`}
          >
            {filters.availability === "outOfStock" && <Check size={14} />}
            <span>Out of Stock</span>
          </button>
        </div>
      </div>

      {/* 2. Rx Required Filter */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
        <label className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-purple-600 dark:text-purple-400" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                Rx Required Only
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Filter prescription medicines
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={!!filters.rxOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, rxOnly: e.target.checked })
            }
            className="w-4 h-4 text-[#038076] rounded border-slate-300 focus:ring-[#038076]"
          />
        </label>
      </div>

      {/* 3. Price Range Filter */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <DollarSign size={13} className="text-[#038076]" /> Max Price
          </h4>
          <span className="text-xs font-extrabold text-[#038076] dark:text-[#52d6c9]">
            ₹{filters.maxPrice || dynamicOptions.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={dynamicOptions.minPrice}
          max={dynamicOptions.maxPrice}
          value={filters.maxPrice || dynamicOptions.maxPrice}
          onChange={(e) =>
            onFilterChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#038076]"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
          <span>₹{dynamicOptions.minPrice}</span>
          <span>₹{dynamicOptions.maxPrice}</span>
        </div>
      </div>

      {/* 4. Manufacturer / Brand Filter */}
      {dynamicOptions.manufacturers.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Building2 size={13} className="text-[#038076]" /> Manufacturer / Brand
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {dynamicOptions.manufacturers.map((mfg) => {
              const checked = (filters.manufacturer || []).includes(mfg);
              return (
                <label
                  key={mfg}
                  className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter("manufacturer", mfg)}
                    className="w-4 h-4 text-[#038076] rounded border-slate-300 focus:ring-[#038076]"
                  />
                  <span className="truncate">{mfg}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Strength Filter */}
      {dynamicOptions.strengths.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-[#038076]" /> Strength
          </h4>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.strengths.map((str) => {
              const selected = (filters.strength || []).includes(str);
              return (
                <button
                  key={str}
                  type="button"
                  onClick={() => toggleArrayFilter("strength", str)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    selected
                      ? "bg-[#038076] text-white border-[#038076]"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                  }`}
                >
                  {str}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-64 shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm sticky top-24 self-start">
        {FilterContent}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-zinc-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-[slide-in-right_0.3s_ease-out]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-zinc-800">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              {FilterContent}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#038076] hover:bg-[#02665e] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all"
              >
                Apply Filters ({activeCount > 0 ? `${activeCount} Active` : "All"})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchFilterPanel;
