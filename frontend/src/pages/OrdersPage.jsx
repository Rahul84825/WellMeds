import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

// Status badge colour helper
const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return { badge: "bg-secondary-container/30 text-on-secondary-container", dot: "bg-secondary" };
    case "Processing":
    case "Approved":
    case "Packed":
      return { badge: "bg-primary-container/20 text-primary", dot: "bg-primary" };
    case "Shipped":
      return { badge: "bg-tertiary-fixed/20 text-tertiary", dot: "bg-tertiary" };
    case "Cancelled":
      return { badge: "bg-error-container/20 text-error", dot: "bg-error" };
    case "Prescription Review":
      return { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" };
    default:
      return { badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" };
  }
};

const Orders = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const data = await api.getUserOrders();
        setUserOrders(data);
      } catch (err) {
        console.error("Failed to load user orders", err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Please log in to view orders</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-md">error</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold">Order History</h1>
        <p className="font-body-sm text-on-surface-variant">
          {userOrders.length} order{userOrders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="text-center py-xxl bg-surface-container-low dark:bg-inverse-surface/30 rounded-xl border border-outline-variant/60">
          <span className="material-symbols-outlined text-5xl text-outline mb-md">shopping_bag</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No Orders Found</h3>
          <p className="font-body-sm text-on-surface-variant dark:text-surface-variant mt-xs">
            You haven't placed any orders with this account yet.
          </p>
        </div>
      ) : (
        <div className="space-y-lg">
          {userOrders.map((order) => {
            // Backend field mapping: orderId (string), createdAt (ISO string)
            const displayId = order.orderId;
            const displayDate = formatDate(order.createdAt);
            const { badge: badgeClass, dot: dotClass } = getStatusStyle(order.status);

            return (
              <div
                key={displayId}
                className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-md"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm pb-sm border-b border-outline-variant/60">
                  <div className="flex flex-wrap gap-md items-center text-body-sm text-on-surface-variant dark:text-surface-variant">
                    <p>
                      Order ID:{" "}
                      <span className="font-bold text-on-surface font-mono">{displayId}</span>
                    </p>
                    <p>
                      Date: <span className="font-bold text-on-surface">{displayDate}</span>
                    </p>
                    <p>
                      Payment:{" "}
                      <span className="font-bold text-on-surface uppercase">{order.paymentMethod || "Card"}</span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-xs px-md py-0.5 rounded-full text-xs font-bold ${badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-outline-variant/40">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2 flex justify-between text-body-sm text-on-surface-variant dark:text-surface-variant"
                    >
                      <div>
                        <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold text-on-surface">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Card Footer */}
                <div className="pt-sm border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                  <p className="text-body-sm text-on-surface-variant dark:text-surface-variant leading-tight max-w-md">
                    Shipping Destination:{" "}
                    <span className="font-semibold text-on-surface">{order.shippingAddress}</span>
                  </p>
                  <div className="text-right">
                    {/* Show breakdown if available */}
                    {order.subtotal != null && (
                      <div className="text-xs text-on-surface-variant space-y-0.5 mb-xs">
                        <div className="flex justify-end gap-sm">
                          <span>Subtotal</span>
                          <span className="font-medium text-on-surface">{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.shipping != null && (
                          <div className="flex justify-end gap-sm">
                            <span>Shipping</span>
                            <span className="font-medium text-on-surface">
                              {order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}
                            </span>
                          </div>
                        )}
                        {order.tax != null && (
                          <div className="flex justify-end gap-sm">
                            <span>GST</span>
                            <span className="font-medium text-on-surface">{formatCurrency(order.tax)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-body-sm text-on-surface-variant dark:text-surface-variant mr-sm">Grand Total:</span>
                    <span className="text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
                      {formatCurrency(order.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Rx verification status badge */}
                <div className="flex gap-2 items-center flex-wrap pt-sm">
                  {order.requiresRx ? (
                    <div className="inline-flex items-center gap-xs px-sm py-1 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-emerald-500">verified</span>
                      <span>Prescription Verified</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-xs px-sm py-1 bg-slate-105 text-slate-500 dark:bg-zinc-800 dark:text-zinc-450 border border-slate-200/50 dark:border-zinc-700/60 rounded text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]">gpp_good</span>
                      <span>No Prescription Required</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
