import React from "react";
import ColdChainInfoButton from "./ColdChainInfoButton";

const ColdChainCard = ({ isColdChain }) => {
  if (!isColdChain) return null;
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-1 text-left select-none font-sans">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-700 text-[18px] leading-none shrink-0">ac_unit</span>
          <h4 className="font-bold text-[11px] text-sky-900 uppercase tracking-wider">Cold Chain Temperature Controlled</h4>
        </div>
        <ColdChainInfoButton isColdChain={isColdChain} />
      </div>
      <p className="text-[11px] text-sky-800 leading-relaxed pl-6 font-medium">
        Requires 2°C - 8°C storage. Shipped in insulated temperature-controlled cold packs to preserve efficacy.
      </p>
    </div>
  );
};

export default ColdChainCard;
