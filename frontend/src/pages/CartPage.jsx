import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { api } from "../services/api";
import clinicalExcellenceImg from "../assets/clinical/clinical_Excellence.png";
import { 
  Trash2, ShoppingCart, Phone, Mail, ChevronRight, ChevronDown, 
  Home, Plus, Minus, ArrowRight, ShieldCheck, Tag, Info
} from "lucide-react";
import { toast } from "sonner";

import SEO from "../components/common/SEO";

const Cart = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    tax,
    total,
    requiresRx,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showOffers, setShowOffers] = useState(false);

  // Auto-apply coupon from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promo = params.get("coupon");
    if (promo) {
      const code = promo.trim().toUpperCase();
      setCouponCode(code);
      if (subtotal > 0) {
        const applyPromo = async () => {
          try {
            const res = await api.validateCoupon(code, subtotal);
            if (res.success) {
              setCouponApplied(true);
              setCouponDiscount(res.discountAmount || 0);
              toast.success(res.message || "Coupon applied successfully!");
            } else {
              toast.error(res.message || "Invalid coupon code.");
            }
          } catch (err) {
            const msg = err.response?.data?.message || "Failed to validate coupon.";
            toast.error(msg);
          }
        };
        applyPromo();
      }
    }
  }, [subtotal]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success) {
        setCouponApplied(true);
        setCouponDiscount(res.discountAmount || 0);
        toast.success(res.message || "Coupon applied successfully!");
      } else {
        toast.error(res.message || "Invalid coupon code.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to validate coupon.";
      toast.error(msg);
    }
  };

  // Pricing Calculations matching Reference Image
  const originalTotal = cartItems.reduce((acc, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    return acc + (origPrice * item.quantity);
  }, 0);

  const wellMedsDiscount = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const totalSavings = wellMedsDiscount + couponDiscount;
  const finalTotal = subtotal - couponDiscount;
  const rxItemsCount = cartItems.filter(item => item.isPrescriptionRequired || item.requiresRx).length;

  // ── Empty State ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 animate-[fade-in_0.3s_ease-out] flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-zinc-800">
          <ShoppingCart size={32} className="text-slate-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm leading-relaxed">
          Looks like you haven't added any medicines or health essentials to your cart yet.
        </p>
        <Link
          to="/products"
          className="bg-[#3f257a] hover:bg-[#321c62] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Populated Cart ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO title="Shopping Cart" noindex={true} />
      
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1.5 text-sm">
            {cartCount} {cartCount === 1 ? "Item" : "Items"} • {rxItemsCount > 0 ? (
              <span className="text-[#3f257a] dark:text-[#a4c9ff] font-medium">{rxItemsCount} Prescription Required</span>
            ) : "No Prescription Required"}
          </p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-[#3f257a] dark:text-[#a4c9ff] hover:underline flex items-center gap-1.5">
          <Plus size={16} /> Add more items
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ── LEFT COLUMN: Cart Items ── */}
        <div className="w-full lg:flex-1 space-y-6">
          
          {/* Items Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {cartItems.map((item) => {
                const itemId = item.id || item._id;
                const isRxItem = item.isPrescriptionRequired || item.requiresRx || false;
                const isColdChain = item.isColdChain || false;
                const discountPercent = item.originalPrice && item.originalPrice > item.price
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                const manufacturer = item.manufacturer || item.brand || "WELLMEDS";
                const packSize = item.packSize || item.productSpecifications?.packSize || "1 UNIT";
                const moleculeName = item.molecules?.[0]?.name || item.genericName || item.productSpecifications?.genericName;

                return (
                  <div key={itemId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-2">
                      <img
                        alt={item.name}
                        src={item.image || DEFAULT_PRODUCT_IMAGE}
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute -bottom-2 -left-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded shadow-sm border border-emerald-200 dark:border-emerald-800">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row justify-between gap-4">
                      
                      {/* Text Info */}
                      <div className="space-y-1.5 flex-1 pr-4">
                        <Link to={`/products/${item.slug || item.id}`} className="block font-bold text-base text-slate-900 dark:text-zinc-100 hover:text-[#3f257a] transition-colors leading-tight line-clamp-2">
                          {item.name}
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                          <span className="font-medium text-slate-600 dark:text-zinc-300">{packSize}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                          <span>By {manufacturer}</span>
                        </div>
                        
                        {moleculeName && (
                          <p className="text-xs text-slate-400 dark:text-zinc-500 truncate mt-1">
                            {moleculeName}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 pt-2">
                          {isRxItem && (
                            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-[#3f257a] dark:text-purple-300 text-[10px] font-bold px-2 py-1 rounded-md border border-purple-100 dark:border-purple-800/50 uppercase tracking-wider">
                              <span className="w-3 h-3 bg-[#3f257a] text-white rounded-full flex items-center justify-center text-[8px]">Rx</span>
                              Prescription Required
                            </span>
                          )}
                          {isColdChain && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-[10px] font-bold px-2 py-1 rounded-md border border-sky-100 dark:border-sky-800/50 uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                              Cold Storage
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Controls */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 mt-2 sm:mt-0">
                        {/* Price Display */}
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 line-through mt-0.5">
                              MRP {formatCurrency(item.originalPrice * item.quantity)}
                            </p>
                          )}
                        </div>

                        {/* Stepper & Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                          
                          <div className="flex items-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">100% Genuine Clinical Supplies</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Sourced directly from manufacturers. Quality checked before every delivery.</p>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Summary ── */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Order Summary</h3>
            </div>

            {/* Coupons Section */}
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowOffers(!showOffers)}
                className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-zinc-300 group"
              >
                <span className="flex items-center gap-2">
                  <Tag size={16} className="text-[#3f257a] dark:text-[#a4c9ff]" />
                  Apply Coupon Code
                </span>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showOffers ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </button>

              {showOffers && (
                <div className="mt-4 animate-[fade-in_0.2s_ease-out]">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code here"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f257a]/20"
                    />
                    <button
                      type="submit"
                      disabled={couponApplied || !couponCode.trim()}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {couponApplied && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        Code {couponCode} applied!
                      </span>
                      <button
                        type="button"
                        onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(""); }}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold underline text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400">
                <span>Total MRP</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">{formatCurrency(originalTotal)}</span>
              </div>
              
              {wellMedsDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>WellMeds Discount</span>
                  <span>-{formatCurrency(wellMedsDiscount)}</span>
                </div>
              )}

              {couponApplied && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <span>Shipping & Handling</span>
                <span className="text-slate-900 dark:text-zinc-100">Calculated at checkout</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">Order Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg text-center border border-emerald-100 dark:border-emerald-800/50">
                  You are saving {formatCurrency(totalSavings)} on this order!
                </div>
              )}
            </div>

            {/* Checkout Action */}
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => { user ? navigate("/checkout") : openLoginModal("/checkout"); }}
                className="w-full bg-[#3f257a] hover:bg-[#321c62] text-white py-4 px-6 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                {user ? "Proceed to Checkout" : "Login to Checkout"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Support Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><Info size={14} /> Need help?</span>
            <a href="tel:+919876543210" className="hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">Call Us</a>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">WhatsApp</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;