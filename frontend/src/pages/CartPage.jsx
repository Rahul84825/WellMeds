import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, roundPrice, calculateDiscountPercent } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { api } from "../services/api";
import Modal from "../components/Modal";
import { 
  Trash2, ShoppingCart, Phone, Mail, ChevronRight, ChevronDown, 
  Home, Plus, Minus, ArrowRight, ShieldCheck, Tag, Info, Lock, AlertTriangle
} from "lucide-react";
import SEO from "../components/common/SEO";
import { BUSINESS_INFO } from "../config/businessInfo";

const Cart = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    tax,
    total,
    requiresRx,
    isCartLocked,
    checkoutSessionStatus,
    lockReason,
    modifyCart,
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
  const [showModifyConfirmModal, setShowModifyConfirmModal] = useState(false);

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
            }
          } catch (err) {
            console.warn("Failed to validate promo coupon:", err.message);
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
      }
    } catch (err) {
      console.warn("Failed to validate coupon:", err.message);
    }
  };

  // Pricing Calculations matching Reference Image
  const originalTotal = roundPrice(cartItems.reduce((acc, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    return acc + (Number(origPrice) * item.quantity);
  }, 0));

  const wellMedsDiscount = originalTotal > subtotal ? roundPrice(originalTotal - subtotal) : 0;
  const totalSavings = roundPrice(wellMedsDiscount + couponDiscount);
  const finalTotal = roundPrice(subtotal - couponDiscount);
  const rxItemsCount = cartItems.filter(item => item.isPrescriptionRequired || item.requiresRx).length;

  // ── Empty State ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 animate-[fade-in_0.3s_ease-out] flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#f4f9f7] dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm border border-[#157a6d]/20">
          <ShoppingCart size={36} className="text-[#157a6d] dark:text-emerald-400" />
        </div>
        <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white mb-3 tracking-tight">Your cart is empty</h2>
        <p className="font-sans text-slate-500 dark:text-zinc-400 mb-8 max-w-sm leading-relaxed text-sm">
          Looks like you haven't added any medicines or health essentials to your cart yet.
        </p>
        <Link
          to="/products"
          className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm tracking-wide"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Populated Cart ──
  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SEO title="Shopping Cart" noindex={true} />
      
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-1.5 flex items-center gap-2">
            <span>CLINICAL BASKET</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
            <span>CHECKOUT READY</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1.5 text-sm">
            {cartCount} {cartCount === 1 ? "Item" : "Items"} • {rxItemsCount > 0 ? (
              <span className="text-[#157a6d] dark:text-emerald-400 font-medium">{rxItemsCount} Prescription Required</span>
            ) : "No Prescription Required"}
          </p>
        </div>
        {!isCartLocked && (
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-[#157a6d] dark:text-emerald-400 hover:underline flex items-center gap-1.5">
            <Plus size={16} /> Add more items
          </Link>
        )}
      </div>

      {/* Cart Locked Alert Banner */}
      {isCartLocked && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[24px] p-6 text-amber-900 dark:text-amber-200 shadow-sm space-y-4 mb-8 animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Lock size={22} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-base">Prescription Verification Pending</span>
                <span className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  CART LOCKED
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                Your prescription is currently under pharmacist verification. Your cart has been temporarily locked to ensure the medicines being verified remain unchanged. You will be able to continue after verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-amber-200/70 dark:border-amber-900/40">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Need to change medicines, quantities, or coupons?
            </span>
            <button
              type="button"
              onClick={() => setShowModifyConfirmModal(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              Modify Cart
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ── LEFT COLUMN: Cart Items ── */}
        <div className="w-full lg:flex-1 space-y-6">
          
          {/* Items Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {cartItems.map((item) => {
                const itemId = item.id || item._id;
                const isRxItem = item.isPrescriptionRequired || item.requiresRx || false;
                const isColdChain = item.isColdChain || false;
                const discountPercent = item.originalPrice && item.originalPrice > item.price
                  ? calculateDiscountPercent(item.originalPrice, item.price)
                  : 0;

                const manufacturer = item.manufacturer || item.marketer || item.brand || "WELLMEDS";
                const packSize = item.packSize || item.productSpecifications?.packSize || "1 UNIT";
                const moleculeName = item.molecules?.[0]?.name || item.genericName || item.productSpecifications?.genericName;

                return (
                  <div key={itemId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-5 transition-colors hover:bg-[#f4f9f7]/40 dark:hover:bg-zinc-800/20">
                    
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#f4f9f7] dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center p-2">
                      <img
                        alt={item.name}
                        src={item.image || DEFAULT_PRODUCT_IMAGE}
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute -bottom-2 -left-2 rounded-full bg-[#bbf7d0] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold font-sans shadow-2xs">
                          {discountPercent}% Off
                        </span>
                      )}
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row justify-between gap-4">
                      
                      {/* Text Info */}
                      <div className="space-y-1.5 flex-1 pr-4">
                        <Link to={`/products/${item.slug || item.id}`} className="block font-semibold text-base text-[#172b26] dark:text-zinc-100 hover:text-[#157a6d] transition-colors leading-tight line-clamp-2">
                          {item.name}
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 font-sans">
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{packSize}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                          <span>By {manufacturer}</span>
                        </div>
                        
                        {moleculeName && (
                          <p className="text-xs font-clinical-mono text-slate-400 dark:text-zinc-500 truncate mt-1">
                            {moleculeName}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 pt-2">
                          {isRxItem && (
                            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-[#157a6d] dark:text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-800/50 uppercase tracking-wider">
                              <span className="w-3.5 h-3.5 bg-[#157a6d] text-white rounded-full flex items-center justify-center text-[8px]">Rx</span>
                              Prescription Required
                            </span>
                          )}
                          {isColdChain && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-100 dark:border-sky-800/50 uppercase tracking-wider">
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
                          <p className="font-bold text-lg text-[#172b26] dark:text-white">
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
                            disabled={isCartLocked}
                            className={`p-2 rounded-full transition-colors ${
                              isCartLocked
                                ? "text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            }`}
                            title={isCartLocked ? "Cart is locked under verification" : "Remove item"}
                          >
                            <Trash2 size={18} />
                          </button>
                          
                          <div className={`flex items-center bg-[#f4f9f7] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full p-1 ${isCartLocked ? "opacity-60" : ""}`}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isCartLocked}
                              className="w-7 h-7 flex items-center justify-center text-[#172b26] dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all shadow-xs disabled:cursor-not-allowed"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#172b26] dark:text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isCartLocked}
                              className="w-7 h-7 flex items-center justify-center text-[#172b26] dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all shadow-xs disabled:cursor-not-allowed"
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
          <div className="bg-[#f4f9f7] dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-[#157a6d] shrink-0 border border-slate-200/80">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#172b26] dark:text-zinc-100">100% Genuine Clinical Supplies</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Sourced directly from verified pharma partners. Quality checked before delivery.</p>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Summary ── */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-[#f4f9f7]/50 dark:bg-zinc-900/50">
              <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white">Order Summary</h3>
            </div>

            {/* Coupons Section */}
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowOffers(!showOffers)}
                className="w-full flex items-center justify-between text-xs font-bold font-clinical-mono text-[#157a6d] dark:text-emerald-400 group"
              >
                <span className="flex items-center gap-2">
                  <Tag size={16} />
                  APPLY COUPON CODE
                </span>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showOffers ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </button>

              {showOffers && (
                <div className="mt-4 animate-[fade-in_0.2s_ease-out]">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      className="flex-1 bg-[#f4f9f7] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs font-mono uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#157a6d]/20"
                    />
                    <button
                      type="submit"
                      disabled={couponApplied || !couponCode.trim()}
                      className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-5 py-2 rounded-full text-xs font-bold disabled:opacity-40 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {couponApplied && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-full px-4 py-2 text-xs">
                      <span className="font-medium text-[#157a6d] dark:text-emerald-400">
                        Code {couponCode} applied!
                      </span>
                      <button
                        type="button"
                        onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(""); }}
                        className="text-[#157a6d] dark:text-emerald-400 hover:underline font-bold text-xs"
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
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                <span>Total MRP</span>
                <span className="font-medium text-[#172b26] dark:text-zinc-100">{formatCurrency(originalTotal)}</span>
              </div>
              
              {wellMedsDiscount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-[#157a6d] dark:text-emerald-400 font-medium">
                  <span>WellMeds Discount</span>
                  <span>-{formatCurrency(wellMedsDiscount)}</span>
                </div>
              )}

              {couponApplied && (
                <div className="flex justify-between text-xs sm:text-sm text-[#157a6d] dark:text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-zinc-400 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <span>Shipping & Handling</span>
                <span className="text-[#172b26] dark:text-zinc-100">Calculated at checkout</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-[#172b26] dark:text-white">Order Total</span>
                <span className="text-xl font-bold text-[#172b26] dark:text-white tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="bg-[#f4f9f7] dark:bg-emerald-900/20 text-[#157a6d] dark:text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-full text-center border border-[#157a6d]/20 dark:border-emerald-800/50">
                  You are saving {formatCurrency(totalSavings)} on this order!
                </div>
              )}
            </div>

            {/* Checkout Action */}
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => { user ? navigate("/checkout") : openLoginModal("/checkout"); }}
                className="w-full bg-[#157a6d] hover:bg-[#0f5c52] text-white py-3.5 px-6 rounded-full font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs cursor-pointer tracking-wide"
              >
                {user ? "Proceed to Checkout" : "Login to Checkout"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Support Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><Info size={14} /> Need help?</span>
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">Call Us ({BUSINESS_INFO.phone})</a>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
            <a href={BUSINESS_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">WhatsApp</a>
          </div>

        </div>
      </div>

      {/* Modify Cart Confirmation Modal */}
      <Modal
        isOpen={showModifyConfirmModal}
        onClose={() => setShowModifyConfirmModal(false)}
        title="Modify Cart?"
        maxWidth="max-w-md"
        showCloseButton={true}
      >
        <div className="flex flex-col items-center text-center space-y-5 py-3 select-none">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2 px-2">
            <h4 className="font-bold text-base text-[#172b26] dark:text-white">
              Cancel Prescription Verification?
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Modifying your cart will cancel the current prescription verification. You will need to upload a new prescription for the updated medicines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <button
              type="button"
              onClick={() => setShowModifyConfirmModal(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 py-3 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowModifyConfirmModal(false);
                await modifyCart();
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Modify Cart & Unlock
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default Cart;