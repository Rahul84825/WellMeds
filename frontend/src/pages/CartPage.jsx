import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/currency";
import { ShoppingCart, Plus, ShieldCheck, ArrowRight, Phone, Info } from "lucide-react";
import { toast } from "sonner";

import SEO from "../components/common/SEO";
import ProgressStepper from "../components/cart/ProgressStepper";
import CartItemCard from "../components/cart/CartItemCard";
import PrescriptionNotice from "../components/cart/PrescriptionNotice";
import CheaperAlternativeSwap from "../components/cart/CheaperAlternativeSwap";
import OrderSummaryCard from "../components/cart/OrderSummaryCard";
import { api } from "../services/api";

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
    addToCart,
    clearCart,
  } = useCart();

  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Auto-apply coupon from URL query param if present
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
              toast.success(res.message || `Coupon ${code} applied successfully!`);
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

  // Pricing Calculations
  const originalTotal = cartItems.reduce((acc, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    return acc + origPrice * item.quantity;
  }, 0);

  const wellMedsDiscount = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const rxItemsCount = cartItems.filter((item) => item.isPrescriptionRequired || item.requiresRx).length;

  const handleApplyCoupon = (code, discountAmount) => {
    setCouponCode(code);
    setCouponApplied(true);
    setCouponDiscount(discountAmount);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponDiscount(0);
    toast.info("Coupon removed.");
  };

  const handleSwapItem = async (oldItemId, newProduct, qty) => {
    await removeFromCart(oldItemId);
    await addToCart(newProduct, qty);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      openLoginModal("/checkout");
      return;
    }
    // If Rx medicines exist, navigate to upload prescription step or checkout
    if (rxItemsCount > 0) {
      navigate("/upload-prescription");
    } else {
      navigate("/checkout");
    }
  };

  // ── Empty Cart State ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-20 sm:py-28 animate-[fade-in_0.3s_ease-out] flex flex-col items-center text-center">
        <SEO title="Shopping Cart" noindex={true} />

        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-xs">
          <ShoppingCart size={36} className="text-[#038076] dark:text-[#84d6b9]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
          Your shopping cart is empty
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">
          Looks like you haven't added any medicines or healthcare essentials to your cart yet.
        </p>

        <Link
          to="/products"
          className="bg-[#02665e] hover:bg-[#014d47] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <span>Explore Medicines & Products</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // ── Populated Cart View ──
  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 animate-[fade-in_0.3s_ease-out] text-left">
      <SEO title="Shopping Cart" noindex={true} />

      {/* Progress Stepper */}
      <ProgressStepper currentStep="cart" hasRxItem={rxItemsCount > 0} />

      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm font-medium">
            {cartCount} {cartCount === 1 ? "Item" : "Items"} in your cart •{" "}
            {rxItemsCount > 0 ? (
              <span className="text-purple-700 dark:text-purple-300 font-extrabold">
                {rxItemsCount} Prescription Required
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                No Prescription Required
              </span>
            )}
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-bold text-[#038076] dark:text-[#52d6c9] hover:underline flex items-center gap-1.5"
        >
          <Plus size={15} /> Add More Medicines
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* ── LEFT COLUMN: Cart Items & Rx Notices ── */}
        <div className="w-full lg:flex-1 space-y-6">
          
          {/* Prescription Guidance Banner */}
          <PrescriptionNotice
            rxItemCount={rxItemsCount}
            onUploadClick={() => navigate("/upload-prescription")}
          />

          {/* Cheaper Alternative Swap Suggestion */}
          <CheaperAlternativeSwap
            cartItems={cartItems}
            onSwapItem={handleSwapItem}
          />

          {/* Cart Items Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id || item._id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                prescriptionStatus={
                  item.isPrescriptionRequired || item.requiresRx ? "Required" : null
                }
              />
            ))}
          </div>

          {/* Genuine Guarantee Banner */}
          <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                100% Genuine Clinical Supplies & Fresh Stocks
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Sourced directly from licensed pharmaceutical manufacturers. Quality and temperature checked prior to dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Sticky Order Summary ── */}
        <div className="w-full lg:w-[380px] shrink-0">
          <OrderSummaryCard
            subtotal={subtotal}
            originalTotal={originalTotal}
            wellMedsDiscount={wellMedsDiscount}
            couponApplied={couponApplied}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onProceedToCheckout={handleProceedToCheckout}
            userLoggedIn={!!user}
          />

          {/* Help Footer */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Info size={14} className="text-[#038076]" /> Need Help?
            </span>
            <a
              href="tel:+917420909445"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Call Pharmacist
            </a>
            <span>•</span>
            <a
              href="https://wa.me/917420909445"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#038076] transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;