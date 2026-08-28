import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/Modal";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { AdminCard, AdminCardHeader } from "./components/ui/AdminCard";
import { AdminBadge } from "./components/ui/AdminBadge";
import { AdminButton } from "./components/ui/AdminButton";
import { AdminInput, AdminSelect } from "./components/ui/AdminInput";
import GoogleMapPicker from "../components/common/GoogleMapPicker";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableHeaderCell
} from "./components/ui/AdminTable";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Eye,
  X,
  CreditCard,
  MapPin,
  FileCheck2,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
  Clock,
  Phone,
  Mail,
  FileText,
  Navigation,
  Copy,
  ExternalLink
} from "lucide-react";

/**
 * Status Badge Helper with 100% Medical Aesthetic
 */
const renderStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return <AdminBadge variant="success">Delivered</AdminBadge>;
  if (s.includes("shipped") || s.includes("out for delivery")) return <AdminBadge variant="info">Shipped</AdminBadge>;
  if (s.includes("packed") || s.includes("ready")) return <AdminBadge variant="purple">Packed</AdminBadge>;
  if (s.includes("approved") || s.includes("verified")) return <AdminBadge variant="info">Approved</AdminBadge>;
  if (s.includes("cancel") || s.includes("reject")) return <AdminBadge variant="danger">Cancelled</AdminBadge>;
  if (s.includes("review") || s.includes("prescription")) return <AdminBadge variant="warning">Rx Review</AdminBadge>;
  return <AdminBadge variant="warning">Pending</AdminBadge>;
};

const renderPaymentBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("paid")) return <AdminBadge variant="success">Paid</AdminBadge>;
  if (s.includes("refund")) return <AdminBadge variant="purple">Refunded</AdminBadge>;
  if (s.includes("failed")) return <AdminBadge variant="danger">Failed</AdminBadge>;
  return <AdminBadge variant="warning">Unpaid</AdminBadge>;
};

const renderRxBadge = (rxUploaded, status) => {
  if (!rxUploaded) return <AdminBadge variant="neutral">OTC Free</AdminBadge>;
  const s = (status || "").toLowerCase();
  if (s.includes("approved")) return <AdminBadge variant="success">Rx Verified</AdminBadge>;
  if (s.includes("reject")) return <AdminBadge variant="danger">Rx Rejected</AdminBadge>;
  return <AdminBadge variant="warning">Rx Review Pending</AdminBadge>;
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order for Right Drawer or Invoice Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder._id === orderId)) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Status Counts for Tab Badges
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    orders.forEach((o) => {
      const st = o.status || "Pending";
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.customer?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (rxFilter !== "All") {
      const rxUploadedValue = rxFilter === "yes";
      result = result.filter((o) => o.rxUploaded === rxUploadedValue);
    }

    return result;
  }, [orders, searchQuery, statusFilter, rxFilter]);

  // Reset page on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rxFilter]);

  // Paginated items
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));

  const handlePrintInvoice = () => {
    window.print();
  };

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const closeOrderDrawer = () => {
    setDrawerOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out] text-left">
      {/* ── HEADER TITLE & VIEW TOGGLE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <h1 className="font-semibold text-xl text-slate-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
            <ClipboardList className="text-[#157a6d]" size={22} />
            <span>Order Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-normal">
            Inspect customer orders, verify prescriptions, manage dispatch pipeline, and issue invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Management Cards
            </button>
          </div>
          <AdminButton variant="secondary" size="sm" onClick={fetchOrders}>
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* ── STATUS TABS BAR ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 border-b border-slate-200/60 dark:border-zinc-800">
        {["All", "Pending", "Prescription Review", "Approved", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => {
          const count = statusCounts[st] || 0;
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#157a6d] text-white shadow-2xs"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{st}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH & STICKY TOOLBAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="md:col-span-2">
          <AdminInput
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <AdminSelect
            value={rxFilter}
            onChange={(e) => setRxFilter(e.target.value)}
          >
            <option value="All">All Prescription Types</option>
            <option value="yes">Rx Attached</option>
            <option value="no">OTC (No Rx)</option>
          </AdminSelect>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            className="w-full text-xs"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setRxFilter("All");
            }}
          >
            Clear Filters
          </AdminButton>
        </div>
      </div>

      {/* ── VIEW MODE 1: MANAGEMENT CARDS LAYOUT ── */}
      {viewMode === "cards" ? (
        <div className="space-y-3">
          {paginatedOrders.map((o) => {
            const paidVal = o.finalAmount || o.total;
            const itemCount = o.items?.length || 0;
            return (
              <AdminCard key={o.orderId} className="hover:border-[#157a6d]/40 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                  {/* Left Column: Customer & Order Identity */}
                  <div className="space-y-1 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono text-sm">
                        {o.orderId}
                      </span>
                      <span className="text-slate-400 text-[11px] font-normal">
                        • {formatDate(o.createdAt)}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 dark:text-zinc-200">{o.customer}</p>
                    <p className="text-[11px] text-slate-400 font-normal truncate">{o.email}</p>
                  </div>

                  {/* Center Column: Order Details & Address */}
                  <div className="space-y-1 text-slate-600 dark:text-zinc-300 max-w-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{itemCount} Product Items</span>
                      <span>•</span>
                      {renderRxBadge(o.rxUploaded, o.status)}
                      <span>•</span>
                      {renderPaymentBadge(o.paymentStatus)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate" title={o.shippingAddress}>
                        {o.shippingAddress}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Amount, Status & Actions */}
                  <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                    <div className="text-left lg:text-right">
                      <p className="font-semibold text-base text-slate-900 dark:text-zinc-100">
                        {formatCurrency(paidVal)}
                      </p>
                      {renderStatusBadge(o.status)}
                    </div>

                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => openOrderDrawer(o)}
                      >
                        View Drawer
                      </AdminButton>
                      <AdminButton
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(o);
                          setInvoiceModalOpen(true);
                        }}
                        title="Print Invoice"
                      >
                        <Printer size={15} />
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </AdminCard>
            );
          })}

          {filteredOrders.length === 0 && (
            <AdminCard className="text-center py-12 text-slate-400">
              No customer orders match the criteria.
            </AdminCard>
          )}
        </div>
      ) : (
        /* ── VIEW MODE 2: TABLE LAYOUT ── */
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Order ID</AdminTableHeaderCell>
              <AdminTableHeaderCell>Date</AdminTableHeaderCell>
              <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
              <AdminTableHeaderCell>Amount</AdminTableHeaderCell>
              <AdminTableHeaderCell>Payment</AdminTableHeaderCell>
              <AdminTableHeaderCell>Prescription</AdminTableHeaderCell>
              <AdminTableHeaderCell>Pipeline Status</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Actions</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {paginatedOrders.map((o) => {
              const paidVal = o.finalAmount || o.total;
              return (
                <AdminTableRow key={o.orderId}>
                  <AdminTableCell className="font-semibold text-slate-800 dark:text-zinc-100 font-mono text-xs">
                    {o.orderId}
                  </AdminTableCell>
                  <AdminTableCell className="text-slate-500 font-normal">
                    {formatDate(o.createdAt)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{o.customer}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">
                      {o.email}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell className="font-semibold text-slate-800 dark:text-zinc-100">
                    {formatCurrency(paidVal)}
                    {o.discountAmount > 0 && (
                      <span className="block text-[9px] text-emerald-600 font-medium">
                        -{formatCurrency(o.discountAmount)} Off
                      </span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>{renderPaymentBadge(o.paymentStatus)}</AdminTableCell>
                  <AdminTableCell>{renderRxBadge(o.rxUploaded, o.status)}</AdminTableCell>
                  <AdminTableCell>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                      className="text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-700 py-1 px-2.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-[#157a6d] transition-all cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Prescription Review">Prescription Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <AdminButton
                        variant="ghost"
                        size="icon"
                        onClick={() => openOrderDrawer(o)}
                        title="Open Order Details Drawer"
                      >
                        <Eye size={15} />
                      </AdminButton>
                      <AdminButton
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(o);
                          setInvoiceModalOpen(true);
                        }}
                        title="Print Invoice"
                      >
                        <Printer size={15} />
                      </AdminButton>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}

            {filteredOrders.length === 0 && (
              <AdminTableRow>
                <AdminTableCell colSpan={8} align="center" className="py-12 text-slate-400">
                  No orders match your criteria.
                </AdminTableCell>
              </AdminTableRow>
            )}
          </AdminTableBody>
        </AdminTable>
      )}

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl text-xs font-normal text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </span>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={15} />
            </AdminButton>
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={15} />
            </AdminButton>
          </div>
        </div>
      )}

      {/* ── RIGHT-SIDE SLIDE-OVER ORDER DETAILS DRAWER ── */}
      {drawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-[fade-in_0.2s_ease-out]"
            onClick={closeOrderDrawer}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-[slide-in-right_0.25s_ease-out] text-left">
            {/* Header Sticky */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-base text-slate-900 dark:text-zinc-100 font-mono">
                  {selectedOrder.orderId}
                </h2>
                {renderStatusBadge(selectedOrder.status)}
              </div>
              <button
                onClick={closeOrderDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* 1. Customer & Shipping Address Card */}
              <AdminCard>
                <AdminCardHeader title="Customer & Delivery Information" />
                <div className="space-y-2 text-slate-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedOrder.customer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={15} className="text-slate-400" />
                    <span>{selectedOrder.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-500 pt-1">
                    <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{selectedOrder.shippingAddress}</span>
                  </div>

                  {/* Google Maps Distance Matrix & Interactive Map View */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#157a6d] dark:text-emerald-400 flex items-center gap-1">
                        <Navigation size={13} />
                        Road Distance: {selectedOrder.shippingAddressObject?.distanceKm || "Calculated"} km
                      </span>
                      {selectedOrder.shippingAddressObject?.estimatedTimeMinutes && (
                        <span className="text-slate-400 font-semibold">
                          Est: {selectedOrder.shippingAddressObject.estimatedTimeMinutes} mins
                        </span>
                      )}
                    </div>

                    <GoogleMapPicker
                      latitude={selectedOrder.shippingAddressObject?.latitude}
                      longitude={selectedOrder.shippingAddressObject?.longitude}
                      height="160px"
                      interactive={false}
                      showRoute={true}
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${
                          selectedOrder.shippingAddressObject?.latitude || 18.559
                        },${selectedOrder.shippingAddressObject?.longitude || 73.7868}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white text-xs font-bold transition-all"
                      >
                        <ExternalLink size={13} /> Open in Google Maps
                      </a>
                      {selectedOrder.shippingAddressObject?.latitude && (
                        <button
                          type="button"
                          onClick={() => {
                            const coords = `${selectedOrder.shippingAddressObject.latitude},${selectedOrder.shippingAddressObject.longitude}`;
                            navigator.clipboard.writeText(coords);
                            alert(`Coordinates copied: ${coords}`);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={13} /> Copy Coords
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </AdminCard>

              {/* 2. Prescription Verification Card */}
              <AdminCard>
                <AdminCardHeader title="Prescription Verification Status" />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileCheck2 size={24} className="text-[#157a6d]" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-zinc-100">
                        {selectedOrder.rxUploaded ? "Prescription Attached" : "OTC Free Order"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedOrder.rxUploaded
                          ? "Patient attached a valid prescription during checkout."
                          : "No prescription required for OTC medicine items."}
                      </p>
                    </div>
                  </div>
                  {renderRxBadge(selectedOrder.rxUploaded, selectedOrder.status)}
                </div>
              </AdminCard>

              {/* 3. Ordered Products Table Card */}
              <AdminCard noPadding>
                <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 font-semibold text-slate-800 dark:text-zinc-100">
                  Ordered Products ({selectedOrder.items?.length || 0})
                </div>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                          <ShoppingBag size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-zinc-100">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {formatCurrency(item.quantity * item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* 3.5. Pricing & Packaging Breakdown Card */}
              <AdminCard>
                <AdminCardHeader title="Order Pricing Breakdown" />
                <div className="space-y-2 text-slate-700 dark:text-zinc-300">
                  <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Coupon Discount ({selectedOrder.couponCode || "Applied"}):</span>
                      <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                    <span>Delivery Fee:</span>
                    <span className={selectedOrder.shipping === 0 || selectedOrder.deliveryFee === 0 ? "text-emerald-600 font-bold" : "font-medium text-slate-900 dark:text-zinc-100"}>
                      {selectedOrder.shipping === 0 || selectedOrder.deliveryFee === 0 ? "FREE" : formatCurrency(selectedOrder.deliveryFee || selectedOrder.shipping || 99)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                    <span>Handling & Packaging:</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedOrder.packaging?.name ? `${selectedOrder.packaging.name} — ${formatCurrency(selectedOrder.packaging.price)}` : "Regular Packaging — ₹19"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-150 dark:border-zinc-800 pt-2 font-bold text-sm text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-[#157a6d] dark:text-emerald-400 text-base">{formatCurrency(selectedOrder.finalAmount || selectedOrder.total)}</span>
                  </div>
                </div>
              </AdminCard>

              {/* 4. Vertical Timeline Card */}
              <AdminCard>
                <AdminCardHeader title="Order Timeline Lifecycle" />
                <div className="relative border-l-2 border-slate-200 dark:border-zinc-800 pl-4 ml-2 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 h-3.5 w-3.5 rounded-full bg-[#157a6d] border-2 border-white dark:border-zinc-900" />
                    <p className="font-medium text-slate-900 dark:text-zinc-100">Order Placed & Logged</p>
                    <p className="text-[11px] text-slate-400">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="relative">
                    <span
                      className={`absolute -left-[21px] top-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        ["Approved", "Packed", "Shipped", "Delivered"].includes(selectedOrder.status)
                          ? "bg-[#157a6d]"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                    />
                    <p className="font-medium text-slate-900 dark:text-zinc-100">Prescription Verification</p>
                    <p className="text-[11px] text-slate-400">
                      {selectedOrder.rxUploaded ? "Attached prescription check verified." : "OTC Free item."}
                    </p>
                  </div>
                  <div className="relative">
                    <span
                      className={`absolute -left-[21px] top-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        ["Packed", "Shipped", "Delivered"].includes(selectedOrder.status)
                          ? "bg-[#157a6d]"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                    />
                    <p className="font-medium text-slate-900 dark:text-zinc-100">Packed & Dispensed</p>
                  </div>
                  <div className="relative">
                    <span
                      className={`absolute -left-[21px] top-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        selectedOrder.status === "Delivered"
                          ? "bg-[#157a6d]"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                    />
                    <p className="font-medium text-slate-900 dark:text-zinc-100">Home Delivery Completed</p>
                  </div>
                </div>
              </AdminCard>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedOrder.orderId, "Approved")}
                >
                  Approve Order
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedOrder.orderId, "Packed")}
                >
                  Mark Packed
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedOrder.orderId, "Shipped")}
                >
                  Dispatch Ship
                </AdminButton>
              </div>

              <div className="flex items-center gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => {
                    setInvoiceModalOpen(true);
                  }}
                >
                  Print Invoice
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE POPUP MODAL ── */}
      <Modal
        isOpen={!!(selectedOrder && invoiceModalOpen)}
        onClose={() => setInvoiceModalOpen(false)}
        title="Generate Order Invoice"
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="font-semibold text-base text-[#157a6d]">WELLMEDS INVOICE</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    WellMeds Pharmacy Retailers Private Limited<br />
                    Lic No: DL-293/B-10293
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-semibold bg-slate-200 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-slate-800 dark:text-zinc-100">
                    {selectedOrder.orderId}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                    Billed To
                  </p>
                  <p className="font-medium text-slate-800 dark:text-zinc-100">
                    {selectedOrder.customer}
                  </p>
                  <p className="text-slate-500">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                    Shipping Address
                  </p>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-slate-200 dark:border-zinc-800 py-3 space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Product Description</span>
                  <div className="flex gap-8">
                    <span>Qty</span>
                    <span className="w-16 text-right">Price</span>
                  </div>
                </div>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-zinc-200">
                    <span className="font-medium truncate max-w-[280px]">{item.name}</span>
                    <div className="flex gap-8 shrink-0">
                      <span className="text-slate-400">x{item.quantity}</span>
                      <span className="w-16 text-right font-medium">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 w-64 ml-auto text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee:</span>
                  <span className={selectedOrder.shipping === 0 || selectedOrder.deliveryFee === 0 ? "text-emerald-600 font-semibold" : "font-medium"}>
                    {selectedOrder.shipping === 0 || selectedOrder.deliveryFee === 0 ? "FREE" : formatCurrency(selectedOrder.deliveryFee || selectedOrder.shipping || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Handling & Packaging:</span>
                  <span className="font-medium">
                    {selectedOrder.packaging?.name ? `${selectedOrder.packaging.name} (${formatCurrency(selectedOrder.packaging.price)})` : "Regular Packaging (₹19)"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-zinc-800 pt-2 font-semibold text-sm text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="text-[#157a6d]">{formatCurrency(selectedOrder.finalAmount || selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
              <AdminButton variant="secondary" onClick={() => setInvoiceModalOpen(false)}>
                Close
              </AdminButton>
              <AdminButton icon={Printer} onClick={handlePrintInvoice}>
                Print Invoice
              </AdminButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrders;
