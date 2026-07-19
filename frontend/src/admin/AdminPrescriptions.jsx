import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { formatDate } from "../utils/date";
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
  AlertCircle
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setAdminNotes(rx.adminNotes || "");
    setDoctorName(rx.doctorName || "");
    setActiveFileIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRx(null);
    setAdminNotes("");
    setDoctorName("");
  };

  // Decision actions
  const handleApprove = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const updatedRx = await api.approvePrescription(selectedRx.id || selectedRx._id, adminNotes, doctorName);
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
      const updatedRx = await api.rejectPrescription(selectedRx.id || selectedRx._id, adminNotes, doctorName);
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

  const handleGenericStatusUpdate = async (status) => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const updatedRx = await api.updatePrescriptionStatus(selectedRx.id || selectedRx._id, status, adminNotes, doctorName);
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
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = rx.user?.name?.toLowerCase().includes(query);
        const matchEmail = rx.user?.email?.toLowerCase().includes(query);
        const matchFileName = rx.name?.toLowerCase().includes(query);
        const matchDoctor = rx.doctorName?.toLowerCase().includes(query);
        
        let matchMedicine = false;
        if (rx.cartSnapshot && Array.isArray(rx.cartSnapshot.items)) {
          matchMedicine = rx.cartSnapshot.items.some(
            (item) => item.name?.toLowerCase().includes(query)
          );
        }

        if (!matchName && !matchEmail && !matchFileName && !matchDoctor && !matchMedicine) return false;
      }

      // 2. Status / Today Filter
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
  
  // Calculate active file preview URL
  const activeFileUrl = selectedRx?.fileUrls?.[activeFileIndex] || selectedRx?.fileUrl;
  const isPDFSelected = activeFileUrl?.toLowerCase().endsWith(".pdf") || selectedRx?.fileNames?.[activeFileIndex]?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title */}
      <div className="flex items-center gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <FileText className="text-[#004782]" />
          Prescription Verification
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
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
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

      {/* Redesigned Full Width Uploads List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55 dark:bg-zinc-955 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Patient</th>
                <th className="p-md">Doctor</th>
                <th className="p-md">Uploaded Date</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-lg text-center text-slate-400 font-semibold">
                    No prescriptions match the filter selections.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => {
                  const displayId = rx.id || rx._id;
                  const config = getStatusConfigLocal(rx.status);
                  return (
                    <tr
                      key={displayId}
                      onClick={() => handleSelectRx(rx)}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-all cursor-pointer"
                    >
                      <td className="p-md">
                        <p className="font-bold text-slate-800 dark:text-zinc-100">{rx.user?.name || "Unknown Patient"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[240px]">{rx.user?.email || "—"}</p>
                      </td>
                      <td className="p-md font-semibold text-slate-700 dark:text-zinc-300">
                        {rx.doctorName ? `Dr. ${rx.doctorName}` : "—"}
                      </td>
                      <td className="p-md">{rx.createdAt ? formatDate(rx.createdAt) : "—"}</td>
                      <td className="p-md">
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-lg text-[10px] font-bold border ${config.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                          {config.label}
                        </span>
                      </td>
                      <td className="p-md text-right font-bold text-[#004782] dark:text-[#a4c9ff]">Verify &rarr;</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-150 dark:divide-zinc-800/80">
          {filteredPrescriptions.length === 0 ? (
            <p className="p-lg text-center text-slate-400 font-semibold">
              No prescriptions match the filter selections.
            </p>
          ) : (
            filteredPrescriptions.map((rx) => {
              const displayId = rx.id || rx._id;
              const config = getStatusConfigLocal(rx.status);
              return (
                <div
                  key={displayId}
                  onClick={() => handleSelectRx(rx)}
                  className="p-md space-y-sm text-xs cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-zinc-100 text-sm">{rx.user?.name || "Unknown Patient"}</p>
                      <p className="text-[10px] text-slate-400">{rx.user?.email || "—"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-lg text-[9px] font-bold border ${config.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-xs text-[10px]">
                    <span className="text-slate-450">Doctor: {rx.doctorName ? `Dr. ${rx.doctorName}` : "—"}</span>
                    <span className="font-bold text-[#004782] dark:text-[#a4c9ff]">Verify &rarr;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Interactive Modal with Blur Backdrop */}
      {isModalOpen && selectedRx && createPortal(
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[99999] flex items-center justify-center p-md md:p-xl overflow-y-auto animate-[fade-in_0.3s_ease-out]">
          <div 
            className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-lg md:p-xl shadow-2xl max-w-5xl w-full mx-auto my-auto flex flex-col md:flex-row gap-lg md:gap-xl animate-[scale-up_0.2s_ease-out] overflow-hidden max-h-[92vh]"
          >
            {/* Close button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-650 dark:hover:text-zinc-200 transition-colors z-20 cursor-pointer"
              title="Close Panel"
            >
              <X size={20} />
            </button>

            {/* Left Pane: Prescription Image Preview / Gallery */}
            <div className="md:w-[48%] flex flex-col justify-between space-y-md">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-955 overflow-hidden flex flex-col items-center justify-center relative group select-none min-h-[280px] md:min-h-[400px] max-h-[480px] md:max-h-[64vh] w-full shadow-inner">
                {isPDFSelected ? (
                  <div className="flex flex-col items-center justify-center p-md text-center">
                    <FileWarning className="text-red-500 h-10 w-10 mb-xs" />
                    <p className="font-bold text-xs text-slate-700 dark:text-zinc-350 truncate max-w-[180px]">{selectedRx.fileNames?.[activeFileIndex] || selectedRx.name}</p>
                    <a
                      href={activeFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-sm inline-flex items-center gap-xs px-md py-1.5 bg-[#004782] text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-all cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <>
                    <img
                      alt="Prescription Preview"
                      className="w-full h-full object-contain max-h-[480px] md:max-h-[64vh]"
                      src={activeFileUrl}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <a
                         href={activeFileUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="inline-flex items-center gap-xs px-md py-1.5 bg-white text-slate-800 rounded-xl text-[10px] font-bold shadow hover:scale-102 transition-all cursor-pointer"
                      >
                        <ZoomIn size={12} />
                        Open Full Image
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails Row */}
              {selectedRx.fileUrls && selectedRx.fileUrls.length > 1 && (
                <div className="flex gap-sm overflow-x-auto py-1 w-full justify-center custom-scrollbar select-none">
                  {selectedRx.fileUrls.map((url, idx) => {
                    const isPdf = url.toLowerCase().endsWith(".pdf") || selectedRx.fileNames?.[idx]?.toLowerCase().endsWith(".pdf");
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveFileIndex(idx)}
                        className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                          activeFileIndex === idx ? "border-[#038076] scale-102 shadow-sm" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {isPdf ? (
                          <div className="w-full h-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-[9px]">PDF</div>
                        ) : (
                          <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Pane: Details, Checklist, Actions */}
            <div className="md:w-[52%] flex flex-col justify-between space-y-md overflow-y-auto pr-sm custom-scrollbar">
              {/* Header and Status */}
              <div className="flex items-center justify-between pb-sm border-b border-slate-150 dark:border-zinc-850 pr-8">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100 tracking-tight">Prescription Review</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedRx.id || selectedRx._id}</p>
                </div>
                <span className={`inline-flex items-center gap-xs px-2.5 py-1 border rounded-xl text-[10px] font-bold ${activeConfig.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeConfig.dot}`}></span>
                  {activeConfig.label}
                </span>
              </div>

              {/* Patient Credentials */}
              <div className="bg-slate-50/80 dark:bg-zinc-950/80 p-sm rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-650 dark:text-zinc-300 space-y-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider">Patient Name</span>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-150">{selectedRx.user?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-150 truncate max-w-[200px]">{selectedRx.user?.email || "—"}</span>
                </div>
              </div>

              {/* Doctor Details input */}
              <div className="space-y-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Consulting Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter doctor's name (e.g. Dr. Rahul Sharma)..."
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-sm text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none text-slate-800 dark:text-zinc-150"
                />
              </div>

              {/* Cart Snapshot Medicines */}
              {selectedRx.cartSnapshot && selectedRx.cartSnapshot.items && (
                <div className="bg-slate-50/80 dark:bg-zinc-950/80 p-sm rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-650 dark:text-zinc-300 space-y-sm">
                  <h4 className="font-bold text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-150 dark:border-zinc-850 pb-xs flex items-center gap-xs">
                    <FileText size={12} className="text-[#038076]" />
                    Medicines in this Request
                  </h4>
                  <div className="space-y-xs max-h-[100px] overflow-y-auto pr-xs custom-scrollbar">
                    {selectedRx.cartSnapshot.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{item.name}</span>
                        <span className="font-bold text-[#038076] dark:text-[#84d6b9] shrink-0 bg-[#038076]/10 px-2 py-0.5 rounded-lg text-[10px]">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Checklist verification block */}
              <div className="space-y-sm p-sm border border-amber-200/40 rounded-2xl bg-amber-500/[0.02] text-xs">
                <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-xs uppercase tracking-wider text-[9px]">
                  <ShieldCheck size={14} />
                  Physician Verification Checklist
                </h4>
                <ul className="text-slate-550 dark:text-zinc-400 space-y-xs list-disc pl-md text-xs leading-normal">
                  <li>Doctor Name, Reg Number, Seal, and Sign are legible.</li>
                  <li>consultation date is valid (within 6 months).</li>
                  <li>Patient metadata details match.</li>
                  <li>Formula strengths match cart prescription list.</li>
                </ul>
              </div>

              {/* Remarks Notes */}
              <div className="space-y-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pharmacist Remarks</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter verification remarks or rejection reasons..."
                  rows={2}
                  className="w-full p-sm text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none text-slate-800 dark:text-zinc-150"
                />
              </div>

              {/* Decision Actions */}
              <div className="space-y-sm pt-sm border-t border-slate-150 dark:border-zinc-850">
                <div className="flex gap-md">
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs text-xs min-h-[40px]"
                  >
                    <X size={14} />
                    Reject Rx
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#038076] hover:bg-[#02655f] text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs text-xs min-h-[40px]"
                  >
                    <Check size={14} />
                    Approve Rx
                  </button>
                </div>
                
                <div className="flex gap-md pt-xs text-[10px]">
                  <button
                    onClick={() => handleGenericStatusUpdate("Under Verification")}
                    disabled={isSubmitting}
                    className="flex-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold transition-all select-none cursor-pointer text-center text-xs"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleGenericStatusUpdate("Expired")}
                    disabled={isSubmitting}
                    className="flex-1 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold transition-all select-none cursor-pointer text-center text-xs"
                  >
                    Expire
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
