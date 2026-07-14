import React from "react";
import { Truck, Check, Lock, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const PurchaseCard = ({
  product,
  quantity,
  handleDecrement,
  handleIncrement,
  handleBuyNow,
  handleAddToCart,
  discountPercent
}) => {
  return (
    <aside className="w-full lg:w-[26%] lg:sticky lg:top-24 space-y-md order-3 max-w-[380px] text-xs select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-855/60 py-md px-sm rounded-3xl shadow-lg space-y-md">
        {/* Price Panel */}
        <div className="bg-slate-50/50 dark:bg-zinc-955/20 py-2.5 px-3 rounded-2xl border border-slate-100 dark:border-zinc-855 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Price</span>
          <div className="flex items-baseline gap-xs mt-xs flex-wrap">
            <span className="text-2xl font-black text-[#004782] dark:text-primary-fixed-dim">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-slate-400 line-through text-xs font-semibold">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex flex-wrap gap-xs items-center mt-1">
              <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                {discountPercent}% OFF
              </span>
              <span className="text-[10px] font-bold text-[#086b53] dark:text-emerald-400">
                Save {formatCurrency(product.originalPrice - product.price)}
              </span>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Inclusive of all taxes & GST</p>
        </div>

        {/* Quantity Selector */}
        {(product.inStock !== false && product.stock > 0) ? (
          <div className="space-y-1.5 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Quantity</span>
            <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900 h-11 w-full justify-between p-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-xl cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-extrabold text-sm text-on-surface">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= 30}
                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-xl cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-sm bg-red-500/5 border border-red-500/10 text-red-500 font-bold rounded-xl text-center">
            This item is currently Out of Stock
          </div>
        )}

        {/* Checkout / ATC Buttons */}
        <div className="space-y-2 pt-0.5">
          <button
            onClick={handleBuyNow}
            disabled={product.inStock === false || product.stock === 0}
            className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold h-11 rounded-2xl transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm outline-none cursor-pointer text-xs shadow-sm"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false || product.stock === 0}
            className="w-full border-2 border-[#004782] text-[#004782] dark:text-[#a4c9ff] dark:border-[#a4c9ff]/50 hover:bg-[#004782]/5 font-bold h-11 rounded-2xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm outline-none cursor-pointer text-xs"
          >
            Add to Cart
          </button>
        </div>

        {/* Delivery estimate */}
        <div className="text-left bg-slate-50 dark:bg-zinc-955/20 py-2.5 px-3 rounded-2xl border border-slate-100 dark:border-zinc-855 space-y-xs">
          <p className="font-bold text-[10px] text-slate-550 flex items-center gap-xs">
            <Truck size={12} className="text-[#086b53]" /> Delivery Estimate
          </p>
          <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Free delivery by Tomorrow, 2:00 PM</p>
        </div>

        {/* Trust badges */}
        <div className="space-y-2 pt-sm border-t border-slate-150 dark:border-zinc-855 text-left">
          <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check size={12} className="text-emerald-500" />
            </div>
            <span>100% Genuine Product</span>
          </div>
          <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Lock size={12} className="text-[#004782]" />
            </div>
            <span>Secure Encrypted Payment</span>
          </div>
          <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
            <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={12} className="text-[#086b53]" />
            </div>
            <span>Pharmacist Verified</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PurchaseCard;
