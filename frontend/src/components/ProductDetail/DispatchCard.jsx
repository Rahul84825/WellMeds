import React from "react";

const DispatchCard = () => {
  return (
    <div className="pdp-paper-card p-3.5 flex items-center gap-3 text-left font-sans select-none">
      <span className="material-symbols-outlined text-[#157a6d] text-[20px] leading-none shrink-0">local_shipping</span>
      <div>
        <p className="text-[11px] font-bold text-[#157a6d] uppercase tracking-wider">Guaranteed Dispatch</p>
        <p className="text-[11px] text-[#3f544d] mt-0.5 leading-snug">Dispatched from WHO-GMP certified licensed hubs within 12 hours.</p>
      </div>
    </div>
  );
};

export default DispatchCard;
