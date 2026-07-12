import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/currency";
import { api } from "../services/api";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { Trash2, AlertTriangle, FileText, ClipboardList, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

  // Prescription records loaded for verification badges
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(false);

  useEffect(() => {
    const fetchRx = async () => {
      if (user && requiresRx) {
        setLoadingRx(true);
        try {
          const data = await api.getMyPrescriptions();
          setPrescriptions(data);
        } catch (err) {
          console.error("Failed to load prescriptions", err);
        } finally {
          setLoadingRx(false);
        }
      }
    };
    fetchRx();
  }, [user, requiresRx, cartItems]);

  // Helper to normalize items in cart for matching CartSnapshot
  const getRxCartItems = useCallback((items) => {
    return items.filter(item => item.requiresRx).map(item => ({
      productId: (item._id || item.id)?.toString(),
      name: item.name,
      quantity: item.quantity,
      strength: item.strength || item.specifications?.find(s => s.label?.toLowerCase() === 'strength')?.value || '',
      packSize: item.packSize || item.specifications?.find(s => s.label?.toLowerCase() === 'pack size' || s.label?.toLowerCase() === 'packsize')?.value || ''
    }));
  }, []);

  // Helper to compare a snapshot with the current cart
  const isSnapshotMatchingCart = useCallback((snapshot, items) => {
    if (!snapshot || !Array.isArray(snapshot.items)) return false;
    const rxCart = getRxCartItems(items);
    const snapshotItems = snapshot.items;
    
    if (rxCart.length !== snapshotItems.length) return false;
    
    return rxCart.every(cartItem => {
      const match = snapshotItems.find(snapItem => snapItem.productId === cartItem.productId);
      if (!match) return false;
      return (
        match.quantity === cartItem.quantity &&
        match.strength === cartItem.strength &&
        match.packSize === cartItem.packSize
      );
    });
  }, [getRxCartItems]);

  // Computes the dynamic verification badge for the cart
  const getComputedRxStatus = () => {
    const rxItems = cartItems.filter(item => item.requiresRx);
    if (rxItems.length === 0) return null;
    if (!user) return "Prescription Required";

    const match = prescriptions.find(rx => isSnapshotMatchingCart(rx.cartSnapshot, cartItems));
    if (match) {
      if (match.status === "Approved") return "Verified";
      if (match.status === "Pending Review" || match.status === "Under Verification") return "Pending Verification";
      if (match.status === "Rejected") return "Rejected";
    } else {
      if (prescriptions.length > 0) return "Needs Re-verification";
    }
    return "Prescription Required";
  };

  const rxStatus = getComputedRxStatus();

  // Render badge with beautiful healthcare colors
  const renderRxBadge = (status) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-500/20 shadow-sm transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
            🟢 Verified
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20 shadow-sm transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            🟠 Pending Verification
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-500/20 shadow-sm transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            🔴 Rejected
          </span>
        );
      case "Needs Re-verification":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 border border-sky-500/20 shadow-sm transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            🔵 Needs Re-verification
          </span>
        );
      case "Prescription Required":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-550/10 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20 shadow-sm transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            🟡 Prescription Required
          </span>
        );
    }
  };

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

  const finalTotal = total - couponDiscount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-max-width mx-auto px-margin-desktop py-xxl animate-[fade-in_0.3s_ease-out] text-center">
        <div className="max-w-md mx-auto space-y-md py-xl">
          <span className="material-symbols-outlined text-6xl text-outline mb-md animate-bounce">shopping_cart</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-lg">Your Cart is Empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-xl">
            Looks like you haven't added any clinical supplies or health essentials to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary text-on-primary px-xl py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Filter items into Rx vs Regular sections
  const rxItems = cartItems.filter(item => item.requiresRx);
  const regularItems = cartItems.filter(item => !item.requiresRx);

  const renderCartItemRow = (item, isRxItem) => {
    return (
      <div key={item.id} className="py-md flex flex-col sm:flex-row items-stretch sm:items-center gap-md">
        {/* Product Thumbnail */}
        <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-950 rounded-2xl overflow-hidden shrink-0 border border-outline-variant/60 flex items-center justify-center p-1 relative shadow-inner">
          <img alt={item.name} className="max-w-[90%] max-h-[90%] object-contain" src={item.image} />
          {isRxItem && (
            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-black text-[8px] px-1 py-0.2 rounded uppercase">Rx</span>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <p className="text-label-sm text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-black text-[9px] leading-none mb-1">
              {item.manufacturer || item.brand}
            </p>
            <Link
              to={`/products/${item.slug || item.id}`}
              className="font-extrabold text-slate-800 dark:text-zinc-150 hover:text-primary transition-colors text-sm sm:text-base block truncate max-w-[220px] sm:max-w-sm"
            >
              {item.name}
            </Link>
            
            {isRxItem && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-450 dark:text-zinc-500">
                <span className="material-symbols-outlined text-[13px] text-amber-500">info</span>
                <span>Requires prescription verification at checkout</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Qty panel */}
        <div className="flex items-center justify-between sm:justify-end gap-xl mt-sm sm:mt-0">
          <div className="flex items-center border border-outline-variant dark:border-outline rounded-xl bg-surface-container-low dark:bg-surface-container h-9 p-0.5 shadow-sm">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
            </button>
            <span className="px-3 font-extrabold text-on-surface text-xs">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>

          <div className="text-right min-w-[90px]">
            <p className="font-black text-sm text-[#004782] dark:text-primary-fixed-dim">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <p className="text-[10px] text-slate-400">
              {formatCurrency(item.price)} each
            </p>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="text-slate-400 hover:text-error transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
            title="Remove product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-xl items-start">
        {/* Left Side: Items List Grouped by Prescription requirement */}
        <div className="flex-grow w-full space-y-md lg:max-w-[70%]">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-2xl overflow-hidden shadow-sm p-lg space-y-lg">
            
            {/* Header row */}
            <div className="pb-md border-b border-outline-variant dark:border-outline/40 flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface font-bold text-sm">
                {cartCount} Items in your cart
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-error hover:underline flex items-center gap-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Clear Cart
              </button>
            </div>

            {/* SECTION 1: Prescription Medicines */}
            {rxItems.length > 0 && (
              <div className="space-y-sm">
                <div className="flex items-center justify-between pb-sm border-b border-rose-100 dark:border-rose-950/20">
                  <h3 className="font-bold text-sm text-rose-600 dark:text-rose-450 flex items-center gap-xs">
                    <span className="material-symbols-outlined font-bold text-[18px]">prescriptions</span>
                    Prescription Medicines
                  </h3>
                  {renderRxBadge(rxStatus)}
                </div>
                <div className="divide-y divide-outline-variant/30 dark:divide-outline/10">
                  {rxItems.map(item => renderCartItemRow(item, true))}
                </div>
              </div>
            )}

            {/* SECTION 2: Regular Medicines */}
            {regularItems.length > 0 && (
              <div className="space-y-sm pt-md">
                <div className="pb-sm border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-150 flex items-center gap-xs">
                    <span className="material-symbols-outlined font-bold text-[18px]">healing</span>
                    Regular Items & OTC Supplements
                  </h3>
                </div>
                <div className="divide-y divide-outline-variant/30 dark:divide-outline/10">
                  {regularItems.map(item => renderCartItemRow(item, false))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="w-full lg:w-96 space-y-md shrink-0">
          {/* Coupon Code Input */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface font-bold mb-lg">Promo Code</h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-sm">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="flex-grow p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm focus:ring-1 focus:ring-primary text-on-surface text-sm"
              />
              <button
                type="submit"
                disabled={couponApplied || !couponCode.trim()}
                className="bg-primary text-on-primary px-lg rounded-lg font-label-md text-sm hover:bg-primary-container disabled:opacity-50 transition-colors cursor-pointer select-none"
              >
                Apply
              </button>
            </form>
            {couponApplied && (
              <div className="mt-sm text-secondary font-medium text-body-sm flex items-center justify-between">
                <span>Coupon MEDISTART20 (20% off) Applied</span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponApplied(false);
                    setCouponDiscount(0);
                    setCouponCode("");
                  }}
                  className="text-error hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Pricing Totals Card */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-md">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Order Summary
            </h3>
            
            <div className="space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-on-surface font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-secondary">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-on-surface font-semibold">
                  {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span className="text-on-surface font-semibold">{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant dark:border-outline/40 pt-md flex justify-between font-bold text-headline-sm text-on-surface">
              <span>Total Price</span>
              <span className="text-primary dark:text-primary-fixed-dim">{formatCurrency(finalTotal)}</span>
            </div>

            {/* Warning Message for Rx items */}
            {requiresRx && (
              <div className="bg-amber-500/[0.03] border border-amber-500/20 rounded-xl p-md text-left flex gap-sm items-start text-amber-700 dark:text-amber-450">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 animate-pulse">prescriptions</span>
                <div>
                  <h4 className="font-label-md text-label-md font-bold">Prescription Required</h4>
                  <p className="text-[11px] leading-snug mt-1 text-slate-500 dark:text-zinc-400">
                    Regulated items in your cart must be verified. You will upload your prescription during checkout.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!user) {
                  openLoginModal("/checkout");
                } else {
                  navigate("/checkout");
                }
              }}
              className="w-full bg-secondary text-white font-bold py-md rounded-lg hover:bg-on-secondary-container transition-all active:scale-95 flex items-center justify-center gap-sm shadow-md cursor-pointer select-none"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <Link
              to="/products"
              className="block text-center font-label-md text-sm text-primary dark:text-primary-fixed-dim hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
