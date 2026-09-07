import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
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
  ArrowLeft,
  ArrowRight,
  Eye,
  ShoppingBag,
  Camera,
  Image as ImageIcon,
  History,
  Info,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";

const UploadPrescriptionPage = () => {
  const { user, openLoginModal } = useAuth();
  const { pendingRxFile, setPendingRxFile } = useCart();
  const navigate = useNavigate();

  // Hidden File Inputs Refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [patientNotes, setPatientNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [latestUploadedRx, setLatestUploadedRx] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToastMessage = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg("");
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Saved Prescriptions States
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [pastRxModalOpen, setPastRxModalOpen] = useState(false);
  const [selectedSavedRx, setSelectedSavedRx] = useState(null);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rxToDelete, setRxToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewRx, setPreviewRx] = useState(null);

  // Load saved prescriptions if user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedPrescriptions();
    } else {
      setSavedPrescriptions([]);
    }
  }, [user]);

  // Handle pending file passed from header or homepage
  useEffect(() => {
    if (pendingRxFile) {
      validateAndSetFile(pendingRxFile);
      setPendingRxFile(null);
    }
  }, [pendingRxFile, setPendingRxFile]);

  // Generate image preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    if (selectedFile.type && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [selectedFile]);

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

  // Guest Interceptor: Redirects to login modal on any interaction if logged out
  const handleGuestClick = (e) => {
    if (!user) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (openLoginModal) {
        openLoginModal("/upload-prescription");
      } else {
        navigate("/login", { state: { from: "/upload-prescription" } });
      }
      return true;
    }
    return false;
  };

  const validateAndSetFile = (file) => {
    setErrorMsg("");
    if (!file) return;

    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".heic", ".heif"];
    const fileNameLower = (file.name || "").toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));
    const isValidType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "image/heic" ||
      file.type === "image/heif";

    if (!isValidType && !isValidExt) {
      setErrorMsg("Supported formats: JPG, JPEG, PNG, PDF, WebP, HEIF and HEIC.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size must be under 10 MB.");
      return;
    }

    setSelectedFile(file);
    setSelectedSavedRx(null);
    setUploadSuccess(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerUploadInput = (e) => {
    if (handleGuestClick(e)) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const triggerCameraInput = (e) => {
    if (handleGuestClick(e)) return;
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
      cameraInputRef.current.click();
    }
  };

  const handlePastPrescriptionClick = (e) => {
    if (handleGuestClick(e)) return;
    fetchSavedPrescriptions();
    setPastRxModalOpen(true);
  };

  // Upload Submission & Proceed
  const handleProceed = async (e) => {
    if (e) e.preventDefault();
    if (handleGuestClick(e)) return;

    // If a saved prescription is selected
    if (selectedSavedRx) {
      try {
        const rxId = selectedSavedRx._id || selectedSavedRx.id;
        if (rxId) {
          await api.checkoutPrescription(rxId);
        }
        navigate("/checkout");
      } catch (err) {
        navigate("/checkout");
      }
      return;
    }

    // If an upload was already completed
    if (uploadSuccess && latestUploadedRx) {
      handleUseForCheckout(latestUploadedRx);
      return;
    }

    // If no file selected yet, show popup message for 4 seconds
    if (!selectedFile) {
      showToastMessage("Please upload a prescription");
      return;
    }

    // Upload selected file
    setUploading(true);
    setErrorMsg("");

    try {
      const response = await api.uploadPrescription([selectedFile], patientNotes);
      const rxDoc = response.prescription || response;
      setLatestUploadedRx(rxDoc);
      setUploadSuccess(true);
      fetchSavedPrescriptions();

      // Proceed directly to checkout
      const rxId = rxDoc._id || rxDoc.id;
      if (rxId) {
        try {
          await api.checkoutPrescription(rxId);
        } catch {
          // ignore error and navigate
        }
      }
      navigate("/checkout");
    } catch (err) {
      console.error("Upload failed", err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload prescription. Please try again."
      );
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
      if (selectedSavedRx && (selectedSavedRx._id || selectedSavedRx.id) === rxId) {
        setSelectedSavedRx(null);
      }
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

  // Select a past Rx
  const handleSelectPastRx = (rx) => {
    setSelectedSavedRx(rx);
    setSelectedFile(null);
    setUploadSuccess(false);
    setPastRxModalOpen(false);
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
    } catch {
      return dateString;
    }
  };

  // Status Chip Rendering
  const renderStatusChip = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("approved") || s.includes("verified")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
          <CheckCircle2 size={11} /> Verified
        </span>
      );
    }
    if (s.includes("rejected") || s.includes("declined")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50">
          <AlertCircle size={11} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50">
        <Clock size={11} /> Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100 pb-28 md:pb-16 font-sans">
      <SEO
        title="Upload Prescription | WellMeds"
        description="Upload your prescription to order genuine medicines verified by licensed pharmacists."
      />

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,image/heic,image/heif"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Mobile / Back Header (Hidden in Desktop View) */}
      <div className="md:hidden border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Upload Prescription
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Upload your prescription to start ordering
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Please ensure that the prescription is valid and contains doctor, patient and
                medicine details.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-[fade-in_0.2s_ease-out]">
                <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── ACTION BUTTONS: CHOOSE FROM GALLERY & SELECT FROM E-PRESCRIPTION ── */}
            <div className="space-y-3 pt-2">
              <div className="border-t border-dashed border-slate-200 dark:border-zinc-800 mb-3" />

              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                Add Photos / PDF using:
              </p>

              {/* CHOOSE FROM GALLERY BUTTON */}
              <button
                type="button"
                onClick={triggerUploadInput}
                className="w-full bg-[#136258] hover:bg-[#0e4e46] active:scale-[0.99] text-white font-bold h-12 sm:h-13 rounded-xl shadow-xs flex items-center justify-center gap-3 uppercase tracking-wider text-xs sm:text-sm cursor-pointer transition-all"
              >
                {/* Gallery / Photos Icon */}
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white shrink-0">
                  <path d="M6 4h14v2H6v14H4V6c0-1.1.9-2 2-2z" fill="white" />
                  <rect x="7" y="6" width="17" height="15" rx="2" stroke="white" strokeWidth="2" />
                  <path d="M10 17l3.5-4 2.5 3 2.5-3 3.5 4H10z" fill="white" />
                  <circle cx="12" cy="10" r="1.5" fill="white" />
                </svg>
                <span>CHOOSE FROM GALLERY</span>
              </button>

              {/* OR DIVIDER */}
              <div className="text-center py-0.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  OR
                </span>
              </div>

              {/* SELECT FROM E-PRESCRIPTION BUTTON */}
              <button
                type="button"
                onClick={handlePastPrescriptionClick}
                className="w-full bg-[#136258] hover:bg-[#0e4e46] active:scale-[0.99] text-white font-bold h-12 sm:h-13 rounded-xl shadow-xs flex items-center justify-center gap-3 uppercase tracking-wider text-xs sm:text-sm cursor-pointer transition-all"
              >
                {/* Rx Document Icon */}
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0">
                  <path d="M6 3C6 1.9 6.9 1 8 1H17L22 6V25C22 26.1 21.1 27 20 27H8C6.9 27 6 26.1 6 25V3Z" fill="white" />
                  <text x="14" y="18" fill="#136258" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                    ℞
                  </text>
                </svg>
                <span>SELECT FROM E-PRESCRIPTION</span>
              </button>

              {/* Disclaimer note */}
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center pt-2 font-medium">
                *As Per Govt. Regulations We Dispense Full Strips of Medicines
              </p>
            </div>

            {/* ── INFO BOX ("Please keep in mind:") ── */}
            <div className="bg-[#F1F8FD] dark:bg-[#091b26] border border-[#DCF0FC] dark:border-[#133c54] rounded-2xl p-5 sm:p-6 text-left space-y-3">
              <div className="flex items-center gap-2 text-[#038076] dark:text-[#84d6b9] font-bold text-sm sm:text-base">
                <Info size={19} className="shrink-0 text-[#038076] dark:text-[#84d6b9]" />
                <span className="text-slate-800 dark:text-white font-bold">Please keep in mind:</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                <li>
                  Prescription should be <span className="font-medium text-slate-700 dark:text-slate-200">valid and contains, doctor, patient, date and medicine details</span>
                </li>
                <li>
                  Supported formats: <span className="font-medium text-slate-700 dark:text-slate-200">JPG, JPEG, PNG, PDF, WebP, HEIF and HEIC</span>
                </li>
                <li>
                  File size must be <span className="font-medium text-slate-700 dark:text-slate-200">under 5 MB</span>
                </li>
              </ul>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-150 dark:border-zinc-800/80 pt-1" />

            {/* ── PHARMACIST CALL CARD ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
              {/* Pharmacist Avatar with Telephone */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFDB70] border border-amber-200/60 flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover"
                  >
                    {/* Yellow circular background */}
                    <circle cx="32" cy="32" r="32" fill="#FFDB70" />

                    {/* Back Hair */}
                    <path
                      d="M16 32C16 20 22 13 32 13C42 13 48 20 48 32C48 38 47 43 45 47L19 47C17 43 16 38 16 32Z"
                      fill="#262E39"
                    />

                    {/* Neck */}
                    <rect x="29" y="38" width="6" height="7" fill="#F4BD8A" />

                    {/* Face */}
                    <circle cx="32" cy="30" r="13" fill="#FDD6A4" />

                    {/* Front Bangs Hair */}
                    <path
                      d="M19 28C21 21 26 19 32 19C38 19 43 21 45 28C43 25 39 23 35 25C33 26 31 26 29 25C25 23 21 25 19 28Z"
                      fill="#262E39"
                    />
                    <path d="M18 29C17.5 35 18 41 20 44C19 40 18 35 19 29Z" fill="#262E39" />
                    <path d="M46 29C46.5 35 46 41 44 44C45 40 46 35 46 29Z" fill="#262E39" />

                    {/* Eyes */}
                    <circle cx="27" cy="29.5" r="1.8" fill="#262E39" />
                    <circle cx="37" cy="29.5" r="1.8" fill="#262E39" />
                    <circle cx="27.5" cy="29" r="0.6" fill="#FFFFFF" />
                    <circle cx="37.5" cy="29" r="0.6" fill="#FFFFFF" />

                    {/* Eyebrows */}
                    <path d="M25 26.5C26 25.8 28 25.8 29 26.5" stroke="#262E39" strokeWidth="1" strokeLinecap="round" />
                    <path d="M35 26.5C36 25.8 38 25.8 39 26.5" stroke="#262E39" strokeWidth="1" strokeLinecap="round" />

                    {/* White Round Glasses */}
                    <circle cx="27" cy="29.5" r="4.8" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
                    <circle cx="37" cy="29.5" r="4.8" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
                    <path d="M31.8 29.5H32.2" stroke="#FFFFFF" strokeWidth="1.8" />
                    <path d="M22.2 29.5L19.5 28.5" stroke="#FFFFFF" strokeWidth="1.5" />
                    <path d="M41.8 29.5L44.5 28.5" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* Smile */}
                    <path
                      d="M29 35C30.5 37 33.5 37 35 35"
                      stroke="#C53030"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    {/* White Doctor Coat */}
                    <path
                      d="M12 60C12 47 21 42 32 42C43 42 52 47 52 60H12Z"
                      fill="#FFFFFF"
                    />

                    {/* Cyan Scrub Shirt */}
                    <path d="M27 42L32 50L37 42H27Z" fill="#64C6EE" />
                    <path d="M32 50V60" stroke="#E2E8F0" strokeWidth="1.5" />

                    {/* Coat Lapels */}
                    <path d="M23 42L29 53L32 45L27 42H23Z" fill="#F1F5F9" />
                    <path d="M41 42L35 53L32 45L37 42H41Z" fill="#F1F5F9" />

                    {/* Black Telephone Handset (Held at Ear) */}
                    <g filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))">
                      {/* Earpiece */}
                      <ellipse cx="45" cy="34" rx="3.5" ry="4.5" transform="rotate(20 45 34)" fill="#1E293B" />
                      {/* Handle */}
                      <path
                        d="M45.5 36C47.5 40 48.5 45 46.5 50L43 48.5C44.5 44.5 43.5 40 42 37.5L45.5 36Z"
                        fill="#1E293B"
                      />
                      {/* Mouthpiece */}
                      <ellipse cx="44" cy="50" rx="3.5" ry="4" transform="rotate(-15 44 50)" fill="#1E293B" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Pharmacist call
                  </h3>
                  <span className="bg-[#EAF7EE] dark:bg-[#0c3121] text-[#008A4B] dark:text-[#6ee7b7] text-xs font-bold px-3 py-0.5 rounded-full shrink-0">
                    Free
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                  Our pharmacist will call to confirm the medicines in your prescription
                </p>
              </div>
            </div>

            {/* Popup Toast Banner (Auto-dismisses after 4s) */}
            {toastMsg && (
              <div className="w-full bg-[#5F6368] dark:bg-zinc-700 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-lg text-center shadow-md animate-[fade-in_0.2s_ease-out] transition-all">
                {toastMsg}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (Desktop Sticky Card & Illustration) ── */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-between bg-[#fbfdfc] dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-8 min-h-[460px] shadow-2xs space-y-6 sticky top-24 self-start">
            {/* Top Area: Illustration OR Selected File Preview */}
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {selectedFile ? (
                /* Selected File Card */
                <div className="w-full bg-white dark:bg-zinc-900 border border-[#038076]/30 dark:border-[#038076]/40 rounded-2xl p-5 shadow-xs space-y-4 animate-[fade-in_0.2s_ease-out]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {filePreviewUrl ? (
                        <img
                          src={filePreviewUrl}
                          alt="Prescription preview"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#eef7f5] dark:bg-[#0c241e] text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0">
                          <FileText size={28} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadSuccess(false);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Optional Notes Toggle / Input */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    {!showNotesInput && !patientNotes ? (
                      <button
                        type="button"
                        onClick={() => setShowNotesInput(true)}
                        className="text-xs font-semibold text-[#038076] dark:text-[#84d6b9] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Add note for pharmacist (optional)
                      </button>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                          Notes for Pharmacist
                        </label>
                        <textarea
                          rows={2}
                          value={patientNotes}
                          onChange={(e) => setPatientNotes(e.target.value)}
                          placeholder="e.g. Please supply 1 month course"
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#038076]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedSavedRx ? (
                /* Selected Past Prescription Card */
                <div className="w-full bg-white dark:bg-zinc-900 border border-[#038076]/30 dark:border-[#038076]/40 rounded-2xl p-5 shadow-xs space-y-4 animate-[fade-in_0.2s_ease-out]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#eef7f5] dark:bg-[#0c241e] text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0">
                        <FileText size={28} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {selectedSavedRx.name ||
                            selectedSavedRx.filename ||
                            `Prescription #${(selectedSavedRx._id || selectedSavedRx.id || "").slice(-6).toUpperCase()}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStatusChip(selectedSavedRx.status)}
                          <span className="text-[11px] text-slate-400">
                            {formatDate(selectedSavedRx.createdAt || selectedSavedRx.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSavedRx(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Clear selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Sleek Rx Vector Graphic (Matching Reference Image) */
                <div className="py-6 flex flex-col items-center text-center select-none">
                  <div className="relative w-64 h-56 flex items-center justify-center">
                    <svg
                      viewBox="0 0 260 220"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      {/* Soft Shadow Base */}
                      <ellipse cx="130" cy="205" rx="100" ry="10" fill="#E2E8F0" opacity="0.6" />

                      {/* Pill Bottle 1 (Yellow / Amber) */}
                      <rect x="35" y="105" width="40" height="90" rx="6" fill="#FEEBC8" />
                      <rect x="32" y="96" width="46" height="12" rx="4" fill="#FBD38D" />
                      <rect x="42" y="125" width="26" height="40" rx="3" fill="#FFF5E6" />
                      <rect x="47" y="133" width="16" height="3" rx="1.5" fill="#E2E8F0" />
                      <rect x="47" y="140" width="12" height="3" rx="1.5" fill="#E2E8F0" />

                      {/* Pill Bottle 2 (Green / Teal Bottle Behind) */}
                      <rect x="180" y="110" width="45" height="85" rx="6" fill="#68D391" />
                      <rect x="177" y="102" width="51" height="12" rx="4" fill="#48BB78" />
                      <rect x="188" y="130" width="29" height="38" rx="3" fill="#C6F6D5" />

                      {/* Main Prescription Document (Curled & Modern) */}
                      <g filter="drop-shadow(0px 8px 16px rgba(3, 128, 118, 0.12))">
                        <path
                          d="M60 45C60 36.7157 66.7157 30 75 30H175C183.284 30 190 36.7157 190 45V185C190 193.284 183.284 200 175 200H85C71.1929 200 60 188.807 60 175V45Z"
                          fill="#88CDF2"
                        />
                        <path
                          d="M65 50C65 42.8203 70.8203 37 78 37H170C177.18 37 183 42.8203 183 50V180C183 187.18 177.18 193 170 193H88C75.2975 193 65 182.703 65 170V50Z"
                          fill="#A5DCF7"
                        />

                        {/* Rx Symbol Badge */}
                        <circle cx="125" cy="80" r="24" fill="#62B6E8" />
                        <text
                          x="125"
                          y="88"
                          fill="white"
                          fontSize="22"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                        >
                          ℞
                        </text>

                        {/* Prescription Lines */}
                        <rect x="85" y="120" width="80" height="5" rx="2.5" fill="#FFFFFF" />
                        <rect x="85" y="132" width="80" height="5" rx="2.5" fill="#FFFFFF" />
                        <rect x="85" y="144" width="55" height="5" rx="2.5" fill="#FFFFFF" />

                        {/* Bottom Curl of Rx Sheet */}
                        <path
                          d="M60 175C60 188.807 71.1929 200 85 200H195C195 200 195 190 185 190H85C76.7157 190 70 183.284 70 175V165C65 168 60 171 60 175Z"
                          fill="#539FCB"
                        />
                      </g>

                      {/* Cyan / Blue Capsule Tablet */}
                      <g transform="rotate(-30 45 195)">
                        <rect x="35" y="190" width="22" height="10" rx="5" fill="#4FD1C5" />
                        <rect x="46" y="190" width="11" height="10" rx="0" fill="#319795" />
                      </g>

                      {/* Purple / Blue Capsule Tablet */}
                      <g transform="rotate(25 210 195)">
                        <rect x="200" y="190" width="22" height="10" rx="5" fill="#B794F4" />
                        <rect x="211" y="190" width="11" height="10" rx="0" fill="#805AD5" />
                      </g>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Area: Proceed Button */}
            <div className="w-full space-y-3">
              {toastMsg && (
                <div className="w-full bg-[#5F6368] dark:bg-zinc-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center shadow-md animate-[fade-in_0.2s_ease-out]">
                  {toastMsg}
                </div>
              )}
              <button
                type="button"
                onClick={handleProceed}
                disabled={uploading}
                className="w-full bg-[#038076] hover:bg-[#026860] active:scale-[0.99] text-white font-bold h-12 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : null}
                <span>
                  {uploading
                    ? "Uploading..."
                    : selectedFile
                    ? "Upload & Proceed"
                    : selectedSavedRx
                    ? "Proceed with Selected"
                    : "Proceed"}
                </span>
                {!uploading && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FIXED BOTTOM BAR (Matching Mobile Screenshot) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between text-xs px-1 text-slate-600 dark:text-zinc-300">
            <span className="truncate font-semibold max-w-[200px]">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
        {selectedSavedRx && (
          <div className="mb-2 flex items-center justify-between text-xs px-1 text-slate-600 dark:text-zinc-300">
            <span className="truncate font-semibold max-w-[200px]">
              {selectedSavedRx.name || selectedSavedRx.filename || "Saved Prescription"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedSavedRx(null)}
              className="text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        )}
        {toastMsg && (
          <div className="mb-2.5 w-full bg-[#5F6368] dark:bg-zinc-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center shadow-md animate-[fade-in_0.2s_ease-out]">
            {toastMsg}
          </div>
        )}
        <button
          type="button"
          onClick={handleProceed}
          disabled={uploading}
          className="w-full bg-[#038076] hover:bg-[#026860] active:scale-[0.98] text-white font-bold h-12 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
          ) : null}
          <span>
            {uploading
              ? "Uploading..."
              : selectedFile
              ? "Upload & Proceed"
              : selectedSavedRx
              ? "Proceed with Selected"
              : "Proceed"}
          </span>
          {!uploading && <ArrowRight size={16} />}
        </button>
      </div>

      {/* ── PAST PRESCRIPTIONS MODAL ── */}
      <Modal
        isOpen={pastRxModalOpen}
        onClose={() => setPastRxModalOpen(false)}
        title="Select Past Prescription"
        maxWidth="max-w-2xl"
        showCloseButton={true}
      >
        <div className="py-2 text-left space-y-4">
          {loadingSaved ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-[#038076]" size={18} />
              <span>Loading saved prescriptions...</span>
            </div>
          ) : savedPrescriptions.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={28} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                No past prescriptions found
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                Upload a prescription first. It will be saved securely for fast re-ordering.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPastRxModalOpen(false);
                  triggerUploadInput();
                }}
                className="mt-2 bg-[#038076] hover:bg-[#026860] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Upload Prescription Now
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {savedPrescriptions.map((rx) => {
                const rxId = rx._id || rx.id;
                const filename =
                  rx.name ||
                  rx.filename ||
                  rx.originalName ||
                  `Prescription #${rxId?.slice(-6).toUpperCase()}`;
                const uploadDate = formatDate(rx.createdAt || rx.uploadDate);

                return (
                  <div
                    key={rxId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 hover:border-[#038076]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#eef7f5] dark:bg-[#0c241e] text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStatusChip(rx.status)}
                          {uploadDate && (
                            <span className="text-[11px] text-slate-400">{uploadDate}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {rx.fileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewRx(rx);
                            setPreviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> View
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectPastRx(rx)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#038076] hover:bg-[#026860] text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag size={13} /> Select
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(rx, e)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ── */}
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
