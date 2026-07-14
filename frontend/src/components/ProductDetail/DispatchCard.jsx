import React from "react";

const DispatchCard = () => {
  return (
    <div className="bg-[#086b53]/[0.03] border border-[#086b53]/10 rounded-2xl p-md flex items-center gap-sm text-left shadow-2xs hover:shadow-xs transition-all select-none">
      <span className="material-symbols-outlined text-[#086b53] text-[26px] leading-none shrink-0">local_shipping</span>
      <div>
        <p className="text-[15px] font-black text-[#086b53] dark:text-[#84d6b9] uppercase tracking-wider">Guaranteed Dispatch</p>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">All orders are dispatched from WHO-GMP certified hubs within 12 hours.</p>
      </div>
    </div>
  );
};

export default DispatchCard;
