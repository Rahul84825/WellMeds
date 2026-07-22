import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionCard from "../components/PrescriptionCard";
import { toast } from "sonner";
import Modal from "../components/Modal";
import { 
  UploadCloud, 
  HelpCircle, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShoppingCart,
  CreditCard,
  Trash2
} from "lucide-react";

const UploadPrescriptionPage = () => {
  const { user, openLoginModal } = useAuth();
  const { pendingRxFile, setPendingRxFile } = useCart();
  const navigate = useNavigate();

  // Prescriptions state
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);

  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Post-Upload Success details
  const [uploadedRxRecord, setUploadedRxRecord] = useState(null);

  // Accordion / Guide indices
  const [validGuideOpen, setValidGuideOpen] = useState(true);

  // Right sidebar state
  const [orderMethod, setOrderMethod] = useState("upload-and-order");
  const [durationEnabled, setDurationEnabled] = useState(true);
  const [durationValue, setDurationValue] = useState("7");
  const [durationUnit, setDurationUnit] = useState("Days");
  const [address, setAddress] = useState(user?.shippingAddress || "Please set a shipping address in your profile.");

  // Modal for changing address
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState(address);

  // Fetch saved prescriptions
  const fetchPrescriptions = async () => {
    try {
      const data = await api.getMyPrescriptions();
      setSavedPrescriptions(data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoadingRx(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
      setAddress(user.shippingAddress || "Please set a shipping address in your profile.");
    } else {
      setLoadingRx(false);
    }
  }, [user]);

  // Drag and drop handlers
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
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      if (!user) {
        setPendingRxFile(files[0]);
        openLoginModal("/upload-prescription");
        return;
      }
      validateAndAddFiles(files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (!user) {
        setPendingRxFile(files[0]);
        openLoginModal("/upload-prescription");
        return;
      }
      validateAndAddFiles(files);
    }
  };

  const handleDropzoneClick = () => {
    if (!user) {
      sessionStorage.setItem("auth_redirect_intent", "upload_prescription_click");
      openLoginModal("/upload-prescription");
      return;
    }
    document.getElementById("prescription-file-upload")?.click();
  };

  const validateAndAddFiles = (files) => {
    setUploadError("");
    setUploadedRxRecord(null);

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    const verifiedFiles = [];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setUploadError("Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("One or more files exceed the 10MB limit.");
        continue;
      }
      verifiedFiles.push(file);
    }

    if (verifiedFiles.length > 0) {
      setUploadFiles((prev) => [...prev, ...verifiedFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Perform upload
  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      // Pass the array of files to uploadPrescription
      const data = await api.uploadPrescription(uploadFiles);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update success states
      setUploadedRxRecord(data.prescription);
      setUploadFiles([]);
      setUploadProgress(0);

      // Refresh list
      fetchPrescriptions();
      toast.success("Prescription uploaded successfully!");
    } catch (err) {
      clearInterval(progressInterval);
      setUploadError(err.response?.data?.message || "Prescription upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Trigger file picker if the user clicked the dropzone as a guest and has now logged in
  useEffect(() => {
    if (user && sessionStorage.getItem("auth_redirect_intent") === "upload_prescription_click") {
      sessionStorage.removeItem("auth_redirect_intent");
      setTimeout(() => {
        document.getElementById("prescription-file-upload")?.click();
      }, 500);
    }
  }, [user]);

  // Capture pendingRxFile from guest state when user successfully logs in
  useEffect(() => {
    if (user && pendingRxFile) {
      validateAndAddFiles([pendingRxFile]);
      setPendingRxFile(null);
      sessionStorage.setItem("auth_rx_auto_trigger", "true");
    }
  }, [user, pendingRxFile, setPendingRxFile]);

  // Auto-submit file if auto-trigger is set
  useEffect(() => {
    if (user && uploadFiles.length > 0 && sessionStorage.getItem("auth_rx_auto_trigger") === "true") {
      sessionStorage.removeItem("auth_rx_auto_trigger");
      handleUploadSubmit();
    }
  }, [user, uploadFiles]);

  const handleDeleteRx = (id, name) => {
    toast.warning(`Are you sure you want to delete "${name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.deletePrescription(id);
            setSavedPrescriptions((prev) => prev.filter((rx) => (rx.id || rx._id) !== id));
            if (uploadedRxRecord && (uploadedRxRecord.id || uploadedRxRecord._id) === id) {
              setUploadedRxRecord(null);
            }
            toast.success(`"${name}" deleted successfully.`);
          } catch (err) {
            console.error("Failed to delete prescription", err);
            toast.error("Failed to delete prescription.");
          }
        }
      }
    });
  };

  const handleSaveAddress = () => {
    setAddress(newAddressInput);
    setAddressModalOpen(false);
  };

  const handleContinue = () => {
    if (savedPrescriptions.length === 0 && !uploadedRxRecord) {
      toast.warning("Please upload at least one prescription before continuing.");
      return;
    }
    
    const durationText = durationEnabled ? `${durationValue} ${durationUnit}` : "Not Specified";
    toast.success(`Proceeding with order method: ${orderMethod === "upload-and-order" ? "Order Now" : "Request Callback"} (Duration: ${durationText})`);
    navigate("/checkout");
  };

  return (
    <div className="bg-slate-50/50 dark:bg-zinc-950 min-h-screen transition-colors duration-300 text-left">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center text-xs text-slate-400 gap-xs mb-2 select-none">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/upload-prescription" className="hover:text-primary transition-colors">Upload Prescription</Link>
          <span className="text-slate-300">&gt;</span>
          <span className="font-bold text-slate-700 dark:text-zinc-300">Order</span>
        </nav>
      </div>

      {/* Main Content Grid */}
      <section className="pb-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-md">
            
            {/* 1. What is Valid Prescription Banner */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setValidGuideOpen(!validGuideOpen)}
                className="w-full flex items-center justify-between p-md text-left font-bold text-xs text-[#004782] dark:text-[#a4c9ff] focus:outline-none hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-xs">
                  <HelpCircle size={16} className="text-primary shrink-0" />
                  <span>What is valid prescription?</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 select-none">
                  {validGuideOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {validGuideOpen && (
                <div className="p-md pt-2 pb-md border-t border-slate-100 dark:border-zinc-855 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed bg-slate-50/30 dark:bg-zinc-950/20 flex flex-col md:flex-row justify-between gap-md items-center">
                  <div className="flex-1 space-y-sm text-left">
                    <p className="font-semibold text-slate-700 dark:text-zinc-300 mt-2">
                      As per Indian Medical Laws a valid prescription should have the following information:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm pt-sm">
                      <div className="flex flex-col items-center text-center p-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 rounded-xl space-y-xs">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Doctor's Details</span>
                      </div>
                      
                      <div className="flex flex-col items-center text-center p-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 rounded-xl space-y-xs">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">badge</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Patient's Details</span>
                      </div>

                      <div className="flex flex-col items-center text-center p-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 rounded-xl space-y-xs">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Date of Prescription</span>
                      </div>

                      <div className="flex flex-col items-center text-center p-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 rounded-xl space-y-xs">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">medication</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Dosage Details</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side: Mockup image of prescription sheet with highlight overlays */}
                  <div className="w-full md:w-56 shrink-0 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-2 shadow-xs relative overflow-hidden mt-md md:mt-0 select-none">
                    <div className="border border-dashed border-slate-200 rounded-lg p-3 text-[8px] font-mono leading-tight space-y-xs relative">
                      <div className="border-b pb-xs flex justify-between items-center text-[7px] text-slate-400">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-0.5">Dr. Rahul Sharma <span className="material-symbols-outlined text-[8px] text-emerald-500">check_circle</span></p>
                          <p>MBBS, MD (General Medicine)</p>
                          <p>Reg No: 123456</p>
                        </div>
                        <span className="font-bold">19-Jul-2026</span>
                      </div>
                      <div className="py-xs space-y-xs text-[7px] text-slate-450">
                        <p className="border-b pb-xs"><span className="font-bold text-slate-800">Patient:</span> Amit Kumar, 32M <span className="material-symbols-outlined text-[8px] text-emerald-500">check_circle</span></p>
                        <p className="font-bold text-slate-800">Rx Medicines: <span className="material-symbols-outlined text-[8px] text-emerald-500">check_circle</span></p>
                        <ul className="list-disc pl-2 space-y-0.5">
                          <li>Tab. Lipitor 10mg - Qty 30 (Once daily)</li>
                          <li>Tab. Pan-D - Qty 10 (Before breakfast)</li>
                        </ul>
                      </div>
                      <div className="border-t pt-xs flex justify-between items-end text-[6px] text-slate-400">
                        <span>Sign/Seal <span className="material-symbols-outlined text-[8px] text-emerald-500">check_circle</span></span>
                        <span className="italic font-bold text-indigo-500">Rahul Sharma</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Upload / Selected & Saved Prescriptions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              
              {/* Card 2.1: Selected Prescriptions */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
                <h3 className="font-headline-sm text-sm font-extrabold text-slate-800 dark:text-zinc-150 pb-sm border-b border-slate-100 dark:border-zinc-800/60">
                  Selected Prescriptions
                </h3>
                
                {uploadedRxRecord ? (
                  // SUCCESS STATE CARD
                  <div className="space-y-md animate-[fade-in_0.2s_ease-out] text-center py-md">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-[#02665e] mx-auto mb-xs">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-[#02665e]">Uploaded Successfully</h4>
                      <p className="text-[10px] text-slate-450 truncate max-w-[200px] mx-auto">
                        {uploadedRxRecord.name}
                      </p>
                    </div>
                    <Link
                      to={`/prescriptions/${uploadedRxRecord._id}`}
                      className="bg-[#02665e] hover:bg-[#014d47] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <span>Track Verification Status</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setUploadedRxRecord(null)}
                      className="text-xs text-slate-500 font-bold hover:underline block mx-auto cursor-pointer"
                    >
                      Upload Another
                    </button>
                  </div>
                ) : (
                  // UPLOAD DROPZONE
                  <div className="space-y-md">
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={handleDropzoneClick}
                      className={`border-2 border-dashed rounded-2xl p-lg text-center cursor-pointer transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 flex flex-col items-center justify-center min-h-[220px] group ${
                        dragActive ? "border-primary bg-primary-container/10" : "border-outline-variant/60"
                      }`}
                    >
                      <input
                        type="file"
                        id="prescription-file-upload"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {/* Document upload illustration */}
                      <div className="relative w-24 h-24 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-300">
                        <FileText className="w-10 h-10 text-indigo-400 dark:text-indigo-600" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#038076] text-white flex items-center justify-center shadow-md">
                          <UploadCloud size={16} />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-455 leading-relaxed max-w-[200px] mx-auto">
                        Supported files: PNG, JPEG, PDF (Max 10MB)
                      </p>
                    </div>

                    {uploadError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-sm rounded-xl text-xs flex items-center gap-xs animate-[fade-in_0.2s_ease-out]">
                        <ShieldAlert size={14} className="shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Pre-upload List */}
                    {uploadFiles.length > 0 && (
                      <div className="space-y-xs max-h-36 overflow-y-auto pr-xs custom-scrollbar">
                        {uploadFiles.map((file, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 rounded-xl p-2 flex items-center justify-between text-xs animate-[fade-in_0.2s_ease-out]">
                            <div className="flex items-center gap-xs truncate">
                              <FileText className="text-primary shrink-0" size={16} />
                              <div className="truncate text-left">
                                <p className="font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">{file.name}</p>
                                <p className="text-[9px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadFiles.length > 0 && (
                      <button
                        onClick={handleUploadSubmit}
                        disabled={uploading}
                        className="w-full bg-[#038076] hover:bg-[#02655f] text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-xs shadow-sm active:scale-98 text-xs cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <Loader size="sm" color="white" />
                            <span>Uploading ({uploadProgress}%)</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} />
                            <span>Verify & Upload</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2.2: Saved Prescriptions */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
                <h3 className="font-headline-sm text-sm font-extrabold text-slate-800 dark:text-zinc-150 pb-sm border-b border-slate-100 dark:border-zinc-800/60">
                  Saved Prescriptions
                </h3>
                
                {!user ? (
                  // GUEST STATE
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-850 flex flex-col items-center justify-center min-h-[220px]">
                    <p className="text-[11px] font-bold text-slate-450 dark:text-zinc-400">Login to view your saved prescriptions</p>
                    <button
                      type="button"
                      onClick={() => openLoginModal("/upload-prescription")}
                      className="mt-sm text-[#004782] dark:text-[#a4c9ff] font-extrabold text-xs hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                ) : loadingRx ? (
                  // LOADING STATE
                  <div className="py-xl flex justify-center items-center min-h-[220px]"><Loader size="md" /></div>
                ) : savedPrescriptions.length === 0 ? (
                  // EMPTY STATE
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-850 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-sm text-slate-400">
                      <FileText size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">No prescription found</p>
                  </div>
                ) : (
                  // SAVED LIST
                  <div className="space-y-sm max-h-[240px] overflow-y-auto pr-xs custom-scrollbar">
                    {savedPrescriptions.map((rx) => (
                      <PrescriptionCard
                        key={rx.id || rx._id}
                        prescription={rx}
                        onDelete={handleDeleteRx}
                        onPreview={(record) => window.open(record.fileUrl, "_blank")}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Column / Sidebar (30%) */}
          <div className="lg:col-span-4 space-y-md">
            
            {/* Progress Steps Tracker */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-md shadow-xs flex items-center justify-between">
              <div className="flex items-center justify-between w-full px-lg relative">
                {/* Line behind */}
                <div className="absolute top-1/2 left-lg right-lg h-0.5 border-t border-dashed border-slate-200 dark:border-zinc-800 -translate-y-1/2 z-0"></div>
                
                {/* Step 1: Rx */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-150 text-slate-700 border-2 border-slate-300 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700 flex items-center justify-center font-bold text-xs">
                    Rx
                  </div>
                </div>

                {/* Step 2: Upload */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#038076] text-white border-2 border-[#038076] flex items-center justify-center">
                    <UploadCloud size={14} />
                  </div>
                </div>

                {/* Step 3: Cart */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 flex items-center justify-center">
                    <ShoppingCart size={13} />
                  </div>
                </div>

                {/* Step 4: Pay */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 flex items-center justify-center">
                    <CreditCard size={13} />
                  </div>
                </div>
              </div>
            </div>

            {/* Need Support Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-md shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Need Support?</span>
              <div className="flex items-center gap-sm">
                <a
                  href="tel:+18005550199"
                  className="w-8 h-8 rounded-full bg-[#e8e4f5] dark:bg-[#2d224d] text-[#6349c2] flex items-center justify-center hover:scale-105 transition-transform"
                  title="Call Us"
                >
                  <Phone size={14} />
                </a>
                <a
                  href="https://wa.me/18005550199"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#e3f7ed] dark:bg-[#183a2b] text-[#24b070] flex items-center justify-center hover:scale-105 transition-transform"
                  title="WhatsApp Us"
                >
                  <MessageSquare size={14} />
                </a>
                <a
                  href="mailto:support@wellmeds.com"
                  className="w-8 h-8 rounded-full bg-[#e1f1fb] dark:bg-[#193247] text-[#1c8ad4] flex items-center justify-center hover:scale-105 transition-transform"
                  title="Email Us"
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>

            {/* Delivery Location Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-md shadow-xs space-y-sm">
              <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-850">
                <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Deliver to:</h3>
                {user && (
                  <button
                    type="button"
                    onClick={() => { setNewAddressInput(address); setAddressModalOpen(true); }}
                    className="text-primary dark:text-[#a4c9ff] text-xs font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="flex gap-xs items-start text-xs text-slate-800 dark:text-zinc-150">
                <MapPin className="text-[#038076] shrink-0 mt-0.5" size={14} />
                <p className="leading-tight break-words">{address}</p>
              </div>
            </div>

            {/* Select Order Method Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-lg shadow-xs space-y-md">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Select order method</h3>
              
              <div className="space-y-sm">
                {/* Option 1: Order Now */}
                <div
                  className={`p-md border rounded-2xl transition-all ${
                    orderMethod === "upload-and-order"
                      ? "border-[#038076] bg-[#038076]/5 font-bold"
                      : "border-slate-100 dark:border-zinc-800"
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-xs">
                      <input
                        type="radio"
                        name="orderMethod"
                        value="upload-and-order"
                        checked={orderMethod === "upload-and-order"}
                        onChange={() => setOrderMethod("upload-and-order")}
                        className="text-[#038076] focus:ring-[#038076] h-4 w-4"
                      />
                      <span className="text-xs text-slate-800 dark:text-zinc-100 font-extrabold">ORDER NOW</span>
                    </div>
                    {orderMethod === "upload-and-order" && (
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    )}
                  </label>
                  
                  {orderMethod === "upload-and-order" && (
                    <div className="mt-sm pt-sm border-t border-slate-150 dark:border-zinc-800/60 space-y-sm animate-[fade-in_0.2s_ease-out]">
                      <label className="flex items-center gap-xs cursor-pointer text-[10px] text-slate-450 dark:text-zinc-450 font-bold select-none">
                        <input
                          type="checkbox"
                          checked={durationEnabled}
                          onChange={(e) => setDurationEnabled(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>Add Duration & Order</span>
                      </label>
                      
                      {durationEnabled && (
                        <div className="flex items-center gap-xs bg-white dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl p-1">
                          <input
                            type="number"
                            value={durationValue}
                            onChange={(e) => setDurationValue(e.target.value)}
                            className="w-16 px-xs py-1 bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none"
                            min="1"
                          />
                          <select
                            value={durationUnit}
                            onChange={(e) => setDurationUnit(e.target.value)}
                            className="flex-1 bg-[#038076] text-white text-xs font-bold px-2 py-1 rounded-lg border-none focus:outline-none cursor-pointer"
                          >
                            <option value="Days">Days</option>
                            <option value="Months">Months</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Option 2: Get Call */}
                <div
                  className={`p-md border rounded-2xl transition-all ${
                    orderMethod === "callback"
                      ? "border-[#038076] bg-[#038076]/5 font-bold"
                      : "border-slate-100 dark:border-zinc-800"
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-xs">
                      <input
                        type="radio"
                        name="orderMethod"
                        value="callback"
                        checked={orderMethod === "callback"}
                        onChange={() => setOrderMethod("callback")}
                        className="text-[#038076] focus:ring-[#038076] h-4 w-4"
                      />
                      <span className="text-xs text-slate-800 dark:text-zinc-100 font-extrabold">GET CALL</span>
                    </div>
                    {orderMethod === "callback" && (
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    )}
                  </label>
                  
                  {orderMethod === "callback" && (
                    <div className="mt-xs text-[10px] text-slate-500 dark:text-zinc-455 leading-normal pl-6 animate-[fade-in_0.2s_ease-out]">
                      <span className="font-bold block text-slate-700 dark:text-zinc-300 mt-1">Consult WellMeds Expert</span>
                      We've got you! Select now, and a WellMeds care expert will call to assist you with placing your order right away!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            {!user ? (
              <button
                type="button"
                onClick={() => openLoginModal("/upload-prescription")}
                className="w-full bg-[#004782] hover:bg-[#003c70] text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-xs cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Login To Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : address === "Please set a shipping address in your profile." ? (
              <button
                type="button"
                onClick={() => { setNewAddressInput(""); setAddressModalOpen(true); }}
                className="w-full bg-[#004782] hover:bg-[#003c70] text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-xs cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Add Address</span>
                <MapPin size={14} />
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="w-full bg-[#038076] hover:bg-[#02655f] text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-xs cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            )}

          </div>

        </div>
      </section>

      {/* Address Edit Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Edit Shipping Address"
        maxWidth="max-w-md"
      >
        <div className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Full Shipping Address</label>
            <textarea
              value={newAddressInput}
              onChange={(e) => setNewAddressInput(e.target.value)}
              rows={4}
              className="w-full p-md bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              placeholder="Enter complete shipping address..."
            />
          </div>
          <div className="flex gap-sm pt-sm border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="flex-1 py-sm border border-outline-variant rounded-xl font-label-md text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAddress}
              className="flex-1 bg-primary text-white py-sm rounded-xl font-label-md text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Save Address
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default UploadPrescriptionPage;
