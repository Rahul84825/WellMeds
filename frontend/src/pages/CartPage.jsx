import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/currency";

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

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "MEDISTART20") {
      setCouponApplied(true);
      setCouponDiscount(subtotal * 0.20); // 20% discount
    } else {
      toast.error("Invalid coupon code. Try MEDISTART20!");
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

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-xl items-start">
        {/* Left Side: Items List */}
        <div className="flex-1 w-full space-y-md">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl overflow-hidden shadow-sm">
            <div className="p-md bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant dark:border-outline/40 flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {cartCount} Items in your cart
              </span>
              <button
                onClick={clearCart}
                className="text-body-sm text-error hover:underline flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-outline-variant dark:divide-outline/40">
              {cartItems.map((item) => (
                <div key={item.id} className="p-md flex flex-col sm:flex-row items-stretch sm:items-center gap-md">
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden shrink-0 border border-outline-variant">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                  </div>

                  {/* Info Panel */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider font-semibold text-[10px]">
                        {item.brand}
                      </p>
                      <Link
                        to={`/product/${item.id}`}
                        className="font-label-md text-label-md text-on-surface hover:text-primary dark:hover:text-primary-fixed-dim transition-colors font-bold block"
                      >
                        {item.name}
                      </Link>
                      
                      {item.requiresRx && (
                        <div className="inline-flex items-center gap-xs text-secondary text-body-sm font-medium mt-1">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Prescription Required</span>
                          {item.rxUploaded ? (
                            <span className="text-[11px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded ml-xs">
                              Rx Attached
                            </span>
                          ) : (
                            <span className="text-[11px] bg-error-container/20 text-error px-2 py-0.5 rounded ml-xs border border-error/15">
                              Rx Needed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Qty panel */}
                  <div className="flex items-center justify-between sm:justify-end gap-xl mt-sm sm:mt-0">
                    <div className="flex items-center border border-outline-variant dark:border-outline rounded-lg bg-surface-container-low dark:bg-surface-container h-9">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-sm h-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="px-md font-bold text-on-surface text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-sm h-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-body-sm text-on-surface-variant text-[11px]">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove product"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="w-full lg:w-96 space-y-md">
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
                className="bg-primary text-on-primary px-lg rounded-lg font-label-md text-sm hover:bg-primary-container disabled:opacity-50 transition-colors"
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
                  className="text-error hover:underline"
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
                  <span>Coupon Discount (20%)</span>
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
              <div className="bg-error-container/20 border border-error/20 rounded-xl p-md text-left flex gap-sm items-start text-error">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
                <div>
                  <h4 className="font-label-md text-label-md font-bold">Prescription Required</h4>
                  <p className="text-body-sm leading-tight mt-0.5">
                    One or more items require prescription validation. You will upload them during checkout.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-secondary text-white font-bold py-md rounded-lg hover:bg-on-secondary-container transition-all active:scale-95 flex items-center justify-center gap-sm shadow-md"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
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
