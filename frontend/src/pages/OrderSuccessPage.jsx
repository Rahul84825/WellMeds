import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Fallback if accessed directly without state
  if (!order) {
    return (
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No order details found</h2>
        <Link to="/products" className="text-primary hover:underline mt-md inline-block">Continue Shopping</Link>
      </div>
    );``
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="max-w-2xl mx-auto space-y-xl text-center bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-xl shadow-lg">
        {/* Animated Checkmark Indicator */}
        <div className="space-y-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-secondary-container text-secondary rounded-full flex items-center justify-center animate-bounce shadow-md">
            <span className="material-symbols-outlined text-[36px] font-bold">check</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed-dim font-bold">
            Order Placed Successfully!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant max-w-md">
            Thank you for shopping with MediShop. Your order has been placed and is currently being processed.
          </p>
        </div>

        {/* Order Details Panel */}
        <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant/60 rounded-xl p-md text-left space-y-md">
          <div className="flex justify-between items-center pb-md border-b border-outline-variant/60 mb-lg">
            <span className="font-bold text-on-surface">Order Details</span>
            <span className="text-body-sm font-semibold text-primary bg-primary-container/20 px-md py-0.5 rounded">
              ID: {order.orderId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-body-sm text-on-surface-variant dark:text-surface-variant">
            <p>Customer Name: <span className="font-bold text-on-surface">{order.customer}</span></p>
            <p>Order Date: <span className="font-bold text-on-surface">{formatDate(order.createdAt)}</span></p>
            <p>Shipping Address: <span className="font-bold text-on-surface">{order.shippingAddress}</span></p>
            <p>Payment Method: <span className="font-bold text-on-surface uppercase">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "upi" ? "UPI" : "Card Payment"}</span></p>
          </div>

          {order.rxUploaded && (
            <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-md flex gap-sm items-start text-secondary">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">verified</span>
              <div>
                <h4 className="font-label-sm text-label-sm font-bold">Prescription Document Attached</h4>
                <p className="text-[12px] text-on-surface-variant leading-tight mt-0.5">
                  Our pharmacists are currently reviewing your attached file: <strong>{order.rxFile || "prescription.pdf"}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="pt-sm border-t border-outline-variant/60">
            <h4 className="font-label-sm text-label-sm text-on-surface font-bold mb-md">Items Ordered</h4>
            <div className="divide-y divide-outline-variant/40 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between text-body-sm text-on-surface-variant dark:text-surface-variant">
                  <div>
                    <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-on-surface">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/60 pt-md flex justify-between font-bold text-headline-sm text-on-surface">
            <span>Total Paid</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md border-t border-outline-variant/30">
          <Link
            to="/orders"
            className="bg-primary text-on-primary px-xl py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container active:scale-95 transition-all text-center flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>View Order History</span>
          </Link>
          <Link
            to="/products"
            className="border border-outline-variant rounded-lg px-xl py-sm font-label-md text-label-md hover:bg-surface-container-low text-on-surface transition-all text-center flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
