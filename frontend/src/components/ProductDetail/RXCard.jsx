import React from "react";
import { FileText } from "lucide-react";

const RXCard = ({ requiresRx }) => {
  if (!requiresRx) return null;
  return (
    <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-md space-y-xs text-left select-none">
      <div className="flex items-center gap-sm">
        <FileText size={20} className="text-red-500 shrink-0" />
        <h4 className="font-extrabold text-[15px] text-red-650 dark:text-red-400 uppercase tracking-wider">Prescription Verification Required</h4>
      </div>
      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-normal pl-6">
        A registered pharmacist will verify your prescription before this item is shipped. You can upload your prescription during checkout.
      </p>
    </div>
  );
};

export default RXCard;
