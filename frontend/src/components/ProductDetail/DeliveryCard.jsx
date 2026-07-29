import React from "react";
import { Truck } from "lucide-react";

const DeliveryCard = () => {
  return (
    <div className="pdp-paper-card p-3.5 flex items-center gap-3 text-left font-mono select-none">
      <Truck size={18} className="text-[#157a6d] shrink-0" />
      <div>
        <p className="text-[11px] font-bold text-[#157a6d] uppercase tracking-wider">Express Delivery</p>
        <p className="text-[11px] text-[#3f544d] mt-0.5 leading-snug">Fast cold-chain verified delivery to your doorstep.</p>
      </div>
    </div>
  );
};

export default DeliveryCard;
