import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useAddress } from "../context/AddressContext";
import AddressSelectorModal from "../components/address/AddressSelectorModal";
import AddressCard from "../components/address/AddressCard";
import { api } from "../services/api";
import SEO from "../components/common/SEO";
import Modal from "../components/Modal";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  ShoppingBag,
  FilePlus,
  RefreshCw,
  Stethoscope,
  MapPin,
  Lock,
  X
} from "lucide-react";

const UploadPrescriptionPage = () => {
  const { user, openLoginModal } = useAuth();
  const { pendingRxFile, setPendingRxFile } = useCart();
  const { selectedAddress } = useAddress();
  const navigate = useNavigate();

  // Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [patientNotes, setPatientNotes] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [latestUploadedRx, setLatestUploadedRx] = useState(null);

  // Saved Prescriptions States
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rxToDelete, setRxToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewRx, setPreviewRx] = useState(null);

  // Error State
  const [errorMsg, setErrorMsg] = useState("");

  // Load saved prescriptions if user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedPrescriptions();
    } else {
      setSavedPrescriptions([]);
    }
  }, [user]);

  const fetchSavedPrescriptions = async () => {
    setLoadingSaved(true);
    try {
      const list = await api.getMyPrescriptions();
      setSavedPrescriptions(list || []);
    } catch (err) {
      console.error("Failed to load saved prescriptions", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Handle pending file passed from header or homepage
  useEffect(() => {
    if (pendingRxFile) {
      setSelectedFile(pendingRxFile);
      setPendingRxFile(null);
    }
  }, [pendingRxFile, setPendingRxFile]);

  // Guest Interceptor: Redirects to login modal on any interaction if logged out
  const handleGuestClick = (e) => {
    if (!user) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      openLoginModal("/upload-prescription");
      return true;
    }
    return false;
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (handleGuestClick(e)) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (handleGuestClick(e)) return;
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg("");
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const isPdf = file.name.endsWith(".pdf") || file.type === "application/pdf";
    if (!validTypes.includes(file.type) && !isPdf) {
      setErrorMsg("Supported file formats: PNG, JPG, JPEG, WEBP, PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Maximum file size allowed is 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  // Upload Submission
  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (handleGuestClick(e)) return;

    if (!selectedFile) {
      setErrorMsg("Please select a prescription file to upload.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      const response = await api.uploadPrescription([selectedFile], patientNotes);
      const rxDoc = response.prescription || response;
      setLatestUploadedRx(rxDoc);
      setUploadSuccess(true);
      setSelectedFile(null);
      setPatientNotes("");
      fetchSavedPrescriptions();
    } catch (err) {
      console.error("Upload failed", err);
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to upload prescription. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (rx, e) => {
    if (e) e.stopPropagation();
    setRxToDelete(rx);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rxToDelete) return;
    setDeleting(true);
    try {
      const rxId = rxToDelete._id || rxToDelete.id;
      await api.deletePrescription(rxId);
      setSavedPrescriptions((prev) => prev.filter((r) => (r._id || r.id) !== rxId));
      if (latestUploadedRx && (latestUploadedRx._id || latestUploadedRx.id) === rxId) {
        setUploadSuccess(false);
        setLatestUploadedRx(null);
      }
      setDeleteModalOpen(false);
      setRxToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  // Use for checkout
  const handleUseForCheckout = async (rx) => {
    try {
      const rxId = rx._id || rx.id;
      if (rxId) {
        await api.checkoutPrescription(rxId);
      }
      navigate("/checkout");
    } catch (err) {
      navigate("/checkout");
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Status Chip Rendering
  const renderStatusChip = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("approved") || s.includes("verified")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
          <CheckCircle2 size={12} /> Verified
        </span>
      );
    }
    if (s.includes("rejected") || s.includes("declined")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50">
          <AlertCircle size={12} /> Rejected
        </span>
      );
    }
    if (s.includes("re-verification") || s.includes("reverification")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50">
          <RefreshCw size={12} /> Needs Reverification
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50">
        <Clock size={12} /> Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fbfa] dark:bg-zinc-950 py-8 md:py-12 select-none text-left">
      <SEO
        title="Upload Prescription (Rx) | WellMeds Super Speciality"
        description="Upload doctor's prescription for authentic medicine verification by licensed clinical pharmacists with express nationwide delivery."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── UNIFORM HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Stethoscope size={14} /> Licensed Pharmacist Verification
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Upload Doctor's Prescription
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Upload a clear image or PDF of your doctor's prescription for quick verification and fast dispatch.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#038076]" />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">100% Confidential</p>
                <p className="text-slate-500 text-[11px]">256-bit SSL Encrypted</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BALANCED TWO-COLUMN RESPONSIVE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN (≈65% - lg:col-span-7) ── */}
          <div className="lg:col-span-7 space-y-6 w-full">

            {/* UPLOAD PRESCRIPTION CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="text-[#038076]" size={22} />
                  Upload Prescription
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  PNG, JPG, JPEG, WEBP, PDF (Max 10MB)
                </span>
              </div>

              {/* INLINE SUCCESS STATE CARD */}
              {uploadSuccess ? (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-6 text-center space-y-5 animate-[fade-in_0.3s_ease-out]">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/20">
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      ✓ Prescription Uploaded Successfully
                    </h3>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {latestUploadedRx?.name || latestUploadedRx?.filename || "Prescription Document"} — Uploaded Successfully
                    </p>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto pt-1">
                      Your prescription has been uploaded successfully and is waiting for pharmacist verification.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUseForCheckout(latestUploadedRx)}
                      className="bg-[#038076] hover:bg-[#026860] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag size={15} /> Use For Checkout
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(latestUploadedRx, e)}
                      className="border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSuccess(false);
                        setSelectedFile(null);
                        setLatestUploadedRx(null);
                      }}
                      className="border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FilePlus size={15} /> Upload Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-5">

                  {/* Error Banner */}
                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                      <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onClick={handleGuestClick}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all ${dragActive
                        ? "border-[#038076] bg-teal-50/60 dark:bg-teal-950/30 scale-[1.01]"
                        : "border-slate-250 dark:border-zinc-800 hover:border-[#038076] bg-slate-50/50 dark:bg-zinc-950/50 cursor-pointer"
                      }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileSelect}
                      onClick={handleGuestClick}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="w-16 h-16 rounded-2xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mx-auto mb-4">
                      <UploadCloud size={32} />
                    </div>

                    <p className="text-base font-extrabold text-slate-800 dark:text-zinc-100 mb-1">
                      Upload Prescription
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
                      or Drag & Drop your prescription here
                    </p>

                    <div className="inline-flex items-center gap-2 bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#026860] transition-all cursor-pointer">
                      <FileText size={15} /> Select Prescription File
                    </div>
                  </div>

                  {/* Selected File Display */}
                  {selectedFile && (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs">
                      <div className="flex items-center gap-3 truncate">
                        <FileText size={20} className="text-[#038076] shrink-0" />
                        <div className="truncate">
                          <p className="font-extrabold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Patient Notes */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Notes or Instructions for Pharmacist <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      placeholder="e.g. Please supply 1 month course of prescribed medicines."
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                    />
                  </div>

                  {/* Submit Button */}
                  {!user ? (
                    <button
                      type="button"
                      onClick={handleGuestClick}
                      className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <span>Login to Upload Prescription</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      <span>{uploading ? "Uploading..." : "Upload & Save Prescription"}</span>
                    </button>
                  )}

                </form>
              )}
            </div>

            {/* SAVED PRESCRIPTIONS CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-[#038076]" size={22} />
                  Saved Prescriptions
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {savedPrescriptions.length} {savedPrescriptions.length === 1 ? "Record" : "Records"}
                </span>
              </div>

              {!user ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                  <FileText size={32} className="mx-auto text-slate-400 opacity-60" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Login to view your saved prescriptions</p>
                  <button
                    type="button"
                    onClick={() => openLoginModal("/upload-prescription")}
                    className="bg-[#038076] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Login Now</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : loadingSaved ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin border-2 border-[#038076] border-t-transparent rounded-full w-4 h-4" />
                  <span>Loading saved prescriptions...</span>
                </div>
              ) : savedPrescriptions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-2">
                  <FileText size={32} className="mx-auto text-slate-400 opacity-60 mb-1" />
                  <p className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">No saved prescriptions yet.</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Uploaded prescriptions will automatically be saved here for reuse and checkout.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedPrescriptions.map((rx) => {
                    const rxId = rx._id || rx.id;
                    const filename = rx.name || rx.filename || rx.originalName || `Prescription #${rxId?.slice(-6).toUpperCase()}`;
                    const uploadDate = formatDate(rx.createdAt || rx.uploadDate);

                    return (
                      <div
                        key={rxId}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 hover:border-[#038076]/40 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 truncate min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-[#038076]/10 text-[#038076] flex items-center justify-center shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="truncate">
                                <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                  {filename}
                                </p>
                                {uploadDate && (
                                  <p className="text-[10px] text-slate-400">Uploaded {uploadDate}</p>
                                )}
                              </div>
                            </div>
                            {renderStatusChip(rx.status)}
                          </div>

                          {rx.adminNotes && (
                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-slate-150 dark:border-zinc-800 italic">
                              "{rx.adminNotes}"
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
                          {rx.fileUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewRx(rx);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} /> View
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUseForCheckout(rx)}
                            className="px-3 py-1.5 rounded-xl bg-[#038076] hover:bg-[#026860] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag size={12} /> Use For Checkout
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(rx, e)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            title="Delete Prescription"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN (≈35% - lg:col-span-5) ── */}
          <div className="lg:col-span-5 space-y-6 w-full">

            {/* DELIVERY ADDRESS CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#038076]" size={20} />
                  Delivery Address
                </h3>

                {user && (
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="text-xs font-bold text-[#038076] dark:text-[#84d6b9] hover:underline cursor-pointer"
                  >
                    {selectedAddress ? "Change" : "Select"}
                  </button>
                )}
              </div>

              {!user ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                  <MapPin size={24} className="mx-auto text-slate-400 mb-1 opacity-60" />
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">Delivery location required</p>
                  <button
                    type="button"
                    onClick={() => openLoginModal("/upload-prescription")}
                    className="bg-[#038076] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                  >
                    Login to Select Address
                  </button>
                </div>
              ) : selectedAddress ? (
                <AddressCard
                  address={selectedAddress}
                  isSelected={true}
                  showActions={false}
                />
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                  <MapPin size={24} className="mx-auto text-slate-400 mb-1 opacity-60" />
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">No delivery address selected</p>
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="bg-[#038076] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                  >
                    Select Delivery Address
                  </button>
                </div>
              )}
            </div>

            {/* PHARMACIST SUPPORT & VERIFICATION PROCESS CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 w-full">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <Stethoscope className="text-[#038076]" size={20} />
                Verification Process
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-start gap-3.5 bg-slate-50/70 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                  <Clock className="w-5 h-5 text-[#038076] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">15-Minute Rapid Review</p>
                    <p className="text-xs text-slate-500 pt-0.5 leading-relaxed">Our clinical team verifies doctor details, medicine names, and dosages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-slate-50/70 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                  <ShieldCheck className="w-5 h-5 text-[#038076] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">100% Genuine Medicines</p>
                    <p className="text-xs text-slate-500 pt-0.5 leading-relaxed">Sourced directly from certified pharmaceutical manufacturers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-slate-50/70 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                  <Lock className="w-5 h-5 text-[#038076] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">Privacy & SSL Security</p>
                    <p className="text-xs text-slate-500 pt-0.5 leading-relaxed">Your health data and prescription records are encrypted and protected.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON PLACED DIRECTLY UNDER VERIFICATION PROCESS CARD */}
            <div className="pt-1">
              {!user ? (
                <button
                  type="button"
                  onClick={() => openLoginModal("/upload-prescription")}
                  className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <span>LOGIN TO UPLOAD PRESCRIPTION</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={uploading || !selectedFile}
                  className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                  ) : (
                    <UploadCloud size={16} />
                  )}
                  <span>{uploading ? "UPLOADING..." : "UPLOAD & SAVE PRESCRIPTION"}</span>
                  {!uploading && <ArrowRight size={16} />}
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ── ADDRESS SELECTOR MODAL ── */}
      <AddressSelectorModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />

      {/* ── LIGHTWEIGHT DELETE CONFIRMATION MODAL ── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Prescription?"
        maxWidth="max-w-sm"
        showCloseButton={true}
      >
        <div className="space-y-5 py-2 text-left select-none">
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to delete this prescription? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-250 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── PREVIEW MODAL ── */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewRx?.name || previewRx?.filename || "Prescription Preview"}
        maxWidth="max-w-2xl"
        showCloseButton={true}
      >
        <div className="py-3 text-center space-y-4">
          {previewRx?.fileUrl ? (
            previewRx.fileUrl.endsWith(".pdf") ? (
              <iframe
                src={previewRx.fileUrl}
                title="Prescription PDF"
                className="w-full h-96 rounded-xl border border-slate-200 dark:border-zinc-800"
              />
            ) : (
              <img
                src={previewRx.fileUrl}
                alt="Prescription Preview"
                className="max-h-96 w-auto mx-auto rounded-xl object-contain border border-slate-200 dark:border-zinc-800 shadow-xs"
              />
            )
          ) : (
            <p className="text-xs text-slate-400">No file preview available.</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-[#038076] text-white text-xs font-bold hover:bg-[#026860] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default UploadPrescriptionPage;
