import React, { useState } from "react";
import { Truck, CheckCircle2, MapPin, Search } from "lucide-react";
import { api } from "../../services/api";

const ProductDeliveryCheck = () => {
  const [pincodeInput, setPincodeInput] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleCheckDelivery = async (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    setChecking(true);
    try {
      const res = await api.calculateDeliveryFee({ subtotal: 600, pincode: pincodeInput.trim() });
      setDeliveryStatus({
        isEligible: true,
        message: res.message || "Pan-India Express Delivery Available",
        charge: res.charge,
      });
    } catch (err) {
      setDeliveryStatus({
        isEligible: true,
        message: "Pan-India Express Delivery Available (Free on orders above ₹500)",
        charge: 0,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-slate-50/60 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 text-left">
      <div className="flex items-center gap-2">
        <Truck className="w-5 h-5 text-[#038076] dark:text-[#84d6b9]" />
        <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
          Check Delivery & Shipping
        </h4>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-400">
        Enter your 6-digit PIN code to check express delivery options nationwide.
      </p>

      {/* PIN Code Check Form */}
      <form onSubmit={handleCheckDelivery} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            maxLength={6}
            value={pincodeInput}
            onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 411045"
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076]"
          />
        </div>
        <button
          type="submit"
          disabled={checking || !pincodeInput.trim()}
          className="bg-[#038076] hover:bg-[#026860] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {checking ? "Checking..." : "Check PIN"}
        </button>
      </form>

      {/* Status Output */}
      {deliveryStatus && (
        <div className="p-3 rounded-xl border text-xs bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50 flex items-start gap-2 animate-[fade-in_0.2s_ease-out]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{deliveryStatus.message}</p>
            <p className="mt-1 text-[11px] font-medium opacity-90">
              🚀 Ships within 24 Hours • Free delivery on orders above ₹500
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDeliveryCheck;
