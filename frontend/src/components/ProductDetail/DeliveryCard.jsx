import React from "react";
import { Truck } from "lucide-react";

const DeliveryCard = () => {
  return (
    <div className="bg-[#004782]/[0.03] border border-[#004782]/10 rounded-2xl p-md flex items-center gap-sm text-left shadow-2xs hover:shadow-xs transition-all select-none">
      <Truck size={24} className="text-[#004782] shrink-0" />
      <div>
        <p className="text-[15px] font-black text-[#004782] dark:text-[#a4c9ff] uppercase tracking-wider">Express Delivery</p>
        <p className="text-sm text-slate-505 dark:text-zinc-400 mt-0.5 leading-snug">Get it delivered tomorrow by 2:00 PM. Free shipping on orders above ₹500.</p>
      </div>
    </div>
  );
};

export default DeliveryCard;
