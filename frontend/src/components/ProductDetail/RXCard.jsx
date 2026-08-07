import React from "react";
import { FileText } from "lucide-react";

const RXCard = ({ requiresRx }) => {
  if (!requiresRx) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1 text-left select-none font-sans">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-red-600 shrink-0" />
        <h4 className="font-bold text-[11px] text-red-900 uppercase tracking-wider">Prescription Verification Required</h4>
      </div>
      <p className="text-[11px] text-red-800 leading-relaxed pl-6">
        A registered pharmacist will verify your doctor's prescription before shipment. Upload prescription during checkout or profile tab.
      </p>
    </div>
  );
};

export default RXCard;
