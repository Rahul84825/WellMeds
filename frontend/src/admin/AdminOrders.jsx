import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/Modal";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  TrendingUp,
  X,
  CreditCard,
  MapPin,
  Tag
} from "lucide-react";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order for Invoice or Detail Review
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
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
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update order status.");
    }
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderId?.toLowerCase().includes(q) || 
        o.customer?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(o => o.status === statusFilter);
    }

    if (rxFilter !== "All") {
      const rxUploadedValue = rxFilter === "yes";
      result = result.filter(o => o.rxUploaded === rxUploadedValue);
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <ClipboardList className="text-[#004782]" />
          Orders Management
        </h1>
        <p className="text-xs text-slate-400 font-medium">Verify customer payment status, inspect attached prescriptions, update packaging status, and print invoices.</p>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-sm bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by Order ID, Patient name, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Order States</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Prescription Review">Prescription Review</option>
            <option value="Approved">Approved</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Rx */}
        <div className="relative">
          <select
            value={rxFilter}
            onChange={(e) => setRxFilter(e.target.value)}
            className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Prescription Types</option>
            <option value="yes">Rx Attached</option>
            <option value="no">OTC (No Rx)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Order ID</th>
                <th className="p-md">Date</th>
                <th className="p-md">Customer</th>
                <th className="p-md">Final Amount</th>
                <th className="p-md">Payment</th>
                <th className="p-md">Rx Sheet</th>
                <th className="p-md">Timeline Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {paginatedOrders.map((o) => {
                const paidVal = o.finalAmount || o.total;
                return (
                  <tr key={o.orderId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-md font-bold text-slate-800 dark:text-zinc-100 font-mono text-xs">{o.orderId}</td>
                    <td className="p-md">{formatDate(o.createdAt)}</td>
                    <td className="p-md">
                      <p className="font-bold text-slate-800 dark:text-zinc-100">{o.customer}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[155px]">{o.email}</p>
                    </td>
                    <td className="p-md font-black text-slate-800 dark:text-zinc-100">
                      {formatCurrency(paidVal)}
                      {o.discountAmount > 0 && (
                        <span className="block text-[9px] text-red-500 font-bold" title={o.couponCode}>
                          -{formatCurrency(o.discountAmount)} Off
                        </span>
                      )}
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        o.paymentStatus === "Paid" 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                          : o.paymentStatus === "Failed"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                          : "bg-slate-100 text-slate-500 dark:bg-zinc-800"
                      }`}>
                        {o.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="p-md">
                      {o.rxUploaded ? (
                        <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg text-[10px] font-bold">
                          Attached
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-zinc-700 text-[10px]">OTC Free</span>
                      )}
                    </td>
                    <td className="p-md">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                        className={`text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-800 py-1 pl-2 pr-6 cursor-pointer dark:bg-zinc-950 outline-none ${
                          o.status === "Delivered"
                            ? "bg-emerald-50 text-[#086b53] border-emerald-200"
                            : o.status === "Processing" || o.status === "Approved"
                            ? "bg-[#004782]/5 text-[#004782] border-blue-200"
                            : o.status === "Cancelled"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-slate-50 text-slate-600"
                        }`}
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
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setDetailModalOpen(true);
                          }}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg"
                          title="View Order Timeline & Address Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setInvoiceModalOpen(true);
                          }}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] rounded-lg"
                          title="Generate invoice"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-lg text-center text-slate-400">No customer orders match the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-zinc-800/85">
          {paginatedOrders.map((o) => {
            const paidVal = o.finalAmount || o.total;
            return (
              <div key={o.orderId} className="p-md space-y-sm text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold font-mono text-slate-800 dark:text-zinc-100">{o.orderId}</span>
                  <span className="text-slate-450 dark:text-zinc-500 text-[10px]">{formatDate(o.createdAt)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-xs border-t border-slate-100 dark:border-zinc-800/60">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">{o.customer}</p>
                    <p className="text-[10px] text-slate-400">{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-800 dark:text-zinc-100">{formatCurrency(paidVal)}</p>
                    {o.discountAmount > 0 && (
                      <p className="text-[9px] text-red-500 font-bold">-{formatCurrency(o.discountAmount)} Off</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-xs items-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                    o.paymentStatus === "Paid" 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                      : o.paymentStatus === "Failed"
                      ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                      : "bg-slate-100 text-slate-500 dark:bg-zinc-800"
                  }`}>
                    {o.paymentStatus || "Pending"}
                  </span>

                  {o.rxUploaded ? (
                    <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg text-[9px] font-bold">
                      Rx Attached
                    </span>
                  ) : (
                    <span className="text-slate-405 text-[9px] bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-zinc-800">OTC Free</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-xs">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                    className={`text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-800 py-1.5 pl-2 pr-6 cursor-pointer dark:bg-zinc-950 outline-none ${
                      o.status === "Delivered"
                        ? "bg-emerald-50 text-[#086b53] border-emerald-200"
                        : o.status === "Processing" || o.status === "Approved"
                        ? "bg-[#004782]/5 text-[#004782] border-blue-200"
                        : o.status === "Cancelled"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-slate-50 text-slate-600"
                    }`}
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

                  <div className="flex items-center gap-sm">
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setDetailModalOpen(true);
                      }}
                      className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-100 dark:border-zinc-800"
                      title="View Timeline"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setInvoiceModalOpen(true);
                      }}
                      className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-100 dark:border-zinc-800"
                      title="Generate Invoice"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <p className="p-lg text-center text-slate-455">No customer orders match the criteria.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-zinc-950 px-md py-sm border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-400 select-none">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders</span>
            <div className="flex items-center gap-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-sm text-slate-700 dark:text-zinc-300">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-xs border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice modal popup */}
      <Modal
        isOpen={!!(selectedOrder && invoiceModalOpen)}
        onClose={() => setInvoiceModalOpen(false)}
        title="Generate Order Invoice"
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <>
            {/* Print Area */}
            <div className="space-y-md text-xs p-sm bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800 rounded-2xl print:bg-transparent print:border-none pt-1">
                  
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-sm">
                    <div>
                      <h4 className="font-black text-base text-[#004782] dark:text-[#a4c9ff]">WELLMEDS INVOICE</h4>
                      <p className="text-[10px] text-slate-400 mt-xs leading-snug">
                        WellMeds Retailers Private Limited<br />
                        Lic No: DL-293/B-10293
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 dark:text-zinc-100 font-mono text-[11px] bg-slate-200 dark:bg-zinc-800 px-md py-0.5 rounded">
                        {selectedOrder.orderId}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-xs">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-sm text-[11px]">
                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px] mb-xs">Billed To</p>
                      <p className="font-bold text-slate-700 dark:text-zinc-200">{selectedOrder.customer}</p>
                      <p className="text-slate-500">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px] mb-xs">Shipping Address</p>
                      <p className="text-slate-600 dark:text-zinc-300 leading-tight">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-xs border-t border-b border-slate-200 dark:border-zinc-800 py-sm">
                    <div className="flex justify-between font-bold text-slate-400 text-[9px] uppercase tracking-wider pb-xs">
                      <span>Product Item description</span>
                      <div className="flex gap-lg">
                        <span>Qty</span>
                        <span className="w-16 text-right">Price</span>
                      </div>
                    </div>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                        <span className="font-semibold truncate max-w-[280px]">{item.name}</span>
                        <div className="flex gap-lg shrink-0">
                          <span className="font-medium text-slate-400">x{item.quantity}</span>
                          <span className="w-16 text-right font-bold">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price calculations */}
                  <div className="space-y-xs w-52 ml-auto text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cart Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-red-500 font-bold">
                        <span>Coupon Discount:</span>
                        <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shipping charge:</span>
                      <span>{selectedOrder.shipping === 0 ? "FREE" : formatCurrency(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GST Tax (12%):</span>
                      <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-zinc-800 pt-xs font-black text-sm text-slate-800 dark:text-zinc-100">
                      <span>Grand Total:</span>
                      <span className="text-[#004782] dark:text-[#a4c9ff]">{formatCurrency(selectedOrder.finalAmount || selectedOrder.total)}</span>
                    </div>
                  </div>

                  <div className="pt-sm border-t border-slate-100 dark:border-zinc-800/40 text-[9px] text-slate-400 text-center leading-normal">
                    This is a computer generated invoice valid at WellMeds Pharmacy outlets. Prepared under pharmacopeia specifications.
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-sm justify-end print:hidden pt-sm border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={handlePrintInvoice}
                    className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs select-none cursor-pointer"
                  >
                    <Printer size={14} />
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setInvoiceModalOpen(false)}
                    className="border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-bold px-lg py-sm rounded-xl transition-colors select-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
          </>
        )}
      </Modal>

      {/* Details Timeline Modal */}
      <Modal
        isOpen={!!(selectedOrder && detailModalOpen)}
        onClose={() => setDetailModalOpen(false)}
        title="Order Detail Card"
        maxWidth="max-w-lg"
      >
        {selectedOrder && (
          <>
            {/* Timeline */}
            <div className="space-y-sm text-xs">
              
              <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl space-y-sm">
                <h4 className="font-bold text-slate-800 dark:text-zinc-100 font-mono text-[11px]">{selectedOrder.orderId}</h4>
                <div className="grid grid-cols-2 gap-sm">
                  <p className="text-slate-400 flex items-center gap-xs">
                    <CreditCard size={14} />
                    <span>Payment: {selectedOrder.paymentMethod?.toUpperCase() || "CARD"} ({selectedOrder.paymentStatus})</span>
                  </p>
                  <p className="text-slate-400 flex items-center gap-xs truncate">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate" title={selectedOrder.shippingAddress}>Address: {selectedOrder.shippingAddress}</span>
                  </p>
                </div>
              </div>

              {/* Status checklist progress */}
              <div className="space-y-md border-t border-slate-100 dark:border-zinc-800 pt-sm">
                <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Packaging Timeline & State</h4>
                
                <div className="relative border-l-2 border-slate-100 dark:border-zinc-800 pl-lg ml-xs space-y-md">
                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      ["Pending", "Processing", "Prescription Review", "Approved", "Packed", "Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-[#004782] border-[#004782] text-white"
                        : "bg-white border-slate-200"
                    }`}>
                      <CheckCircle2 size={8} />
                    </span>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">Order Placed & Logged</p>
                    <p className="text-[10px] text-slate-400">Order recorded successfully in Mongoose database.</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      ["Processing", "Prescription Review", "Approved", "Packed", "Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-[#004782] border-[#004782] text-white"
                        : "bg-white border-slate-200"
                    }`}>
                      <CheckCircle2 size={8} />
                    </span>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">Prescription Verification</p>
                    <p className="text-[10px] text-slate-400">
                      {selectedOrder.rxUploaded ? "Attached prescription check verified." : "OTC free dispensations. Automatically approved."}
                    </p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      ["Packed", "Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-[#004782] border-[#004782] text-white"
                        : "bg-white border-slate-200"
                    }`}>
                      <CheckCircle2 size={8} />
                    </span>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">Packed & Dispensed</p>
                    <p className="text-[10px] text-slate-400">Medicines sealed in hygienic packages.</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      ["Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-[#004782] border-[#004782] text-white"
                        : "bg-white border-slate-200"
                    }`}>
                      <CheckCircle2 size={8} />
                    </span>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">Shipped Out</p>
                    <p className="text-[10px] text-slate-400">Courier assigned for home delivery transit.</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedOrder.status === "Delivered"
                        ? "bg-[#004782] border-[#004782] text-white"
                        : "bg-white border-slate-200"
                    }`}>
                      <CheckCircle2 size={8} />
                    </span>
                    <p className="font-bold text-slate-800 dark:text-zinc-100">Delivered</p>
                    <p className="text-[10px] text-slate-400">Package successfully dropped at customer shipping target.</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end pt-md border-t border-slate-100 dark:border-zinc-800 mt-md">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-650 dark:text-zinc-200 font-bold px-lg py-sm rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrders;
