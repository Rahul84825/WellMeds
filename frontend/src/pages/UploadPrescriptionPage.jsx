import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useAddress } from "../context/AddressContext";
import AddressSelectorModal from "../components/address/AddressSelectorModal";
import AddressCard from "../components/address/AddressCard";
import { api } from "../services/api";
import Loader from "../components/Loader";
import SEO from "../components/common/SEO";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  Clock, 
  Camera, 
  Trash2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FilePlus, 
  MessageSquare,
  Stethoscope,
  RefreshCcw,
  ShoppingBag
} from "lucide-react";

const UploadPrescriptionPage = () => {
  const { user, openLoginModal } = useAuth();
  const { pendingRxFile, setPendingRxFile } = useCart();
  const { addresses, selectedAddress } = useAddress();
  const navigate = useNavigate();

  // Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Contact Info (Auto-filled from user account)
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerMobile, setCustomerMobile] = useState(user?.mobile || user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");

  // Prescription Notes & Options
  const [rxNotes, setRxNotes] = useState("");
  const [orderMethod, setOrderMethod] = useState("upload-and-order"); // "upload-and-order" | "callback"
  const [durationValue, setDurationValue] = useState("7");
  const [durationUnit, setDurationUnit] = useState("Days");

  // Success Confirmation State
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdRxRecord, setCreatedRxRecord] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setCustomerMobile(user.mobile || user.phone || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  // Handle pending file passed from homepage or header
  useEffect(() => {
    if (pendingRxFile) {
      setUploadFiles([pendingRxFile]);
      setPendingRxFile(null);
    }
  }, [pendingRxFile, setPendingRxFile]);

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (files) => {
    const validFiles = files.filter((f) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type) || f.name.endsWith(".pdf");
      const isValidSize = f.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setUploadFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Prescription Flow
  const handleSubmitPrescription = async (e) => {
    if (e) e.preventDefault();

    if (!user) {
      openLoginModal("/upload-prescription");
      return;
    }

    if (uploadFiles.length === 0) {
      return;
    }

    if (!selectedAddress) {
      setAddressModalOpen(true);
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("prescription", uploadFiles[0]); // Primary file
      formData.append("customerName", customerName.trim());
      formData.append("customerMobile", customerMobile.trim());
      formData.append("customerEmail", customerEmail.trim());
      formData.append("notes", `${rxNotes} ${orderMethod === "upload-and-order" ? `(Supply duration: ${durationValue} ${durationUnit})` : "(Requested Callback)"}`.trim());
      formData.append("orderMethod", orderMethod);
      formData.append("shippingAddress", selectedAddress.formattedAddress || `${selectedAddress.houseNo}, ${selectedAddress.building}, ${selectedAddress.street}, ${selectedAddress.city}`);

      setUploadProgress(60);

      const response = await api.uploadPrescription(formData);
      setUploadProgress(100);

      setCreatedRxRecord(response.prescription || response);
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#f8fbfa] dark:bg-zinc-950 py-12 md:py-16 select-none text-left">
        <SEO title="Prescription Submitted | WellMeds" description="Your prescription has been submitted to licensed pharmacists." />

        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-md text-center space-y-6 animate-[fade-in_0.3s_ease-out]">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/30">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <span className="inline-block bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Rx Verification Initiated
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Prescription Uploaded Successfully!
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                Our licensed clinical pharmacists are reviewing your prescription. You will receive an SMS & WhatsApp notification within 15 minutes.
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400 font-medium">
                <span>Reference Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{createdRxRecord?._id?.slice(-8).toUpperCase() || "RX-88291"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400 font-medium">
                <span>Expected Review Time:</span>
                <span className="font-bold text-[#038076] dark:text-[#84d6b9]">Within 15 Minutes</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400 font-medium">
                <span>Delivery Destination:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {selectedAddress?.city || "Pune"}, {selectedAddress?.state || "Maharashtra"}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Link
                to="/profile"
                className="w-full sm:w-auto bg-[#038076] hover:bg-[#026860] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Track Prescription Status
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto border border-slate-250 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 px-8 py-3 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wellmeds-editorial-bg py-8 md:py-12 select-none text-left">
      <SEO 
        title="Upload Medical Prescription (Rx) | WellMeds Super Speciality" 
        description="Upload doctor's prescription for authentic medicine verification by licensed clinical pharmacists with 2-hour express delivery." 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── EDITORIAL HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs text-center sm:text-left space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Stethoscope size={14} /> Registered Pharmacist Service
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Upload Prescription & Order Online
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                Upload a clear image or PDF of your doctor's prescription. Our clinical team verifies your medicines for safety, dosage, and 100% authenticity.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs shrink-0">
              <Clock className="w-8 h-8 text-[#038076]" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">15-Minute Response</p>
                <p className="text-slate-500 text-[11px]">Rapid pharmacist review</p>
              </div>
            </div>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
            <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-850">
              <ShieldCheck className="w-4 h-4 text-[#038076] shrink-0" />
              <span>Licensed Pharmacist Review</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-850">
              <Sparkles className="w-4 h-4 text-[#038076] shrink-0" />
              <span>Express Nationwide Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-850">
              <CheckCircle2 className="w-4 h-4 text-[#038076] shrink-0" />
              <span>100% Authentic Medicines</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-850">
              <FileText className="w-4 h-4 text-[#038076] shrink-0" />
              <span>SSL Encrypted & Secure</span>
            </div>
          </div>
        </div>

        {/* ── MAIN WORKFLOW GRID ── */}
        <form onSubmit={handleSubmitPrescription} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN (7 COLS): UPLOAD & NOTES ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Upload Experience Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="text-[#038076]" size={18} />
                  1. Upload Prescription Files
                </h3>
                <span className="text-[11px] font-bold text-slate-400">JPG, PNG, WEBP, PDF (Max 10MB)</span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-[#038076] bg-teal-50/60 dark:bg-teal-950/30 scale-[1.01]"
                    : "border-slate-300 dark:border-zinc-800 hover:border-[#038076] bg-slate-50/50 dark:bg-zinc-950/50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="w-14 h-14 rounded-2xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mx-auto mb-3">
                  <UploadCloud size={28} />
                </div>

                <p className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 mb-1">
                  Drag & Drop prescription files here
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  or click to browse from your device
                </p>

                <div className="inline-flex items-center gap-2 bg-[#038076] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer">
                  <Camera size={15} /> Browse Files / Take Photo
                </div>
              </div>

              {/* Selected Files List */}
              {uploadFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Selected Documents ({uploadFiles.length})
                  </p>

                  <div className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText size={18} className="text-[#038076] shrink-0" />
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#038076] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prescription Notes Editor */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <MessageSquare className="text-[#038076]" size={18} />
                2. Dosage Notes or Pharmacist Instructions <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </h3>

              <textarea
                rows={3}
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                placeholder="e.g. Please supply 1 month course of Telmisartan 40mg. Prefer Sun Pharma brand if available."
                className="w-full bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-250 dark:border-zinc-800 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all resize-none"
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 COLS): ADDRESS, CONTACT & SUBMIT ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Auto-filled Contact Details Summary */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <User className="text-[#038076]" size={18} />
                3. Customer Contact Info
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Invoice email"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Selection Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#038076]" size={18} />
                  4. Delivery Address
                </h3>

                {user && (
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="text-xs font-bold text-[#038076] dark:text-[#84d6b9] hover:underline cursor-pointer"
                  >
                    {selectedAddress ? "Change Address" : "Select Address"}
                  </button>
                )}
              </div>

              {selectedAddress ? (
                <AddressCard
                  address={selectedAddress}
                  isSelected={true}
                  showActions={false}
                />
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                  <MapPin size={28} className="mx-auto text-slate-400 mb-1 opacity-60" />
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">No delivery address selected</p>
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="bg-[#038076] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                  >
                    Select or Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Order Method Selector */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Select Processing Method</h3>

              <div className="space-y-2">
                <label
                  onClick={() => setOrderMethod("upload-and-order")}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    orderMethod === "upload-and-order"
                      ? "border-[#038076] bg-teal-50/40 dark:bg-teal-950/20 font-bold"
                      : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-zinc-100">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="upload-and-order"
                      checked={orderMethod === "upload-and-order"}
                      onChange={() => setOrderMethod("upload-and-order")}
                      className="text-[#038076] focus:ring-[#038076]"
                    />
                    <span>Direct Order & Express Dispatch</span>
                  </div>
                  {orderMethod === "upload-and-order" && <CheckCircle2 size={16} className="text-[#038076]" />}
                </label>

                <label
                  onClick={() => setOrderMethod("callback")}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    orderMethod === "callback"
                      ? "border-[#038076] bg-teal-50/40 dark:bg-teal-950/20 font-bold"
                      : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-zinc-100">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="callback"
                      checked={orderMethod === "callback"}
                      onChange={() => setOrderMethod("callback")}
                      className="text-[#038076] focus:ring-[#038076]"
                    />
                    <span>Request Pharmacist Consultation Call</span>
                  </div>
                  {orderMethod === "callback" && <CheckCircle2 size={16} className="text-[#038076]" />}
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            {!user ? (
              <button
                type="button"
                onClick={() => openLoginModal("/upload-prescription")}
                className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Login to Submit Prescription</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#038076] hover:bg-[#026860] text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {uploading ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>Submit Prescription for Verification</span>
              </button>
            )}

          </div>

        </form>

      </div>

      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />

    </div>
  );
};

export default UploadPrescriptionPage;
