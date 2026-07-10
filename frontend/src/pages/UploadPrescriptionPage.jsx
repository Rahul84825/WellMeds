import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionCard from "../components/PrescriptionCard";
import { toast } from "sonner";
import PrescriptionTimeline from "../components/PrescriptionTimeline";
import Modal from "../components/Modal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { 
  UploadCloud, 
  HelpCircle, 
  Phone, 
  MessageSquare, 
  Mail, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  User,
  Award,
  Hospital,
  Users,
  Calendar,
  PenTool,
  ClipboardList,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Lock,
  Stethoscope
} from "lucide-react";

const UploadPrescriptionPage = () => {
  const { user } = useAuth();
  const { pendingRxFile, setPendingRxFile } = useCart();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Prescriptions state
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);

  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Post-Upload Success details
  const [uploadedRxRecord, setUploadedRxRecord] = useState(null);

  // Accordion indices
  const [guideOpenIdx, setGuideOpenIdx] = useState(null);
  const [faqOpenIdx, setFaqOpenIdx] = useState(null);

  // Right sidebar state
  const [orderMethod, setOrderMethod] = useState("upload-and-order");
  const [duration, setDuration] = useState("30");
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!user) {
        setPendingRxFile(file);
        setIsLoginModalOpen(true);
        return;
      }
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!user) {
        setPendingRxFile(file);
        setIsLoginModalOpen(true);
        return;
      }
      validateAndSetFile(file);
    }
  };

  const handleDropzoneClick = () => {
    if (!user) {
      sessionStorage.setItem("auth_redirect_intent", "upload_prescription_click");
      setIsLoginModalOpen(true);
      return;
    }
    document.getElementById("prescription-file-upload")?.click();
  };

  const validateAndSetFile = (file) => {
    setUploadError("");
    setUploadedRxRecord(null);

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only PDF, JPG, and PNG are allowed!");
      setUploadFile(null);
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  // Perform upload
  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!uploadFile) return;

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
      const data = await api.uploadPrescription(uploadFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update success states
      setUploadedRxRecord(data.prescription);
      setUploadFile(null);
      setUploadProgress(0);

      // Refresh list
      fetchPrescriptions();
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
      validateAndSetFile(pendingRxFile);
      setPendingRxFile(null);
      sessionStorage.setItem("auth_rx_auto_trigger", "true");
    }
  }, [user, pendingRxFile, setPendingRxFile]);

  // Auto-submit file if auto-trigger is set
  useEffect(() => {
    if (user && uploadFile && sessionStorage.getItem("auth_rx_auto_trigger") === "true") {
      sessionStorage.removeItem("auth_rx_auto_trigger");
      handleUploadSubmit();
    }
  }, [user, uploadFile]);

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
    toast.success(`Order proceeding with method: ${orderMethod === "upload-and-order" ? "Upload & Order" : orderMethod === "callback" ? "Pharmacist Callback" : "Assistance Required"} for ${duration} days.`);
    navigate("/checkout");
  };

  // Static Data lists
  const timelineSteps = [
    { step: "01", title: "Upload Prescription", desc: "Upload scanned sheets or doctor PDFs securely.", icon: UploadCloud, color: "text-[#004782] bg-[#004782]/10" },
    { step: "02", title: "Pharmacist Review", desc: "Our certified clinical experts read details.", icon: Stethoscope, color: "text-secondary bg-[#086b53]/10" },
    { step: "03", title: "Verification", desc: "Dosages, durations, and brands validated.", icon: Award, color: "text-[#004782] bg-[#004782]/10" },
    { step: "04", title: "Medicine Ordering", desc: "Cart generated and ready for check-out.", icon: ClipboardList, color: "text-secondary bg-[#086b53]/10" },
  ];

  const guideItems = [
    { title: "Doctor Name & Qualifications", desc: "Doctor's name, credentials, and signatures clearly printed.", icon: User },
    { title: "Registration Number", desc: "Valid medical council license registration digit string.", icon: Award },
    { title: "Clinic or Hospital Letterhead", desc: "Official medical center letterhead indicating clinic address and phone details.", icon: Hospital },
    { title: "Patient Name & Age", desc: "Full name matching patient registration, along with age/gender statistics.", icon: Users },
    { title: "Date of Prescription", desc: "Prescription date clearly visible and issued within the last 6 months.", icon: Calendar },
    { title: "Signature & Seal Stamp", desc: "Handwritten/digital signature or physical seal stamp of the consulting doctor.", icon: PenTool },
    { title: "Medicine Specifications", desc: "Brand or generic drug name, clear strength, dosages, and course durations.", icon: ClipboardList }
  ];

  const faqItems = [
    { q: "How long does verification take?", a: "Typically, our licensed pharmacists verify clinical prescriptions in 5 to 10 minutes from receipt during operation hours." },
    { q: "Can I upload multiple prescriptions?", a: "Yes, you can upload as many prescription sheets as required for your clinical treatment course." },
    { q: "Can I upload PDF files?", a: "Yes, we accept PDF, JPG, JPEG, and PNG files up to a maximum size of 10MB." },
    { q: "Can I re-upload if rejected?", a: "Yes, you can delete a rejected prescription card and upload a corrected doc sheet instantly." },
    { q: "How will I know the verification status?", a: "The visual progress tracker on your prescription card updates in real-time. You'll also receive checkout notifications." }
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-[#004782] via-[#055746] to-[#086b53] text-white py-16 relative overflow-hidden text-left">
        <div className="absolute inset-0 medical-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="space-y-md max-w-xl">
            <nav className="flex items-center text-xs text-white/70 gap-xs">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="font-bold text-white">Upload Prescription</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg lg:text-3xl text-white font-extrabold tracking-tight leading-tight">
              Upload Your Prescription <br />
              <span className="text-[#a4c9ff] dark:text-[#84d6b9]">Secure & Seamless Care</span>
            </h1>
            <p className="text-white/80 font-body-sm leading-relaxed max-w-md">
              Submit your doctor's prescription sheets securely. Our certified in-house pharmacists will verify the dosages and prepare your cart in under 10 minutes.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-md pt-sm">
              <span className="inline-flex items-center gap-xs text-[11px] bg-white/10 px-sm py-1 rounded-full border border-white/10 font-bold uppercase tracking-wider">
                <Lock size={12} className="text-[#a4c9ff]" /> 100% Encrypted
              </span>
              <span className="inline-flex items-center gap-xs text-[11px] bg-white/10 px-sm py-1 rounded-full border border-white/10 font-bold uppercase tracking-wider">
                <Stethoscope size={12} className="text-[#84d6b9]" /> Licensed Experts
              </span>
              <span className="inline-flex items-center gap-xs text-[11px] bg-white/10 px-sm py-1 rounded-full border border-white/10 font-bold uppercase tracking-wider">
                <Clock size={12} className="text-yellow-400" /> 10-Min Verification
              </span>
            </div>
          </div>
          
          {/* Medical Iconography Overlay */}
          <div className="hidden md:flex bg-white/10 border border-white/20 p-lg rounded-3xl backdrop-blur-md shadow-2xl relative w-80 h-48 flex-col justify-between shrink-0">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#a4c9ff]" />
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ACTIVE PIPELINE
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-white uppercase tracking-wide leading-none">WellMeds Pharmacy</p>
              <p className="text-xs text-white/70 mt-1 leading-normal">Clinical verification and digital tracking for high-end patient medicine distribution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-lg text-left">
            
            {/* 2. UPLOAD CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-lg">
              
              {uploadedRxRecord ? (
                // SUCCESS STATE CARD
                <div className="space-y-lg animate-[fade-in_0.2s_ease-out]">
                  <div className="bg-[#086b53]/5 border border-[#086b53]/15 rounded-3xl p-lg flex flex-col sm:flex-row items-start sm:items-center gap-md">
                    <div className="w-12 h-12 bg-secondary/15 rounded-2xl flex items-center justify-center text-secondary shrink-0">
                      <CheckCircle2 size={28} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-headline-sm text-headline-sm font-extrabold text-[#086b53]">Prescription Uploaded Successfully</h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Your prescription sheet has been queued. Our clinical team is verifying it.
                      </p>
                      <div className="flex flex-wrap gap-x-md text-[11px] font-mono text-slate-400 pt-1">
                        <span>ID: {uploadedRxRecord.orderId || uploadedRxRecord.id || uploadedRxRecord._id}</span>
                        <span>•</span>
                        <span>Estimated Review: 5-10 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <PrescriptionTimeline status={uploadedRxRecord.status} />

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setUploadedRxRecord(null)}
                      className="text-[#004782] dark:text-[#a4c9ff] font-bold text-xs hover:underline flex items-center gap-xs bg-slate-50 dark:bg-zinc-800 px-md py-sm rounded-xl border border-slate-100 dark:border-zinc-700/80 hover:shadow-xs transition-all"
                    >
                      <UploadCloud size={14} />
                      Upload Another prescription sheet
                    </button>
                  </div>
                </div>
              ) : (
                // DRAG & DROP UPLOAD ZONE
                <div className="space-y-md">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleDropzoneClick}
                    className={`border-2 border-dashed rounded-3xl p-xl text-center cursor-pointer transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 flex flex-col items-center justify-center space-y-md group hover:border-[#004782] ${
                      dragActive ? "border-[#004782] bg-[#004782]/5" : "border-outline-variant/60"
                    }`}
                  >
                    <input
                      type="file"
                      id="prescription-file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-[#004782]/10 text-[#004782] dark:text-primary-fixed-dim flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:translate-y-[-2px] shadow-xs">
                      <UploadCloud size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold group-hover:text-[#004782] dark:group-hover:text-primary-fixed-dim transition-colors">
                        {uploadFile ? uploadFile.name : "Drag & drop prescription here"}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                        or click to browse documents from your device storage (PDF, JPG, JPEG, PNG formats up to 10MB supported)
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-md rounded-2xl text-body-sm flex items-center gap-sm animate-[fade-in_0.2s_ease-out]">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {uploadFile && (
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-md flex items-center justify-between animate-[fade-in_0.2s_ease-out]">
                      <div className="flex items-center gap-sm truncate">
                        <FileText className="text-[#004782] shrink-0" size={24} />
                        <div className="truncate text-left">
                          <p className="font-label-md text-label-md font-bold text-on-surface truncate max-w-[200px] sm:max-w-md">{uploadFile.name}</p>
                          <p className="text-xs text-on-surface-variant">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="text-red-500 hover:text-red-600 transition-colors p-sm hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {uploadFile && (
                    <button
                      onClick={handleUploadSubmit}
                      disabled={uploading}
                      className="w-full bg-[#004782] text-white font-bold py-md rounded-2xl hover:bg-[#003c70] transition-all flex items-center justify-center gap-sm shadow-md active:scale-98"
                    >
                      {uploading ? (
                        <>
                          <Loader size="sm" color="white" />
                          <span>Uploading Clinical Document ({uploadProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          <span>Verify & Submit Prescription</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. HOW IT WORKS */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-lg">
              <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800">
                How Prescription Verification Works
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md pt-sm">
                {timelineSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="bg-slate-50 dark:bg-zinc-800/20 p-md rounded-2xl border border-slate-100 dark:border-zinc-800/80 hover:-translate-y-0.5 transition-all duration-200 text-left space-y-sm">
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-black text-slate-300 dark:text-zinc-700">{step.step}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-label-md text-label-md font-bold text-on-surface">{step.title}</h4>
                        <p className="text-xs text-on-surface-variant dark:text-surface-variant leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. MY PRESCRIPTIONS (LISTING) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
              <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800 mb-lg">
                Your Saved Prescriptions
              </h3>

              {loadingRx ? (
                <div className="py-xl flex justify-center"><Loader size="lg" /></div>
              ) : savedPrescriptions.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 dark:bg-zinc-900/60 rounded-3xl border border-slate-100 dark:border-zinc-850">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-md text-slate-400">
                    <FileText size={32} />
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">No Prescriptions Uploaded</h4>
                  <p className="font-body-sm text-on-surface-variant dark:text-surface-variant mt-xs max-w-sm mx-auto leading-relaxed">
                    Submit your first prescription sheet to enable rapid verified ordering and checkout capabilities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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

            {/* 6. VALID PRESCRIPTION GUIDE (ACCORDION) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
              <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800">
                Prescription Guidelines Checklist
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-surface-variant">
                To guarantee safety, compliance, and fast order approvals, please verify that your prescription sheet contains these 7 key elements.
              </p>
              
              <div className="space-y-sm mt-sm">
                {guideItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isOpen = guideOpenIdx === idx;
                  return (
                    <div key={idx} className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/40">
                      <button
                        type="button"
                        onClick={() => setGuideOpenIdx(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center p-md text-left font-bold text-xs text-on-surface focus:outline-none hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] flex items-center justify-center">
                            <Icon size={14} />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div className="p-md pt-0 text-xs text-on-surface-variant dark:text-surface-variant leading-relaxed animate-[slide-down_0.2s_ease-out]">
                          {item.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. FAQ ACCORDION SECTION */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
              <h3 className="font-headline-sm text-headline-sm font-extrabold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-sm mt-sm">
                {faqItems.map((faq, idx) => {
                  const isOpen = faqOpenIdx === idx;
                  return (
                    <div key={idx} className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center p-md text-left font-bold text-xs text-on-surface focus:outline-none hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-sm">
                          <HelpCircle size={16} className="text-[#086b53]" />
                          <span>{faq.q}</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div className="p-md pt-0 text-xs text-on-surface-variant dark:text-surface-variant leading-relaxed animate-[slide-down_0.2s_ease-out]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column / Sidebar (30%) */}
          <div className="lg:col-span-4 space-y-lg text-left">
            
            {/* Delivery Location Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
              <div className="flex justify-between items-center pb-sm border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-label-md text-label-md font-bold text-on-surface">Delivery Destination:</h3>
                <button
                  type="button"
                  onClick={() => { setNewAddressInput(address); setAddressModalOpen(true); }}
                  className="text-[#004782] dark:text-[#a4c9ff] text-xs font-bold hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 flex gap-sm items-start text-xs text-on-surface">
                <MapPin className="text-[#004782] shrink-0" size={16} />
                <p className="leading-relaxed break-words">{address}</p>
              </div>
            </div>

            {/* Select Order Method Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-lg">
              <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800">
                Order Processing Method
              </h3>
              
              <div className="flex flex-col gap-sm">
                
                {/* Method 1 */}
                <label
                  className={`p-md border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    orderMethod === "upload-and-order"
                      ? "border-[#004782] bg-[#004782]/5 font-bold text-[#004782]"
                      : "border-slate-100 dark:border-zinc-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-sm">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="upload-and-order"
                      checked={orderMethod === "upload-and-order"}
                      onChange={() => setOrderMethod("upload-and-order")}
                      className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                    />
                    <span className="text-xs text-on-surface font-semibold">Upload Rx & Order Now</span>
                  </div>
                  <FileText size={16} className="text-[#004782]" />
                </label>

                {/* Method 2 */}
                <label
                  className={`p-md border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    orderMethod === "callback"
                      ? "border-[#004782] bg-[#004782]/5 font-bold text-[#004782]"
                      : "border-slate-100 dark:border-zinc-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-sm">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="callback"
                      checked={orderMethod === "callback"}
                      onChange={() => setOrderMethod("callback")}
                      className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                    />
                    <span className="text-xs text-on-surface font-semibold">Request Callback Assistance</span>
                  </div>
                  <MessageSquare size={16} className="text-secondary" />
                </label>

                {/* Method 3 */}
                <label
                  className={`p-md border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    orderMethod === "assistance"
                      ? "border-[#004782] bg-[#004782]/5 font-bold text-[#004782]"
                      : "border-slate-100 dark:border-zinc-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-sm">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="assistance"
                      checked={orderMethod === "assistance"}
                      onChange={() => setOrderMethod("assistance")}
                      className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                    />
                    <span className="text-xs text-on-surface font-semibold">Help Me Complete Order</span>
                  </div>
                  <Users size={16} className="text-teal-600" />
                </label>

              </div>

              {/* Supply Duration Dropdown */}
              <div className="pt-md border-t border-slate-100 dark:border-zinc-800 space-y-xs">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wide">Supply Duration Goal</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-md bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl font-label-md text-on-surface focus:ring-1 focus:ring-primary focus:border-[#004782] outline-none transition-all cursor-pointer"
                >
                  <option value="7">7 Days Supply Course</option>
                  <option value="15">15 Days Supply Course</option>
                  <option value="30">30 Days Supply Course</option>
                  <option value="60">60 Days Supply Course</option>
                  <option value="90">90 Days Supply Course</option>
                </select>
              </div>
            </div>

            {/* Continue CTA Action Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-[#004782] hover:bg-[#003c70] text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 flex items-center justify-center gap-sm sticky bottom-lg z-30"
            >
              <span>Continue Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Support Call Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-lg shadow-sm space-y-md">
              <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-slate-100 dark:border-zinc-800">
                Prescription Support?
              </h3>
              
              <div className="space-y-sm text-xs">
                <a href="tel:+18005550199" className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 dark:border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-[#004782]/10 flex items-center justify-center text-[#004782] shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Toll Free Call</p>
                    <p className="font-extrabold text-on-surface mt-1">+1 (800) 555-0199</p>
                  </div>
                </a>

                <a href="https://wa.me/18005550199" target="_blank" rel="noreferrer" className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 dark:border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-[#086b53]/10 flex items-center justify-center text-[#086b53] shrink-0">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">WhatsApp Chat</p>
                    <p className="font-extrabold text-on-surface mt-1">Connect instantly now</p>
                  </div>
                </a>

                <a href="mailto:support@wellmeds.com" className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 dark:border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-[#004782]/10 flex items-center justify-center text-[#004782] shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Email Support</p>
                    <p className="font-extrabold text-on-surface mt-1">support@wellmeds.com</p>
                  </div>
                </a>
              </div>
            </div>

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
              className="w-full p-md bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-[#004782] outline-none"
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
              className="flex-1 bg-[#004782] text-white py-sm rounded-xl font-label-md text-sm font-bold hover:bg-[#003c70] transition-all active:scale-95"
            >
              Save Address
            </button>
          </div>
        </div>
      </Modal>

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        fromPath="/upload-prescription"
        message="Please login to upload your prescription."
        cancelText="Cancel"
      />
    </div>
  );
};

export default UploadPrescriptionPage;
