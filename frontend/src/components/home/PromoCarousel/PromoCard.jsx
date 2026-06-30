import React from "react";
import { formatCurrency } from "../../../utils/currency";

const PromoCard = ({ medicine }) => {
  return (
    <div className="bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-zinc-800/80 p-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-[180px] w-full text-left">
      <div className="flex gap-md">
        <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800/80 shrink-0">
          <img
            src={medicine.image}
            alt={medicine.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-xs min-w-0 flex-1">
          <span className="inline-block bg-[#004782]/5 text-[#004782] dark:bg-[#a4c9ff]/10 dark:text-[#a4c9ff] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            {medicine.brand}
          </span>
          <h4 className="font-extrabold text-slate-800 dark:text-zinc-100 text-xs sm:text-sm truncate">
            {medicine.name}
          </h4>
          <p className="text-[10px] text-slate-450 dark:text-zinc-400 truncate font-mono">
            {medicine.salt}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end pt-xs border-t border-slate-100 dark:border-zinc-800/60 mt-xs">
        <div>
          <span className="text-xs text-slate-450 line-through block">
            {formatCurrency(medicine.originalPrice)}
          </span>
          <span className="text-sm font-black text-slate-800 dark:text-zinc-100">
            {formatCurrency(medicine.price)}
          </span>
        </div>

        <div className="flex flex-col gap-xs items-end">
          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {medicine.discount}
          </span>
          <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
            ● In Stock
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromoCard;
