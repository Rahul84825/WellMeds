import React from "react";

const ColdChainCard = ({ isColdChain }) => {
  if (!isColdChain) return null;
  return (
    <div className="bg-sky-500/[0.03] border border-sky-500/10 rounded-2xl p-md space-y-xs text-left select-none">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-sky-600 text-[18px] leading-none shrink-0 animate-pulse">ac_unit</span>
        <h4 className="font-extrabold text-[11px] text-sky-750 dark:text-sky-400 uppercase tracking-wider">Temperature Controlled Storage</h4>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal pl-6">
        This medicine requires cold storage (2°C - 8°C). We ship it in insulated cold-pack containers to guarantee vaccine & medication potency.
      </p>
    </div>
  );
};

export default ColdChainCard;
