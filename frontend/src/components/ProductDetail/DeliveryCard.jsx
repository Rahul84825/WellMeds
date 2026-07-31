import React, { useState } from "react";
import ProductDeliveryCheck from "./ProductDeliveryCheck";
import { Truck, ChevronDown, ChevronUp } from "lucide-react";

const DeliveryCard = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pdp-paper-card p-3.5 text-left font-mono select-none space-y-2">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <Truck size={18} className="text-[#157a6d] shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-[#157a6d] uppercase tracking-wider">Express Local Delivery</p>
            <p className="text-[11px] text-[#3f544d] mt-0.5 leading-snug">
              Fast verified delivery within 15 km of our store.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          <span>{expanded ? "Close" : "Check Pin"}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="pt-2 border-t border-outline-variant/40">
          <ProductDeliveryCheck />
        </div>
      )}
    </div>
  );
};

export default DeliveryCard;
