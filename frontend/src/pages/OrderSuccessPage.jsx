import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { formatCurrency, roundPrice } from "../utils/currency";
import { formatDate } from "../utils/date";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import SEO from "../components/common/SEO";
import Loader from "../components/Loader";
import api from "../services/api";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ShieldCheck,
  FileText,
  MapPin,
  CreditCard,
  Clock,
  ArrowRight,
  ShoppingBag,
  Download,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Calendar,
  User,
  Hash,
  AlertCircle
} from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(() => location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;

    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get("orderId");

    if (orderIdParam) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await api.getOrderStatus(orderIdParam);
          if (res && res.success && res.order) {
            setOrder(res.order);
          } else {
            // Try fetching from user's my-orders list
            const myOrders = await api.getUserOrders();
            const found = (myOrders || []).find(
              (o) => o.orderId === orderIdParam || o.razorpayOrderId === orderIdParam || o._id === orderIdParam
            );
            if (found) {
              setOrder(found);
            }
          }
        } catch (err) {
          console.warn("Failed to load order on page refresh:", err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-grid py-24 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Fallback if accessed directly without location state or valid orderId
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-[fade-in_0.3s_ease-out]">
        <SEO title="Order Success" noindex={true} />
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-8 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-[#f4f9f7] dark:bg-zinc-950 text-[#157a6d] rounded-full flex items-center justify-center mx-auto border border-[#157a6d]/20">
            <ShoppingBag size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-white">
              No Order Found
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
              We couldn't locate your order confirmation details. Please check your order history or return to shopping.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/products"
              className="flex-1 bg-[#157a6d] hover:bg-[#0f5c52] text-white py-3 px-6 rounded-full font-semibold text-sm transition-all shadow-xs"
            >
              Explore Products
            </Link>
            <Link
              to="/profile?tab=orders"
              className="flex-1 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 py-3 px-6 rounded-full font-semibold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderId = order.orderId || order._id || order.id || "WELL-ORD";
  const orderItems = order.items || [];
  const requiresRx = order.requiresRx || order.rxUploaded || orderItems.some((i) => i.requiresRx);
  const paymentMethodLabel =
    order.paymentMethod === "cod"
      ? "Cash on Delivery"
      : order.paymentMethod === "upi"
      ? "UPI Instant Payment"
      : "Card Payment (Razorpay)";

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SEO title={`Order Confirmed ${orderId}`} noindex={true} />

      {/* ── 1. SUCCESS HERO SECTION ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#157a6d]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#b08d3e]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-4">
          {/* Animated Checkmark Badge */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-md">
              <CheckCircle2 size={48} className="animate-[scale-up_0.4s_ease-out]" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#157a6d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#157a6d]"></span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-[#b08d3e]" />
              <span>CLINICAL ORDER CONFIRMED</span>
              <Sparkles size={14} className="text-[#b08d3e]" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-sans">
              Thank you for choosing <span className="font-bold text-[#157a6d] dark:text-emerald-400">WellMeds Super Speciality Pharmacy</span>. Your order has been placed and queued for clinical dispatch.
            </p>
          </div>

          {/* Status Note Pill */}
          <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-zinc-800/80 px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-[#172b26] dark:text-zinc-200">
            <Clock size={15} className="text-[#157a6d] shrink-0" />
            <span>Updates will be sent via Email, SMS & WhatsApp</span>
          </div>
        </div>
      </div>

      {/* ── 2. VISUAL ORDER PROGRESS TIMELINE ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm mb-8">
        <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white mb-6">
          Order Status Tracker
        </h3>

        <div className="relative">
          {/* Timeline Steps */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {/* Step 1: Order Placed */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#157a6d] text-white flex items-center justify-center shadow-sm font-bold text-xs">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-[#172b26] dark:text-white">Order Placed</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Confirmed</p>
              </div>
            </div>

            {/* Step 2: Prescription Verification */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm font-bold text-xs ${
                  requiresRx
                    ? "bg-[#157a6d] text-white"
                    : "bg-emerald-100 dark:bg-emerald-950 text-[#157a6d] border border-emerald-200"
                }`}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-[#172b26] dark:text-white">
                  {requiresRx ? "Rx Verified" : "Rx Not Required"}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {requiresRx ? "Approved by Pharmacist" : "Skipped"}
                </p>
              </div>
            </div>

            {/* Step 3: Preparing Medicines */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#f4f9f7] dark:bg-zinc-800 text-[#157a6d] dark:text-emerald-400 border-2 border-[#157a6d] flex items-center justify-center shadow-sm animate-pulse">
                <PackageCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-[#172b26] dark:text-white">Preparing Supplies</p>
                <p className="text-[11px] text-[#157a6d] dark:text-emerald-400 font-semibold">In Progress</p>
              </div>
            </div>

            {/* Step 4: Quality Packed */}
            <div className="flex flex-col items-center text-center space-y-2 opacity-50">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-600 dark:text-zinc-400">Packed & Sealed</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Upcoming</p>
              </div>
            </div>

            {/* Step 5: Out for Delivery */}
            <div className="flex flex-col items-center text-center space-y-2 opacity-50 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                <Truck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-600 dark:text-zinc-400">Out for Dispatch</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Expected 24-48 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT GRID (2 COLUMNS) ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT COLUMN (70%) ── */}
        <div className="w-full lg:flex-1 space-y-6">

          {/* Card 1: Order Information Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#157a6d]" />
                <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white">
                  Order Details
                </h3>
              </div>
              <span className="font-clinical-mono text-xs font-bold text-[#157a6d] bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 dark:border-emerald-800/50 px-3 py-1 rounded-full">
                ID: {orderId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#f4f9f7]/50 dark:bg-zinc-800/40">
                <User size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Customer Name</p>
                  <p className="font-bold text-[#172b26] dark:text-white mt-0.5">{order.customer || "Valued Customer"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#f4f9f7]/50 dark:bg-zinc-800/40">
                <Calendar size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Order Date</p>
                  <p className="font-bold text-[#172b26] dark:text-white mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#f4f9f7]/50 dark:bg-zinc-800/40">
                <CreditCard size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Payment Method</p>
                  <p className="font-bold text-[#172b26] dark:text-white mt-0.5">{paymentMethodLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#f4f9f7]/50 dark:bg-zinc-800/40">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Payment Status</p>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Paid & Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Shipping Address Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-zinc-800 mb-4">
              <MapPin size={20} className="text-[#157a6d]" />
              <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white">
                Delivery Address
              </h3>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <p className="font-bold text-[#172b26] dark:text-white text-base">
                {order.shippingAddressObject?.fullName || order.customer || "Recipient"}
              </p>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                {order.shippingAddress || "Registered Delivery Address"}
              </p>
              {order.shippingAddressObject?.phone && (
                <p className="text-xs text-slate-500 font-mono pt-1">
                  Contact: {order.shippingAddressObject.phone}
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Prescription Card (If Rx medicines included) */}
          {requiresRx && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-[24px] p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      Prescription Verified ✓
                    </h4>
                    <span className="bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                    Verified & approved by licensed WellMeds Pharmacist.
                  </p>
                  {order.rxFile && (
                    <div className="pt-2">
                      <a
                        href={order.rxFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#157a6d] dark:text-emerald-400 hover:underline bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs"
                      >
                        <FileText size={14} />
                        <span className="truncate max-w-[200px]">{order.rxFile.split("/").pop() || "Prescription Document"}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Ordered Items (Mini-Cards) */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white">
                Items Ordered ({orderItems.length})
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Packed in Cold Storage / Sealed Packs
              </span>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, idx) => {
                const isRx = item.requiresRx || item.isPrescriptionRequired;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#f4f9f7]/60 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-4 transition-colors hover:bg-[#f4f9f7]"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={item.image || DEFAULT_PRODUCT_IMAGE}
                          alt={item.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-sm text-[#172b26] dark:text-white truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                          <span className="bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                            Qty: {item.quantity}
                          </span>
                          {isRx && (
                            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-purple-200">
                              Rx Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-[#172b26] dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400">
                          {formatCurrency(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Sticky Sidebar (30%) ── */}
        <div className="w-full lg:w-[360px] shrink-0 sticky top-24 space-y-6">

          {/* Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <h3 className="font-editorial text-lg font-semibold text-[#172b26] dark:text-white pb-3 border-b border-slate-100 dark:border-zinc-800">
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#172b26] dark:text-zinc-200">
                  {formatCurrency(order.subtotal || order.total)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-[#172b26] dark:text-zinc-200">
                  {order.shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(order.shipping || 0)
                  )}
                </span>
              </div>

              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>GST (12%)</span>
                  <span className="font-medium text-[#172b26] dark:text-zinc-200">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-baseline font-bold text-lg text-[#172b26] dark:text-white">
                <span>Total Paid</span>
                <span className="text-[#157a6d] dark:text-emerald-400 font-editorial text-2xl">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                to="/profile?tab=orders"
                className="w-full bg-[#157a6d] hover:bg-[#0f5c52] text-white py-3.5 px-6 rounded-full font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
              >
                <PackageCheck size={18} />
                <span>Track Order</span>
              </Link>

              <Link
                to="/products"
                className="w-full bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 py-3.5 px-6 rounded-full font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700"
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={handlePrintInvoice}
                className="w-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Print / Download Invoice</span>
              </button>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#f4f9f7] dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#157a6d]" />
              <h4 className="font-bold text-sm text-[#172b26] dark:text-white">
                Need Assistance?
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Our clinical care team is available 24/7 for any queries regarding your prescription or order status.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs font-bold text-[#157a6d] dark:text-emerald-400">
              <a href="tel:+919876543210" className="flex items-center gap-1 hover:underline">
                <Phone size={14} /> Call Support
              </a>
              <span>•</span>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <MessageSquare size={14} /> WhatsApp
              </a>
            </div>
          </div>

        </div>

      </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
