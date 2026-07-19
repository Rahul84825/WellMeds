import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

// Status style mapping helper
const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50", dot: "bg-emerald-500" };
    case "Processing":
    case "Approved":
    case "Confirmed":
    case "Packed":
      return { badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50", dot: "bg-indigo-500" };
    case "Shipped":
      return { badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50", dot: "bg-blue-500" };
    case "Cancelled":
      return { badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50", dot: "bg-rose-500" };
    case "Prescription Review":
      return { badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50", dot: "bg-amber-500" };
    default:
      return { badge: "bg-slate-55 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50", dot: "bg-slate-400" };
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

  // Client-side printer/download helper
  const handleDownloadInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const invoiceHtml = `
      <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 30px; line-height: 1.5; }
          .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #038076; padding-bottom: 15px; }
          .logo { font-size: 28px; font-weight: bold; color: #038076; }
          .invoice-title { font-size: 22px; font-weight: 800; text-align: right; color: #555; }
          .details { margin: 30px 0; display: flex; justify-content: space-between; font-size: 13px; }
          .details-col { width: 48%; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 13px; }
          .table th { background-color: #f7f9f9; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
          .totals { text-align: right; margin-top: 30px; font-size: 13px; border-top: 1px solid #eee; padding-top: 15px; }
          .totals div { margin: 6px 0; }
          .totals-grand { font-size: 16px; font-weight: bold; color: #038076; margin-top: 12px !important; }
          .footer { margin-top: 50px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <div class="logo">WellMeds Pharmacy</div>
              <p style="font-size: 10px; color: #666; margin: 2px 0 0 0;">Licensed Patient Care Healthcare Provider</p>
            </div>
            <div class="invoice-title">TAX INVOICE</div>
          </div>
          
          <div class="details">
            <div class="details-col">
              <strong style="color: #555; font-size: 14px;">Billed To:</strong>
              <p style="margin: 5px 0 0 0;">
                ${order.customer}<br>
                ${order.email}<br>
                ${order.shippingAddress}
              </p>
            </div>
            <div class="details-col" style="text-align: right;">
              <strong style="color: #555; font-size: 14px;">Invoice Metadata:</strong>
              <p style="margin: 5px 0 0 0;">
                <strong>Invoice No:</strong> ${order.orderId}<br>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}<br>
                <strong>Payment Type:</strong> ${order.paymentMethod.toUpperCase()}<br>
                <strong>Payment Status:</strong> ${order.paymentStatus}<br>
                ${order.razorpayPaymentId ? `<strong>Transaction ID:</strong> ${order.razorpayPaymentId}<br>` : ""}
              </p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Medicine / Product Details</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Unit Price</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: ₹${(order.subtotal || order.total).toFixed(2)}</div>
            ${order.discountAmount ? `<div>Discount: -₹${order.discountAmount.toFixed(2)}</div>` : ""}
            <div>Shipping charges: ₹${(order.shipping || 0).toFixed(2)}</div>
            <div>GST (12%): ₹${(order.tax || 0).toFixed(2)}</div>
            <div class="totals-grand">Grand Total: ₹${(order.total || 0).toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>This document is digitally generated on checkout confirmation. No physical signature required.</p>
            <p>For support, contact support@wellmeds.com or Toll Free +1 (800) 555-0199</p>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  // Render a clean progress stepper path
  const renderOrderTimeline = (status) => {
    const steps = [
      { key: "Pending", label: "Ordered", icon: Clock },
      { key: "Processing", label: "Verified", icon: ShieldCheck },
      { key: "Packed", label: "Packed", icon: Package },
      { key: "Shipped", label: "Shipped", icon: Truck },
      { key: "Delivered", label: "Delivered", icon: CheckCircle2 }
    ];

    // Find active step index
    let activeIndex = 0;
    if (status === "Cancelled") {
      return (
        <div className="flex items-center gap-xs text-rose-500 font-bold text-xs select-none">
          <XCircle size={16} />
          <span>This order has been cancelled</span>
        </div>
      );
    }
    
    if (status === "Returned") {
      return (
        <div className="flex items-center gap-xs text-orange-500 font-bold text-xs select-none">
          <RefreshCw size={16} />
          <span>This order has been returned</span>
        </div>
      );
    }

    if (status === "Prescription Review") activeIndex = 0;
    else if (status === "Processing" || status === "Approved" || status === "Confirmed") activeIndex = 1;
    else if (status === "Packed") activeIndex = 2;
    else if (status === "Shipped") activeIndex = 3;
    else if (status === "Delivered") activeIndex = 4;

    return (
      <div className="w-full pt-2 pb-1 relative select-none">
        <div className="flex items-center justify-between w-full relative">
          {/* Connector Line */}
          <div className="absolute top-[14px] left-[5%] right-[5%] h-0.5 bg-slate-200 dark:bg-zinc-800 z-0"></div>
          <div 
            className="absolute top-[14px] left-[5%] h-0.5 bg-primary dark:bg-primary-fixed-dim transition-all duration-300 z-0"
            style={{ width: `${activeIndex * 22.5}%` }}
          ></div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 w-16">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                    isCompleted 
                      ? "bg-primary border-primary text-white" 
                      : isActive 
                      ? "bg-white border-primary text-primary dark:bg-zinc-900" 
                      : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
                  }`}
                >
                  <Icon size={13} />
                </div>
                <span className={`text-[9px] font-bold ${isActive ? "text-primary font-black" : "text-slate-450 dark:text-zinc-500"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
    <div className="max-w-7xl mx-auto px-4 py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
      <div>
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 mb-xs">Order History</h1>
        <p className="text-xs text-slate-450 dark:text-zinc-450 font-bold">
          {userOrders.length} order{userOrders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
          <span className="material-symbols-outlined text-5xl text-outline mb-md">shopping_bag</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No Orders Found</h3>
          <p className="font-body-sm text-on-surface-variant dark:text-surface-variant mt-xs">
            You haven't placed any orders with this account yet.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {userOrders.map((order) => {
            const displayId = order.orderId;
            const displayDate = formatDate(order.createdAt);
            const { badge: badgeClass, dot: dotClass } = getStatusStyle(order.status);

            return (
              <div
                key={displayId}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-xs space-y-lg relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md pb-md border-b border-slate-100 dark:border-zinc-850">
                  <div className="flex flex-wrap gap-x-lg gap-y-xs text-xs text-slate-450 dark:text-zinc-450 font-semibold">
                    <p>
                      Order ID:{" "}
                      <span className="font-bold text-slate-700 dark:text-zinc-200 font-mono">{displayId}</span>
                    </p>
                    <p>
                      Date: <span className="font-bold text-slate-700 dark:text-zinc-200">{displayDate}</span>
                    </p>
                    <p className="flex items-center gap-xs">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-zinc-200 uppercase">{order.paymentMethod}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-xs flex-wrap">
                    {/* Invoice Download Action Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order)}
                      className="inline-flex items-center gap-xs px-sm py-1 border border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-primary dark:text-[#a4c9ff] transition-all cursor-pointer shadow-xs select-none"
                    >
                      <Download size={13} />
                      <span>Invoice</span>
                    </button>
                    
                    <span
                      className={`inline-flex items-center gap-xs px-md py-1 border rounded-full text-xs font-bold ${badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Stepper Timeline Progress */}
                <div className="bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850 rounded-2xl p-md">
                  {renderOrderTimeline(order.status)}
                </div>

                {/* Items & Shipping row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-md pt-sm">
                  
                  {/* Items List (60%) */}
                  <div className="lg:col-span-7 divide-y divide-slate-100 dark:divide-zinc-850/60 pr-lg">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 flex justify-between items-center text-xs text-slate-655 dark:text-zinc-350"
                      >
                        <div className="flex items-center gap-xs">
                          <FileText className="text-slate-400 shrink-0" size={14} />
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Destination & Prices (40%) */}
                  <div className="lg:col-span-5 bg-slate-50/30 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-850/65 rounded-2xl p-md space-y-sm text-xs">
                    <div className="space-y-xs">
                      <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Deliver to:</p>
                      <div className="flex gap-xs items-start text-slate-600 dark:text-zinc-300">
                        <MapPin size={13} className="text-[#038076] shrink-0 mt-0.5" />
                        <p className="leading-tight break-words">{order.shippingAddress}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-150 dark:border-zinc-850 pt-sm space-y-1">
                      {order.subtotal != null && (
                        <div className="flex justify-between text-slate-500 dark:text-zinc-450">
                          <span>Subtotal</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{formatCurrency(order.subtotal)}</span>
                        </div>
                      )}
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-red-500 font-semibold">
                          <span>Coupon Discount</span>
                          <span>-{formatCurrency(order.discountAmount)}</span>
                        </div>
                      )}
                      {order.shipping != null && (
                        <div className="flex justify-between text-slate-500 dark:text-zinc-455">
                          <span>Shipping charges</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            {order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}
                          </span>
                        </div>
                      )}
                      {order.tax != null && (
                        <div className="flex justify-between text-slate-500 dark:text-zinc-455">
                          <span>GST (12%)</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{formatCurrency(order.tax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-150 dark:border-zinc-850 pt-xs font-bold text-sm text-slate-800 dark:text-zinc-100">
                        <span>Grand Total</span>
                        <span className="text-primary dark:text-[#a4c9ff]">{formatCurrency(order.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Verified Gateway Transactions Badge */}
                <div className="flex gap-md items-center justify-between flex-wrap pt-sm border-t border-slate-100 dark:border-zinc-850">
                  <div className="flex gap-xs items-center">
                    {order.requiresRx ? (
                      <div className="inline-flex items-center gap-xs px-sm py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/25 rounded text-[10px] font-bold shadow-xs">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span>Prescription Verified</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-xs px-sm py-1 bg-slate-50 text-slate-500 dark:bg-zinc-800 dark:text-zinc-450 border border-slate-200/50 dark:border-zinc-700/60 rounded text-[10px] font-bold">
                        <ShieldCheck size={11} className="text-slate-400" />
                        <span>OTC (No Rx Required)</span>
                      </div>
                    )}

                    {order.paymentMethod !== "cod" && order.razorpayPaymentId && (
                      <div className="inline-flex items-center gap-xs px-sm py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-250/20 rounded text-[10px] font-bold">
                        <ShieldCheck size={11} className="text-indigo-600" />
                        <span>Verified Gateway</span>
                      </div>
                    )}
                  </div>

                  {order.paymentMethod !== "cod" && order.razorpayPaymentId && (
                    <span className="text-[10px] text-slate-450 font-semibold font-mono">
                      TXN ID: {order.razorpayPaymentId}
                    </span>
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
