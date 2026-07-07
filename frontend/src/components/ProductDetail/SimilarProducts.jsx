import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

const SimilarProducts = ({ similarProducts, product }) => {
  if (!similarProducts || similarProducts.length === 0) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-xs select-none">
      <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-zinc-150 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800 mb-sm flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-[#038076]">science</span>
        Similar Medicines
      </h3>
      
      <div className="space-y-sm">
        {similarProducts.slice(0, 3).map((item) => {
          const itemDisc = item.originalPrice && item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0;
          return (
            <Link
              key={item.slug || item._id}
              to={`/products/${item.slug}`}
              className="flex gap-sm p-sm rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 transition-all border border-transparent hover:border-slate-100 dark:hover:border-zinc-850"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-0.5">
                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-left">
                <div className="space-y-0.5">
                  <p className="text-[8px] uppercase tracking-wider font-extrabold text-[#004782]/80 dark:text-[#a4c9ff]/80 truncate">
                    {item.manufacturer || item.brand}
                  </p>
                  <h4 className="font-extrabold text-[10px] text-slate-850 dark:text-zinc-200 line-clamp-1 leading-tight">
                    {item.name}
                  </h4>
                </div>
                <div className="flex items-baseline gap-xs flex-wrap">
                  <span className="font-black text-[11px] text-slate-800 dark:text-zinc-200">
                    {formatCurrency(item.price)}
                  </span>
                  {itemDisc > 0 && (
                    <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {itemDisc}% Off
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {product.molecules?.[0] && (
        <div className="mt-sm pt-xs border-t border-slate-100 dark:border-zinc-800">
          <Link
            to={`/molecule/${product.molecules[0].slug}`}
            className="text-[10px] font-black text-[#038076] dark:text-[#84d6b9] hover:underline flex items-center justify-center gap-xs"
          >
            <span>Compare Generic Mappings</span>
            <span className="material-symbols-outlined text-[11px] leading-none">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;
