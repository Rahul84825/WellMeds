import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatDate } from "../utils/date";
import { formatCurrency } from "../utils/currency";
import { 
  FileText, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  FileWarning, 
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pill,
  ShoppingBag,
  ArrowRight,
  Lock,
  Layers,
  ChevronRight,
  RefreshCw,
  Info,
  Package,
  Truck
} from "lucide-react";

// Pricing Constants matching universal WellMeds logic
const DELIVERY_THRESHOLD = 2000;
const STANDARD_DELIVERY_FEE = 99;
const REGULAR_PACKAGING_FEE = 19;
const COLD_PACKAGING_FEE = 79;

const getStatusConfig = (status) => {
  switch (status) {
    case "Pending Review":
      return {
        badge: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 font-semibold",
        dot: "bg-amber-500",
        label: "Pending Review"
      };
    case "Under Verification":
      return {
        badge: "bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 font-semibold",
        dot: "bg-sky-500",
        label: "Under Review"
      };
    case "Approved":
      return {
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold",
        dot: "bg-emerald-500",
        label: "Approved"
      };
    case "Rejected":
      return {
        badge: "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 font-semibold",
        dot: "bg-rose-500",
        label: "Rejected"
      };
    case "Expired":
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 font-semibold",
        dot: "bg-slate-400",
        label: "Expired"
      };
    default:
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
        label: status || "Unknown"
      };
  }
};

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: "DIRECT_UPLOAD" (Uploaded RX) vs "CHECKOUT_UPLOAD" (Checkout RX Verification)
  const [activeTab, setActiveTab] = useState("DIRECT_UPLOAD");

  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal Review States
  const [selectedRx, setSelectedRx] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescribedItems, setPrescribedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState(null);

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Cart Creation Confirmation Modal
  const [createCartConfirmOpen, setCreateCartConfirmOpen] = useState(false);

  // Product Search for Pharmacist Cart Builder (Tab 1)
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // Multi-file gallery index & Zoom state
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch all prescriptions
  const fetchAllPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPrescriptions();
      setPrescriptions(data || []);
    } catch (err) {
      console.error("Failed to load admin prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPrescriptions();
  }, []);

  const handleSelectRx = (rx) => {
    setSelectedRx(rx);
    setAdminNotes(rx.pharmacistNotes || rx.adminNotes || "");
    setDoctorName(rx.doctorName || "");
    
    // If Rx has already prescribed items, load them; otherwise initialize empty
    if (rx.prescribedItems && rx.prescribedItems.length > 0) {
      setPrescribedItems(
        rx.prescribedItems.map((item) => ({
          product: item.product?._id || item.product || item.productId,
          name: item.name || item.product?.name || "Medicine",
          dosage: item.dosage || "1 Tablet daily",
          quantity: item.quantity || 1,
          price: item.price || item.product?.price || 0,
          originalPrice: item.originalPrice || item.price || 0,
          isRx: item.isRx !== undefined ? item.isRx : true,
          image: item.image || item.product?.image || "",
          variantName: item.variantName || "",
          variantId: item.variantId || "",
        }))
      );
    } else {
      setPrescribedItems([]);
    }

    setActiveFileIndex(0);
    setZoomLevel(1);
    setInlineFeedback(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRx(null);
    setAdminNotes("");
    setDoctorName("");
    setPrescribedItems([]);
    setProductSearch("");
    setSearchResults([]);
    setRejectModalOpen(false);
    setCreateCartConfirmOpen(false);
    setInlineFeedback(null);
  };

  // Search medicines in database
  useEffect(() => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingProducts(true);
      try {
        const res = await api.getProducts({ search: productSearch, limit: 8 });
        setSearchResults(res.products || []);
      } catch (err) {
        console.error("Failed to search products:", err);
      } finally {
        setSearchingProducts(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleAddMedicineToCartBuilder = (product, variant = null) => {
    const prodId = product._id || product.id;
    const targetVariantName = variant ? variant.name : "";
    const targetVariantId = variant ? (variant._id || variant.id) : "";
    
    const existingIndex = prescribedItems.findIndex(
      (p) =>
        (p.product === prodId || p.product?._id === prodId) &&
        (p.variantName || "").toLowerCase() === targetVariantName.toLowerCase()
    );

    if (existingIndex > -1) {
      setPrescribedItems((prev) =>
        prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      setProductSearch("");
      setSearchResults([]);
      return;
    }

    let effectivePrice = product.price || 0;
    let effectiveStock = product.stock !== undefined ? product.stock : 100;

    if (variant) {
      effectivePrice = variant.sellingPrice !== undefined ? variant.sellingPrice : (variant.price !== undefined ? variant.price : product.price);
      if (variant.stock !== undefined) effectiveStock = variant.stock;
    }

    setPrescribedItems((prev) => [
      ...prev,
      {
        product: prodId,
        name: variant ? `${product.name} (${variant.name})` : product.name,
        dosage: "As directed by physician",
        quantity: 1,
        price: effectivePrice,
        originalPrice: product.originalPrice || product.price || effectivePrice,
        isRx: !!(product.requiresRx || product.isPrescriptionRequired),
        image: product.image || "",
        variantName: targetVariantName,
        variantId: targetVariantId,
        maxStock: effectiveStock,
      },
    ]);
    setProductSearch("");
    setSearchResults([]);
  };

  const handleRemovePrescribedItem = (index) => {
    setPrescribedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemQuantityChange = (index, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 1);
    setPrescribedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const max = item.maxStock !== undefined ? item.maxStock : 999;
        return { ...item, quantity: Math.min(qty, max) };
      })
    );
  };

  const handleItemDosageChange = (index, dosage) => {
    setPrescribedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, dosage } : item))
    );
  };

  // ── Pricing Calculations ──
  const cartSubtotal = useMemo(() => {
    if (activeTab === "DIRECT_UPLOAD") {
      return prescribedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    }
    // Checkout upload cart items subtotal
    if (selectedRx?.cartSnapshot?.items) {
      return selectedRx.cartSnapshot.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    }
    if (selectedRx?.cart?.items) {
      return selectedRx.cart.items.reduce((acc, item) => acc + (item.price || item.product?.price || 0) * (item.quantity || 1), 0);
    }
    return 0;
  }, [activeTab, prescribedItems, selectedRx]);

  const packagingFee = REGULAR_PACKAGING_FEE;
  const deliveryFee = cartSubtotal >= DELIVERY_THRESHOLD || cartSubtotal === 0 ? 0 : STANDARD_DELIVERY_FEE;
  const totalEstimatedAmount = cartSubtotal + packagingFee + deliveryFee;

  const isProcessed = Boolean(
    selectedRx && (selectedRx.status === "Approved" || selectedRx.status === "Rejected" || selectedRx.status === "Expired")
  );
  const isApproved = selectedRx?.status === "Approved";
  const isRejected = selectedRx?.status === "Rejected";

  // ── Workflow A: Create Prescription Cart & Notify Customer ──
  const handleConfirmCreateCart = async () => {
    if (!selectedRx || prescribedItems.length === 0) return;
    setIsSubmitting(true);
    setInlineFeedback(null);

    try {
      const payload = {
        items: prescribedItems,
        pharmacistNotes: adminNotes || "Prescription medicines prepared and verified by pharmacist.",
        doctorName: doctorName || "",
      };

      const res = await api.createCartForPrescription(selectedRx._id || selectedRx.id, payload);
      
      setPrescriptions((prev) =>
        prev.map((rx) =>
          (rx._id || rx.id) === (selectedRx._id || selectedRx.id)
            ? { ...rx, status: "Approved", prescribedItems: res.prescription?.prescribedItems || prescribedItems }
            : rx
        )
      );

      // Broadcast storage event so customer storefront tab updates instantly
      localStorage.setItem("wellmeds_cart_lock_sync", Date.now().toString());

      setCreateCartConfirmOpen(false);
      closeModal();
      fetchAllPrescriptions();
    } catch (err) {
      console.error("Failed to create prescription cart", err);
      setInlineFeedback({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to create locked cart.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Workflow B: Accept Checkout Prescription ──
  const handleAcceptCheckoutRx = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    setInlineFeedback(null);

    try {
      const payload = {
        adminNotes: adminNotes || "Prescription verified & approved by licensed pharmacist.",
        doctorName,
      };
      const updatedRx = await api.approvePrescription(selectedRx._id || selectedRx.id, payload);

      setPrescriptions((prev) =>
        prev.map((rx) => ((rx._id || rx.id) === (selectedRx._id || selectedRx.id) ? { ...rx, ...updatedRx, status: "Approved" } : rx))
      );
      closeModal();
      fetchAllPrescriptions();
    } catch (err) {
      console.error("Failed to accept checkout prescription", err);
      setInlineFeedback({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to verify prescription.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Workflow B: Reject Checkout Prescription ──
  const handleConfirmRejectCheckoutRx = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    setInlineFeedback(null);

    try {
      const payload = {
        adminNotes: rejectionReason.trim() || "Prescription verification declined. Please upload a clear document.",
        doctorName,
      };
      const updatedRx = await api.rejectPrescription(selectedRx._id || selectedRx.id, payload);

      setPrescriptions((prev) =>
        prev.map((rx) => ((rx._id || rx.id) === (selectedRx._id || selectedRx.id) ? { ...rx, ...updatedRx, status: "Rejected" } : rx))
      );
      setRejectModalOpen(false);
      closeModal();
      fetchAllPrescriptions();
    } catch (err) {
      console.error("Failed to reject prescription", err);
      setInlineFeedback({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to reject prescription.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tab Counts ──
  const tabCounts = useMemo(() => {
    const direct = prescriptions.filter((r) => (r.source || "DIRECT_UPLOAD") === "DIRECT_UPLOAD");
    const checkout = prescriptions.filter((r) => r.source === "CHECKOUT_UPLOAD");
    return {
      directTotal: direct.length,
      directPending: direct.filter((r) => r.status === "Pending Review" || r.status === "Under Verification").length,
      checkoutTotal: checkout.length,
      checkoutPending: checkout.filter((r) => r.status === "Pending Review" || r.status === "Under Verification").length,
    };
  }, [prescriptions]);

  // ── Filtered List ──
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      // Filter by Tab
      const rxSource = rx.source || "DIRECT_UPLOAD";
      if (rxSource !== activeTab) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = rx.user?.name?.toLowerCase().includes(query);
        const matchEmail = rx.user?.email?.toLowerCase().includes(query);
        const matchMobile = rx.user?.mobile?.includes(query);
        const matchFileName = rx.name?.toLowerCase().includes(query);
        const matchDoctor = rx.doctorName?.toLowerCase().includes(query);
        const matchId = (rx._id || rx.id)?.toLowerCase().includes(query);
        
        let matchMedicine = false;
        if (rx.prescribedItems && Array.isArray(rx.prescribedItems)) {
          matchMedicine = rx.prescribedItems.some((item) => item.name?.toLowerCase().includes(query));
        }

        if (!matchName && !matchEmail && !matchMobile && !matchFileName && !matchDoctor && !matchMedicine && !matchId) {
          return false;
        }
      }

      // Filter by Status
      if (statusFilter !== "all" && rx.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [prescriptions, activeTab, searchQuery, statusFilter]);

  // Gallery files
  const activeFiles = useMemo(() => {
    if (!selectedRx) return [];
    if (selectedRx.fileUrls && selectedRx.fileUrls.length > 0) {
      return selectedRx.fileUrls;
    }
    if (selectedRx.fileUrl) {
      return [selectedRx.fileUrl];
    }
    return [];
  }, [selectedRx]);

  const currentFileUrl = activeFiles[activeFileIndex] || selectedRx?.fileUrl || "";
  const isPdf = currentFileUrl.toLowerCase().endsWith(".pdf") || selectedRx?.fileType === "application/pdf";

  return (
    <div className="space-y-6 text-slate-800 dark:text-zinc-100 font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="text-[#136258] dark:text-teal-400" size={28} />
            Prescription Verification Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Review uploaded prescriptions, verify checkout orders, and prepare locked pharmacy carts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAllPrescriptions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── TWO PRIMARY TABS ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-px">
        <button
          type="button"
          onClick={() => {
            setActiveTab("DIRECT_UPLOAD");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "DIRECT_UPLOAD"
              ? "border-[#136258] text-[#136258] dark:text-teal-400 bg-[#136258]/5 dark:bg-teal-950/20 rounded-t-xl"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText size={18} />
          <span>Uploaded RX</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-bold ${
              activeTab === "DIRECT_UPLOAD"
                ? "bg-[#136258] text-white"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
            }`}
          >
            {tabCounts.directTotal}
          </span>
          {tabCounts.directPending > 0 && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {tabCounts.directPending} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("CHECKOUT_UPLOAD");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "CHECKOUT_UPLOAD"
              ? "border-[#136258] text-[#136258] dark:text-teal-400 bg-[#136258]/5 dark:bg-teal-950/20 rounded-t-xl"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShoppingBag size={18} />
          <span>Checkout RX Verification</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-bold ${
              activeTab === "CHECKOUT_UPLOAD"
                ? "bg-[#136258] text-white"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
            }`}
          >
            {tabCounts.checkoutTotal}
          </span>
          {tabCounts.checkoutPending > 0 && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {tabCounts.checkoutPending} Pending
            </span>
          )}
        </button>
      </div>



      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by customer name, email, mobile, Rx ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#136258]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={15} className="text-slate-400 shrink-0 hidden sm:block" />
          {["all", "Pending Review", "Approved", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#136258] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              {st === "all" ? "All Status" : st}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRESCRIPTIONS TABLE ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" />
          <p className="text-xs text-slate-400">Loading prescriptions...</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No prescriptions found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No prescriptions match your active search and filter criteria."
              : `No prescriptions currently waiting in the ${activeTab === "DIRECT_UPLOAD" ? "Uploaded RX" : "Checkout RX"} queue.`}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Rx Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">
                    {activeTab === "DIRECT_UPLOAD" ? "Prescribed Medicines" : "Locked Cart Items"}
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-zinc-800/60">
                {filteredPrescriptions.map((rx) => {
                  const statusCfg = getStatusConfig(rx.status);
                  const itemCount =
                    activeTab === "DIRECT_UPLOAD"
                      ? (rx.prescribedItems?.length || 0)
                      : (rx.cartSnapshot?.items?.length || rx.cart?.items?.length || 0);

                  return (
                    <tr
                      key={rx._id || rx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Rx Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              #{(rx._id || rx.id).slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                              {rx.fileUrls?.length || 1} file(s)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={rx.name}>
                            {rx.name || "Prescription file"}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar size={11} /> {formatDate(rx.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {rx.user?.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            <Mail size={11} /> {rx.user?.email || "—"}
                          </p>
                          {rx.user?.mobile && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                              <Phone size={11} /> {rx.user.mobile}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Medicines / Cart Summary */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                            <Pill size={11} /> {itemCount} item(s)
                          </span>
                          {rx.cartSnapshot?.subtotal ? (
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                              Subtotal: {formatCurrency(rx.cartSnapshot.subtotal)}
                            </p>
                          ) : null}
                          {rx.doctorName && (
                            <p className="text-[11px] text-slate-500">Dr. {rx.doctorName}</p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${statusCfg.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        {rx.status === "Approved" || rx.status === "Rejected" || rx.status === "Expired" ? (
                          <button
                            type="button"
                            onClick={() => handleSelectRx(rx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                          >
                            <FileText size={13} className="text-[#136258] dark:text-teal-400" />
                            <span>View Details</span>
                            <ChevronRight size={13} className="text-slate-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectRx(rx)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#136258] hover:bg-[#0e4e46] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <span>{activeTab === "DIRECT_UPLOAD" ? "Build & Review Cart" : "Verify Prescription"}</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FULL REVIEW & WORKFLOW SCREEN (PORTAL)
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && selectedRx && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#136258]/10 text-[#136258] dark:text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {isProcessed
                        ? isApproved
                          ? activeTab === "DIRECT_UPLOAD" ? "Prescription Cart Details" : "Prescription Verification Details"
                          : "Prescription Review Details"
                        : activeTab === "DIRECT_UPLOAD" ? "Direct RX Cart Builder" : "Checkout RX Verification"}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 font-bold">
                      #{(selectedRx._id || selectedRx.id).slice(-6).toUpperCase()}
                    </span>
                    {isProcessed && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${
                          getStatusConfig(selectedRx.status).badge
                        }`}
                      >
                        {getStatusConfig(selectedRx.status).label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    Uploaded on {formatDate(selectedRx.createdAt)} • {selectedRx.user?.name} ({selectedRx.user?.email})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Split Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ── LEFT COLUMN: High-Res Prescription Viewer (5 Cols) ── */}
              <div className="lg:col-span-5 flex flex-col bg-slate-900 text-white rounded-2xl p-4 shadow-inner min-h-[400px] space-y-3">
                {/* Viewer Controls */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="font-mono text-[11px] text-zinc-400">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>

                  <a
                    href={currentFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#84d6b9] hover:underline font-semibold text-xs"
                  >
                    <ExternalLink size={13} /> Open Full View
                  </a>
                </div>

                {/* Preview Image / PDF Window */}
                <div className="flex-1 min-h-[320px] max-h-[460px] overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
                  {isPdf ? (
                    <iframe
                      src={currentFileUrl}
                      title="Prescription PDF"
                      className="w-full h-full min-h-[360px] rounded-lg border-0"
                    />
                  ) : currentFileUrl ? (
                    <img
                      src={currentFileUrl}
                      alt="Prescription Document"
                      style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-lg origin-center"
                    />
                  ) : (
                    <div className="text-center p-8 text-zinc-500 text-xs">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      No document preview available
                    </div>
                  )}
                </div>

                {/* Multi-file thumbnail strip */}
                {activeFiles.length > 1 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 overflow-x-auto pb-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0">Pages:</span>
                    {activeFiles.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveFileIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          activeFileIndex === idx
                            ? "bg-[#136258] text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Doc {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN: Workspace (Cart Builder OR Read-Only Details) (7 Cols) ── */}
              <div className="lg:col-span-7 space-y-5 text-left">
                {/* Customer Details Strip */}
                <div className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedRx.user?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300 truncate block">
                      {selectedRx.user?.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {selectedRx.user?.mobile || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Processed Status Alert Banner */}
                {isApproved && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        Prescription Cart Created & Approved
                      </h4>
                      <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        This prescription has been prepared and verified. The locked prescription cart is linked to the customer's account and ready for checkout.
                      </p>
                      {selectedRx.approvedAt && (
                        <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Approved on {formatDate(selectedRx.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-4 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <X size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-rose-950 dark:text-rose-100">Prescription Rejected</h4>
                      <p className="mt-0.5 text-rose-800 dark:text-rose-300">
                        Reason: {selectedRx.rejectionReason || selectedRx.adminNotes || "Prescription verification declined."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient Notes (if any) */}
                {selectedRx.patientNotes && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200">
                    <strong className="block font-bold mb-0.5">Patient Notes:</strong>
                    {selectedRx.patientNotes}
                  </div>
                )}

                {/* Inline Error / Status Banner */}
                {inlineFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      inlineFeedback.type === "error"
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                    }`}
                  >
                    <AlertCircle size={15} />
                    <span>{inlineFeedback.message}</span>
                  </div>
                )}

                {/* ── TAB 1 CONTENT: CART BUILDER OR READ-ONLY MEDICINES ── */}
                {activeTab === "DIRECT_UPLOAD" ? (
                  isProcessed ? (
                    /* Read-Only Mode: Show Prescribed Medicines List */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Pill size={16} className="text-[#136258] dark:text-teal-400" />
                          Prescribed Medicines in Customer's Cart
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          {prescribedItems.length} medicine(s)
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {prescribedItems.length === 0 ? (
                          <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
                            No prescribed medicines recorded for this prescription.
                          </div>
                        ) : (
                          prescribedItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[#136258] dark:text-teal-400 flex items-center justify-center shrink-0 font-bold">
                                    <Pill size={18} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {item.name}
                                  </p>
                                  <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500">
                                    <span>Qty: <strong className="text-slate-800 dark:text-zinc-200">{item.quantity}</strong></span>
                                    <span>• Unit: {formatCurrency(item.price)}</span>
                                    {item.dosage && (
                                      <span className="text-slate-400 truncate hidden sm:inline">• {item.dosage}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Interactive Cart Builder Mode for Pending Rx */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Pill size={16} className="text-[#136258] dark:text-teal-400" />
                          Prescribed Medicines Cart Builder
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {prescribedItems.length} medicine(s) selected
                        </span>
                      </div>

                      {/* Live Medicine Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search medicines from catalog (e.g. Dolo 650, Paracetamol)..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#136258]"
                        />

                        {/* Search Dropdown Results */}
                        {searchingProducts && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-lg z-20 text-xs text-slate-500 flex items-center gap-2">
                            <RefreshCw size={13} className="animate-spin text-[#136258]" />
                            Searching catalog...
                          </div>
                        )}

                        {!searchingProducts && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-h-64 overflow-y-auto shadow-xl z-20 divide-y divide-slate-100 dark:divide-zinc-800">
                            {searchResults.map((prod) => {
                              const isOutOfStock = prod.stock <= 0;
                              const hasVariants = prod.variants && prod.variants.length > 0;

                              return (
                                <div
                                  key={prod._id || prod.id}
                                  className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {prod.image ? (
                                      <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center shrink-0">
                                        <Pill size={16} />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 dark:text-white truncate">
                                        {prod.name}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {formatCurrency(prod.price)} • Stock:{" "}
                                        <span className={isOutOfStock ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>
                                          {prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  {hasVariants ? (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {prod.variants.map((v) => (
                                        <button
                                          key={v.name}
                                          type="button"
                                          disabled={v.stock <= 0}
                                          onClick={() => handleAddMedicineToCartBuilder(prod, v)}
                                          className="px-2.5 py-1 rounded-lg bg-[#136258]/10 hover:bg-[#136258] hover:text-white text-[#136258] dark:text-teal-300 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                                        >
                                          + {v.name} ({formatCurrency(v.sellingPrice || v.price)})
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isOutOfStock}
                                      onClick={() => handleAddMedicineToCartBuilder(prod)}
                                      className="px-3 py-1.5 rounded-lg bg-[#136258] hover:bg-[#0e4e46] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                                    >
                                      + Add Item
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Selected Medicines List */}
                      {prescribedItems.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-400 space-y-1">
                          <Pill size={24} className="mx-auto text-slate-300 dark:text-zinc-600" />
                          <p className="font-semibold text-slate-600 dark:text-zinc-300">
                            No medicines added to this prescription cart yet.
                          </p>
                          <p>Search from the medicine catalog above to prepare the customer's cart.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {prescribedItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                  <span>Unit: {formatCurrency(item.price)}</span>
                                  <span>Total: {formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              </div>

                              {/* Quantity Selector */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <label className="text-[11px] font-bold text-slate-400">Qty:</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.maxStock || 99}
                                  value={item.quantity}
                                  onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                                  className="w-14 px-2 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-bold text-xs text-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePrescribedItem(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Remove medicine"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* ── TAB 2 CONTENT: LOCKED CART ITEMS PREVIEW ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock size={16} className="text-amber-500" />
                        Customer's Locked Cart Items Preview
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                        Cart Locked on Backend
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {selectedRx.cartSnapshot?.items && selectedRx.cartSnapshot.items.length > 0 ? (
                        selectedRx.cartSnapshot.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span>Qty: <strong className="text-slate-800 dark:text-white">{item.quantity}</strong></span>
                                <span>• Unit: {formatCurrency(item.price)}</span>
                                {item.requiresRx && (
                                  <span className="text-rose-600 font-bold">℞ Prescription Item</span>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : selectedRx.cart?.items && selectedRx.cart.items.length > 0 ? (
                        selectedRx.cart.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {item.product?.name || "Medicine"}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span>Qty: <strong className="text-slate-800 dark:text-white">{item.quantity}</strong></span>
                                <span>• Unit: {formatCurrency(item.price || item.product?.price || 0)}</span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm">
                              {formatCurrency((item.price || item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                          No cart snapshot found for this checkout verification.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── UNIVERSAL PRICING BREAKDOWN ── */}
                <div className="bg-slate-100/70 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Medicines Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><Package size={13} /> Packaging Charges</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{formatCurrency(packagingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><Truck size={13} /> Delivery Fee</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-zinc-800 pt-2 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Estimated Total</span>
                    <span className="text-[#136258] dark:text-teal-400 text-base">{formatCurrency(totalEstimatedAmount)}</span>
                  </div>
                </div>

                {/* Doctor Name & Pharmacist Notes */}
                {isProcessed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Doctor Name</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedRx.doctorName || "Not specified"}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pharmacist Notes</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{selectedRx.pharmacistNotes || selectedRx.adminNotes || "None provided"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        Doctor Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. A. Sharma, MD"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#136258]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        Pharmacist Notes (Sent in Email)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Take 1 tablet after food"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#136258]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
              {isProcessed ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusConfig(selectedRx.status).badge}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusConfig(selectedRx.status).dot}`} />
                      {getStatusConfig(selectedRx.status).label}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {isApproved ? "Prescription cart has been created and customer notified." : "Prescription verification was rejected."}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {activeTab === "DIRECT_UPLOAD" ? (
                    /* Tab 1 Actions: Create Prescription Cart */
                    <button
                      type="button"
                      disabled={prescribedItems.length === 0 || isSubmitting}
                      onClick={() => setCreateCartConfirmOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#136258] hover:bg-[#0e4e46] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Lock size={15} />
                      <span>Create Prescription Cart & Notify Customer</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    /* Tab 2 Actions: ONLY ACCEPT OR REJECT */
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setRejectionReason("");
                          setRejectModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <X size={15} />
                        <span>Reject Prescription</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleAcceptCheckoutRx}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <CheckCircle2 size={16} />
                        <span>Accept & Verify Prescription</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONFIRMATION MODAL: CREATE PRESCRIPTION CART (TAB 1)
      ───────────────────────────────────────────────────────────── */}
      {createCartConfirmOpen && createPortal(
        <div 
          style={{ zIndex: 9999 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#136258]/10 text-[#136258] dark:text-teal-400 flex items-center justify-center">
              <Lock size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Prescription Cart Creation
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                This will create a locked prescription cart containing <strong>{prescribedItems.length} medicine(s)</strong> (Total: {formatCurrency(totalEstimatedAmount)}) for <strong>{selectedRx?.user?.email}</strong> and send them the "Your WellMeds prescription order is ready" notification email.
              </p>
            </div>

            {inlineFeedback && inlineFeedback.type === "error" && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{inlineFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateCartConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmCreateCart}
                className="px-5 py-2 rounded-xl bg-[#136258] hover:bg-[#0e4e46] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : null}
                <span>Confirm & Send Email</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONFIRMATION MODAL: REJECT CHECKOUT PRESCRIPTION (TAB 2)
      ───────────────────────────────────────────────────────────── */}
      {rejectModalOpen && createPortal(
        <div 
          style={{ zIndex: 9999 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Prescription Rejection
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Rejecting this prescription will mark the verification as rejected, <strong>clear the customer's associated locked cart</strong>, and email them with the rejection reason.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Reason for Rejection (Required)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. The prescription image is blurry / expired / missing doctor registration number."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || isSubmitting}
                onClick={handleConfirmRejectCheckoutRx}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : null}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPrescriptions;
