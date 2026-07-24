import React, { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import { Tag, ChevronRight, ArrowRight, ShieldCheck, Truck, PhoneCall, Info } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";

const OrderSummaryCard = ({
  subtotal = 0,
  originalTotal = 0,
  wellMedsDiscount = 0,
  couponApplied = false,
  couponDiscount = 0,
  couponCode = "",
  onApplyCoupon = () => {},
  onRemoveCoupon = () => {},
  onProceedToCheckout = () => {},
  userLoggedIn = false,
}) => {
  const [inputCode, setInputCode] = useState(couponCode || "");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const totalSavings = wellMedsDiscount + couponDiscount;
  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const isFreeDelivery = finalTotal >= 500;

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    setIsValidating(true);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success) {
        onApplyCoupon(code, res.discountAmount || 0);
        toast.success(res.message || `Coupon ${code} applied!`);
      } else {
        toast.error(res.message || "Invalid coupon code.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to validate coupon.";
      toast.error(msg);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col sticky top-24 text-left animate-[fade-in_0.3s_ease-out]">
      
      {/* Summary Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
          Order Summary
        </h3>
        <span className="text-xs font-bold text-[#038076] dark:text-[#52d6c9]">
          100% Genuine
        </span>
      </div>

      {/* Coupon Accordion & Form */}
      <div className="p-5 border-b border-slate-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowCouponInput(!showCouponInput)}
          className="w-full flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-zinc-200 group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Tag size={15} className="text-[#3f257a] dark:text-[#a4c9ff]" />
            Apply Coupon / Promo Code
          </span>
          <ChevronRight
            size={16}
            className={`text-slate-400 transition-transform ${
              showCouponInput ? "rotate-90" : "group-hover:translate-x-1"
            }`}
          />
        </button>

        {showCouponInput && (
          <div className="mt-3.5 animate-[fade-in_0.2s_ease-out]">
            <form onSubmit={handleCouponSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Code (e.g. WELL10)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                disabled={couponApplied || isValidating}
                className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-extrabold uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20"
              />
              <button
                type="submit"
                disabled={couponApplied || !inputCode.trim() || isValidating}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isValidating ? "..." : "Apply"}
              </button>
            </form>

            {couponApplied && (
              <div className="mt-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-xs">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  Code {couponCode} applied! ({formatCurrency(couponDiscount)} off)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveCoupon();
                    setInputCode("");
                  }}
                  className="text-rose-600 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="p-6 space-y-3.5">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
          <span>Total MRP</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100">
            {formatCurrency(originalTotal)}
          </span>
        </div>

        {wellMedsDiscount > 0 && (
          <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>WellMeds Discount</span>
            <span>-{formatCurrency(wellMedsDiscount)}</span>
          </div>
        )}

        {couponApplied && (
          <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Coupon Savings</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-400 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <span className="flex items-center gap-1">
            <Truck size={14} className="text-[#038076]" /> Delivery Charges
          </span>
          <span className="font-bold text-slate-900 dark:text-zinc-100">
            {isFreeDelivery ? (
              <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black text-[11px]">FREE</span>
            ) : (
              "Calculated at checkout"
            )}
          </span>
        </div>

        {/* Final Total */}
        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white block">
              Final Amount payable
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Inclusive of all taxes
            </span>
          </div>
          <span className="text-2xl font-black text-[#038076] dark:text-[#52d6c9] tracking-tight">
            {formatCurrency(finalTotal)}
          </span>
        </div>

        {totalSavings > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold p-3 rounded-xl text-center border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            🎉 You are saving {formatCurrency(totalSavings)} on this order!
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <div className="p-6 pt-0 space-y-3">
        <button
          type="button"
          onClick={onProceedToCheckout}
          className="w-full bg-[#3f257a] hover:bg-[#321c62] text-white py-4 px-6 rounded-xl font-extrabold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span>{userLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}</span>
          <ArrowRight size={18} />
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 pt-1">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>256-Bit SSL Encrypted Safe Checkout</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
