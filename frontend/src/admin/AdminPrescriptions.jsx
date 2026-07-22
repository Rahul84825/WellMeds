import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
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
  ShieldCheck,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pill
} from "lucide-react";

const getStatusConfigLocal = (status) => {
  switch (status) {
    case "Pending Review":
      return {
        badge: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/40",
        dot: "bg-amber-500",
        label: "Pending Review"
      };
    case "Under Verification":
      return {
        badge: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/40",
        dot: "bg-blue-500",
        label: "Verifying"
      };
    case "Approved":
      return {
        badge: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900/40",
        dot: "bg-emerald-500",
        label: "Approved"
      };
    case "Rejected":
      return {
        badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-955/20 dark:text-red-400 dark:border-red-900/40",
        dot: "bg-red-500",
        label: "Rejected"
      };
    case "Expired":
      return {
        badge: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50",
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
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected prescription for review
  const [selectedRx, setSelectedRx] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescribedItems, setPrescribedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Product Search for Pharmacist medicine assignment
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // Multi-file gallery index
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Fetch all prescriptions
  const fetchAllPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPrescriptions();
      setPrescriptions(data);
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
    setPrescribedItems(rx.prescribedItems || []);
    setActiveFileIndex(0);
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
        const res = await api.getProducts({ search: productSearch, limit: 6 });
        setSearchResults(res.products || []);
      } catch (err) {
        console.error("Failed to search products:", err);
      } finally {
        setSearchingProducts(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleAddMedicineToRx = (product) => {
    const existing = prescribedItems.find((p) => (p.product?._id || p.product) === (product._id || product.id));
    if (existing) {
      toast.info(`${product.name} is already in the prescribed items list.`);
      return;
    }

    setPrescribedItems((prev) => [
      ...prev,
      {
        product: product._id || product.id,
        name: product.name,
        dosage: "1 Tablet twice daily",
        quantity: 1,
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        isRx: true,
        image: product.image || "",
      },
    ]);
    setProductSearch("");
    setSearchResults([]);
    toast.success(`Added ${product.name} to prescribed items.`);
  };

  const handleRemovePrescribedItem = (index) => {
    setPrescribedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setPrescribedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Decision actions
  const handleApprove = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const payload = {
        adminNotes,
        doctorName,
        items: prescribedItems,
      };
      const updatedRx = await api.approvePrescription(selectedRx.id || selectedRx._id, payload);
      toast.success(`Prescription for ${updatedRx.user?.name || "Patient"} approved successfully.`);
      
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to approve prescription", err);
      toast.error("Failed to approve prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRx) return;
    if (!adminNotes.trim()) {
      toast.warning("Please provide pharmacist notes explaining the rejection reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        adminNotes,
        doctorName,
      };
      const updatedRx = await api.rejectPrescription(selectedRx.id || selectedRx._id, payload);
      toast.info(`Prescription for ${updatedRx.user?.name || "Patient"} rejected.`);
      
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to reject prescription", err);
      toast.error("Failed to reject prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveItemsOnly = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const payload = {
        items: prescribedItems,
        pharmacistNotes: adminNotes,
        doctorName,
      };
      const updatedRx = await api.updatePrescriptionItems(selectedRx.id || selectedRx._id, payload);
      toast.success("Prescribed medicines log updated.");
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to update prescribed items", err);
      toast.error("Failed to save prescribed items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenericStatusUpdate = async (status) => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const updatedRx = await api.updatePrescriptionStatus(selectedRx.id || selectedRx._id, status, adminNotes, { doctorName, items: prescribedItems });
      toast.success(`Prescription status updated to ${status}.`);
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to update prescription status", err);
      toast.error("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = rx.user?.name?.toLowerCase().includes(query);
        const matchEmail = rx.user?.email?.toLowerCase().includes(query);
        const matchFileName = rx.name?.toLowerCase().includes(query);
        const matchDoctor = rx.doctorName?.toLowerCase().includes(query);
        
        let matchMedicine = false;
        if (rx.prescribedItems && Array.isArray(rx.prescribedItems)) {
          matchMedicine = rx.prescribedItems.some(
            (item) => item.name?.toLowerCase().includes(query)
          );
        }

        if (!matchName && !matchEmail && !matchFileName && !matchDoctor && !matchMedicine) return false;
      }

      if (statusFilter === "today") {
        const today = new Date();
        const rxDate = new Date(rx.createdAt);
        if (today.toDateString() !== rxDate.toDateString()) {
          return false;
        }
      } else if (statusFilter !== "all" && rx.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [prescriptions, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const activeConfig = selectedRx ? getStatusConfigLocal(selectedRx.status) : null;
  const activeFileUrl = selectedRx?.fileUrls?.[activeFileIndex] || selectedRx?.fileUrl;
  const isPDFSelected = activeFileUrl?.toLowerCase().endsWith(".pdf") || selectedRx?.fileNames?.[activeFileIndex]?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title */}
      <div className="flex items-center gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <FileText className="text-[#02665e]" />
          Prescription Verification Portal
        </h1>
        <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 px-sm py-0.5 rounded-full text-[10px] font-bold">
          {prescriptions.length} Uploads
        </span>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by patient, doctor, medicine, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#02665e] rounded-xl text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-sm">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="today">Today's Uploads</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Uploads List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55 dark:bg-zinc-955 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Patient</th>
                <th className="p-md">Doctor / Clinic</th>
                <th className="p-md">Uploaded Date</th>
                <th className="p-md">Prescribed Items</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-lg text-center text-slate-400 font-semibold">
                    No prescriptions match the filter selections.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => {
                  const displayId = rx.id || rx._id;
                  const config = getStatusConfigLocal(rx.status);
                  const itemsCount = rx.prescribedItems?.length || 0;

                  return (
                    <tr
                      key={displayId}
                      onClick={() => handleSelectRx(rx)}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-all cursor-pointer"
                    >
                      <td className="p-md">
                        <p className="font-bold text-slate-800 dark:text-zinc-100">{rx.user?.name || "Unknown Patient"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{rx.user?.email || "—"}</p>
                      </td>
                      <td className="p-md font-semibold text-slate-700 dark:text-zinc-300">
                        {rx.doctorName ? `Dr. ${rx.doctorName}` : "—"}
                      </td>
                      <td className="p-md">{rx.createdAt ? formatDate(rx.createdAt) : "—"}</td>
                      <td className="p-md">
                        <span className="font-bold text-[#02665e] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                          {itemsCount} Item(s) Logged
                        </span>
                      </td>
                      <td className="p-md">
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-lg text-[10px] font-bold border ${config.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                          {config.label}
                        </span>
                      </td>
                      <td className="p-md text-right font-bold text-[#02665e] dark:text-[#52d6c9]">Review &rarr;</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification & Medicine Assignment Portal Modal */}
      {isModalOpen && selectedRx && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col cursor-default">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Pharmacist Verification Portal</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-bold ${activeConfig.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeConfig.dot}`}></span>
                  {activeConfig.label}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              
              {/* Left Column (5 Cols): Prescription Document Viewer */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-955 overflow-hidden flex items-center justify-center relative group min-h-[350px] max-h-[480px]">
                  {isPDFSelected ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <FileWarning className="text-rose-500 h-10 w-10 mb-2" />
                      <p className="font-bold text-xs text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{selectedRx.fileNames?.[activeFileIndex] || selectedRx.name}</p>
                      <a
                        href={activeFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#02665e] text-white rounded-xl text-xs font-bold hover:bg-[#014d47] transition-all"
                      >
                        <ExternalLink size={14} /> Open PDF Document
                      </a>
                    </div>
                  ) : (
                    <>
                      <img
                        alt="Prescription Sheet"
                        className="w-full h-full object-contain max-h-[480px]"
                        src={activeFileUrl}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <a
                           href={activeFileUrl}
                           target="_blank"
                           rel="noreferrer"
                           className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow"
                        >
                          <ZoomIn size={14} /> Full Screen View
                        </a>
                      </div>
                    </>
                  )}
                </div>

                {/* File Thumbnails */}
                {selectedRx.fileUrls && selectedRx.fileUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto justify-center">
                    {selectedRx.fileUrls.map((url, idx) => {
                      const isPdf = url.toLowerCase().endsWith(".pdf");
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveFileIndex(idx)}
                          className={`w-12 h-12 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                            activeFileIndex === idx ? "border-[#02665e] ring-2 ring-[#02665e]/30" : "border-slate-200"
                          }`}
                        >
                          {isPdf ? (
                            <div className="w-full h-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-[9px]">PDF</div>
                          ) : (
                            <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column (7 Cols): Patient Info, Medicine Assignment, Remarks */}
              <div className="lg:col-span-7 space-y-5 text-left">
                
                {/* Patient Credentials Box */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Patient Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedRx.user?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Contact</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedRx.user?.mobile || selectedRx.user?.email || "—"}</span>
                  </div>
                  {selectedRx.patientNotes && (
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Patient Instructions</span>
                      <p className="text-slate-700 dark:text-zinc-300 italic font-medium">"{selectedRx.patientNotes}"</p>
                    </div>
                  )}
                </div>

                {/* Doctor Details */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consulting Doctor Name</label>
                  <input
                    type="text"
                    placeholder="Enter doctor name (e.g. Dr. Rahul Sharma)"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-[#02665e]/20"
                  />
                </div>

                {/* Pharmacist Medicine Search & Assignment */}
                <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#02665e] dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Pill size={16} /> Prescribed Medicines Log ({prescribedItems.length})
                    </h4>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search database to add medicine to prescription..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                    {searchingProducts && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader size="sm" /></div>
                    )}

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                        {searchResults.map((prod) => (
                          <div
                            key={prod._id || prod.id}
                            onClick={() => handleAddMedicineToRx(prod)}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800 dark:text-zinc-200 block">{prod.name}</span>
                              <span className="text-[10px] text-slate-400">{prod.packSize || "1 Unit"}</span>
                            </div>
                            <span className="font-bold text-[#02665e]">{formatCurrency(prod.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescribed Items Table */}
                  {prescribedItems.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {prescribedItems.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#02665e]">{formatCurrency(item.price * (item.quantity || 1))}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePrescribedItem(idx)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block">Dosage Instructions</label>
                              <input
                                type="text"
                                value={item.dosage}
                                onChange={(e) => handleItemChange(idx, "dosage", e.target.value)}
                                className="w-full px-2 py-1 text-[11px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block">Qty</label>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 text-[11px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none font-bold text-center"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {prescribedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveItemsOnly}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-[#02665e] hover:underline block ml-auto"
                    >
                      Save Prescribed Items
                    </button>
                  )}
                </div>

                {/* Pharmacist Remarks */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pharmacist Remarks / Rejection Reason</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter verification notes or rejection details for the patient..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-[#02665e]/20"
                  />
                </div>

                {/* Final Decision Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                  >
                    <X size={16} /> Reject Prescription
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#02665e] hover:bg-[#014d47] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                  >
                    <Check size={16} /> Approve &amp; Sync Cart
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPrescriptions;
