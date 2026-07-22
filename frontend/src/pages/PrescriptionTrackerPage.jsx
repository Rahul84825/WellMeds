import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import SEO from "../components/common/SEO";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { formatCurrency } from "../utils/currency";
import { useCart } from "../hooks/useCart";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  Eye,
  Stethoscope,
  Building2,
  Calendar,
  FileCheck2,
  Package,
  PhoneCall
} from "lucide-react";

const PrescriptionTrackerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // File preview modal
  const [previewFile, setPreviewFile] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getPrescription(id);
      setPrescription(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load prescription details:", err);
      setError("Prescription not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleProceedToCheckout = async () => {
    try {
      setSubmitting(true);
      await api.checkoutPrescription(id);
      await fetchCart();
      toast.success("Prescribed medicines loaded into cart!");
      navigate("/checkout");
    } catch (err) {
      console.error("Failed to checkout prescription:", err);
      toast.error(err.response?.data?.message || "Failed to proceed to checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex justify-center items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-[fade-in_0.3s_ease-out]">
        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Prescription Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">{error || "Could not locate requested prescription."}</p>
        <Link
          to="/upload-prescription"
          className="inline-flex items-center gap-2 bg-[#02665e] text-white px-6 py-3 rounded-xl font-bold text-sm shadow hover:bg-[#014d47] transition-all"
        >
          Upload New Prescription
        </Link>
      </div>
    );
  }

  const isApproved = prescription.status === "Approved";
  const isRejected = prescription.status === "Rejected";
  const isPending = prescription.status === "Pending Review" || prescription.status === "Under Verification";

  const prescribedItems = prescription.prescribedItems || [];
  const totalAmount = prescribedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const fileList = prescription.fileUrls && prescription.fileUrls.length > 0 
    ? prescription.fileUrls 
    : [prescription.fileUrl];

  // Steps timeline calculation
  const timelineSteps = [
    {
      title: "Prescription Uploaded",
      desc: "Document uploaded to secure vault",
      done: true,
      current: false,
    },
    {
      title: "Pharmacist Review",
      desc: "Licensed clinical verification",
      done: isApproved || isRejected || prescription.status === "Under Verification",
      current: isPending,
    },
    {
      title: "Medicines & Dosage Logged",
      desc: prescribedItems.length > 0 ? `${prescribedItems.length} Item(s) Verified` : "Awaiting Pharmacist Log",
      done: prescribedItems.length > 0 || isApproved,
      current: isPending && prescribedItems.length === 0,
    },
    {
      title: "Ready for Checkout",
      desc: isApproved ? "Verification Complete — Ready to Order" : isRejected ? "Declined — Action Required" : "Awaiting Final Approval",
      done: isApproved,
      current: isApproved || isRejected,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO title={`Prescription Verification #${prescription._id.slice(-6).toUpperCase()}`} noindex={true} />

      {/* Breadcrumb / Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/upload-prescription"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02665e] dark:text-[#52d6c9] hover:underline"
        >
          <ChevronLeft size={16} /> Back to My Prescriptions
        </Link>
        <span className="text-xs font-mono text-slate-400">
          Ref ID: #{prescription._id.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Prescription Verification
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isApproved
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : isRejected
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                }`}
              >
                {isApproved && <CheckCircle2 size={14} />}
                {isRejected && <XCircle size={14} />}
                {isPending && <Clock size={14} className="animate-spin" />}
                {prescription.status}
              </span>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 text-xs sm:text-sm">
              Uploaded on {new Date(prescription.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Quick Action CTA */}
          <div>
            {isApproved && (
              <button
                onClick={handleProceedToCheckout}
                disabled={submitting}
                className="w-full sm:w-auto bg-[#02665e] hover:bg-[#014d47] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? "Preparing Cart..." : "Proceed to Checkout"}
                <ArrowRight size={18} />
              </button>
            )}
            {isRejected && (
              <Link
                to="/upload-prescription"
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Upload New Prescription
              </Link>
            )}
            {isPending && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-amber-600 animate-spin" />
                <span>Verification in progress. Estimated completion: ~15 mins.</span>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Step Timeline Tracker */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {timelineSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  step.done
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30"
                    : step.current
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 ring-1 ring-amber-400/30"
                    : "bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      step.done
                        ? "bg-[#02665e] text-white"
                        : step.current
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-8">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN (2 Cols): Prescribed Items & Verification Summary ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Prescribed Items Box */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 size={20} className="text-[#02665e] dark:text-[#52d6c9]" />
                Prescribed Medicines & Dosage Log
              </h2>
              <span className="text-xs font-bold text-slate-400">{prescribedItems.length} Item(s)</span>
            </div>

            {prescribedItems.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                <Clock size={32} className="mx-auto text-amber-500 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Pharmacist is reviewing prescription sheet...</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  Our licensed pharmacist is currently reviewing your uploaded document to log your prescribed items, dosages, and quantities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {prescribedItems.map((item, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-[#02665e] px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">
                            Rx Prescribed
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                          Dosage: <strong className="text-slate-700 dark:text-zinc-200">{item.dosage || "As prescribed"}</strong> • Qty: <strong className="text-slate-700 dark:text-zinc-200">{item.quantity || 1}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatCurrency(item.originalPrice * (item.quantity || 1))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Prescribed Order Subtotal</span>
                  <span className="text-[#02665e] dark:text-[#52d6c9] text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pharmacist & Verification Notes */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-[#02665e]" />
              Pharmacist Verification Notes
            </h3>

            {prescription.pharmacistNotes || prescription.adminNotes ? (
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                "{prescription.pharmacistNotes || prescription.adminNotes}"
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No notes added by pharmacist yet.</p>
            )}

            {prescription.doctorName && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                <Building2 size={14} className="text-slate-400" />
                Doctor / Clinic: <span className="text-slate-900 dark:text-white font-bold">{prescription.doctorName}</span>
              </div>
            )}
          </div>

          {/* Verification Audit Timeline */}
          {prescription.timeline && prescription.timeline.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-[#02665e]" />
                Verification Audit History
              </h3>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-zinc-800">
                {prescription.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#02665e] border-4 border-white dark:border-zinc-900" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">{item.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {new Date(item.timestamp).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN (1 Col): Document Preview & Support ── */}
        <div className="space-y-6">

          {/* Uploaded Documents Thumbnail Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText size={18} className="text-[#02665e]" />
              Uploaded Document Files ({fileList.length})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {fileList.map((url, idx) => {
                const isPdf = url.toLowerCase().includes(".pdf");
                const fileName = prescription.fileNames?.[idx] || `Prescription_Page_${idx + 1}`;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewFile({ url, isPdf, name: fileName })}
                    className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 hover:border-[#02665e] transition-all text-left cursor-pointer flex flex-col items-center justify-center min-h-[100px]"
                  >
                    {isPdf ? (
                      <div className="flex flex-col items-center justify-center text-rose-500 py-2">
                        <FileText size={32} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 mt-1 truncate max-w-[90px]">{fileName}</span>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={fileName}
                        className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition-transform"
                      />
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={12} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Assurance & Pharmacist Help Strip */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl p-6 text-left space-y-3">
            <div className="flex items-center gap-3 text-[#02665e] dark:text-emerald-300 font-bold text-sm">
              <ShieldCheck size={22} className="shrink-0" />
              <span>Certified Pharmacist Assurance</span>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-300/90 leading-relaxed font-medium">
              Every prescription undergoes direct verification by licensed clinical pharmacists before cart assignment and dispatch.
            </p>
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <PhoneCall size={14} /> Need Help?
              </span>
              <a href="tel:+919876543210" className="hover:underline text-[#02665e] font-extrabold">
                Call Pharmacist
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.name || "Prescription Preview"}
        >
          <div className="p-4 flex flex-col items-center justify-center max-h-[75vh] overflow-y-auto">
            {previewFile.isPdf ? (
              <iframe
                src={previewFile.url}
                title="Prescription PDF"
                className="w-full h-[550px] rounded-xl border border-slate-200"
              />
            ) : (
              <img
                src={previewFile.url}
                alt="Prescription Full Preview"
                className="max-w-full max-h-[600px] object-contain rounded-xl shadow"
              />
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};

export default PrescriptionTrackerPage;
