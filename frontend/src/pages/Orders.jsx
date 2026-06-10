import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Orders = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const data = await api.getUserOrders(user.email);
        setUserOrders(data);
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-max-width mx-auto px-margin-desktop py-xxl text-center">
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

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">Order History</h1>

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
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-md"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm pb-sm border-b border-outline-variant/60">
                <div className="flex flex-wrap gap-md items-center text-body-sm text-on-surface-variant dark:text-surface-variant">
                  <p>Order ID: <span className="font-bold text-on-surface">{order.id}</span></p>
                  <p>Date: <span className="font-bold text-on-surface">{order.date}</span></p>
                  <p>Payment: <span className="font-bold text-on-surface uppercase">{order.paymentMethod}</span></p>
                </div>
                <span className={`inline-flex items-center gap-xs px-md py-0.5 rounded-full text-xs font-bold ${
                  order.status === "Delivered"
                    ? "bg-secondary-container/30 text-on-secondary-container"
                    : order.status === "Processing"
                    ? "bg-primary-container/20 text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    order.status === "Delivered" ? "bg-secondary" : order.status === "Processing" ? "bg-primary" : "bg-outline"
                  }`}></span>
                  {order.status}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-outline-variant/40">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-body-sm text-on-surface-variant dark:text-surface-variant">
                    <div>
                      <span className="font-bold text-on-surface mr-sm">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="pt-sm border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                <p className="text-body-sm text-on-surface-variant dark:text-surface-variant leading-tight max-w-md">
                  Shipping Destination: <span className="font-semibold text-on-surface">{order.shippingAddress}</span>
                </p>
                <div className="text-right">
                  <span className="text-body-sm text-on-surface-variant dark:text-surface-variant mr-sm">Grand Total:</span>
                  <span className="text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
