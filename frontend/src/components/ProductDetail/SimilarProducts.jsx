import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

const SimilarProducts = ({ similarProducts, product }) => {
  if (!similarProducts || similarProducts.length === 0) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-sm lg:p-md rounded-2xl shadow-xs select-none w-full">
      <div 
        className="flex flex-row lg:flex-col gap-sm lg:gap-md overflow-x-auto lg:overflow-x-visible pb-sm lg:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {similarProducts.slice(0, 4).map((item) => {
          const itemDisc = item.originalPrice && item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0;
          return (
            <Link
              key={item.slug || item._id}
              to={`/products/${item.slug}`}
              className="flex items-center gap-md p-sm lg:p-md rounded-xl lg:rounded-2xl transition-all duration-150 border border-transparent hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 hover:border-[#038076] dark:hover:border-[#038076] cursor-pointer w-[80vw] sm:w-[280px] lg:w-full shrink-0 lg:shrink snap-start bg-slate-50/[0.15] dark:bg-zinc-950/20 lg:bg-transparent lg:dark:bg-transparent"
            >
              {/* Product Image: size ≈64px (w-16 h-16) */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-1">
                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>
              
              {/* Text content */}
              <div className="flex-1 min-w-0 flex flex-col text-left leading-[1.4]">
                {(item.manufacturer || item.brand) && (
                  <p className="text-[13px] font-medium text-[#004782]/80 dark:text-[#a4c9ff]/80 truncate">
                    {item.manufacturer || item.brand}
                  </p>
                )}
                
                <h4 className="font-bold text-[17px] text-slate-850 dark:text-zinc-200 line-clamp-1 leading-[1.4] mt-[2px]">
                  {item.name}
                </h4>
                
                <div className="flex items-baseline gap-sm mt-[8px] flex-wrap">
                  <span className="font-bold text-[17px] text-slate-800 dark:text-zinc-200 leading-none">
                    {formatCurrency(item.price)}
                  </span>
                  {itemDisc > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {itemDisc}% Off
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarProducts;
