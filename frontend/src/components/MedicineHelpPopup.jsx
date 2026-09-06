import React, { useEffect } from "react";
import { X, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";

const MedicineHelpPopup = ({ isOpen, onClose, lastSearchQuery = "" }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    console.log("[Analytics] Medicine Help WhatsApp Clicked:", {
      event: "popup_whatsapp_clicked",
      query: lastSearchQuery,
      timestamp: new Date().toISOString()
    });

    try {
      sessionStorage.setItem("wellmeds_help_contacted", "true");
    } catch (e) {
      console.warn("Storage access error:", e);
    }

    const prefilledMessage = `Hello WellMeds,

I couldn't find this medicine on your website.

Medicine Name:
${lastSearchQuery.trim() || "Medicine Name"}

Could you please check its availability?

Thank you.`;

    const whatsappUrl = getWhatsAppLink(prefilledMessage);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-help-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] w-full max-w-md sm:max-w-2xl overflow-hidden relative flex flex-col sm:flex-row animate-[scale-up_0.25s_ease-out]">
        
        {/* Left Visual Banner (Desktop) */}
        <div className="sm:w-5/12 bg-gradient-to-br from-[#0f594f] via-[#157a6d] to-[#1a8a7c] p-6 sm:p-7 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow Circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#25D366]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4 text-emerald-100">
              <Sparkles size={13} className="text-[#84d6b9]" />
              <span>Pharmacist Desk</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-editorial leading-snug tracking-tight text-white">
              Looking for a specific medicine?
            </h4>
          </div>

          {/* Bullet Highlights */}
          <div className="my-5 sm:my-0 space-y-2.5 relative z-10">
            <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-emerald-50">
              <CheckCircle2 size={16} className="text-[#84d6b9] shrink-0" />
              <span>Real-time stock verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-emerald-50">
              <ShieldCheck size={16} className="text-[#84d6b9] shrink-0" />
              <span>Specialty & imported medicines</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-emerald-50">
              <Clock size={16} className="text-[#84d6b9] shrink-0" />
              <span>Quick response in 5 mins</span>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="pt-2 border-t border-white/15 text-[11px] text-emerald-100/90 relative z-10">
            <span>Daily Support: 8:00 AM – 11:00 PM</span>
          </div>
        </div>

        {/* Right Action Body */}
        <div className="sm:w-7/12 p-6 sm:p-7 flex flex-col justify-between bg-white dark:bg-zinc-900 relative">
          {/* Close Button in Top Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistance popup"
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div>
            {/* Header / Subtitle */}
            <div className="pr-8 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#157a6d] dark:text-[#84d6b9]">
                Direct WhatsApp Support
              </span>
              <h3 id="medicine-help-title" className="text-lg sm:text-xl font-extrabold text-[#172b26] dark:text-white leading-tight mt-0.5">
                Can't find what you need?
              </h3>
            </div>

            {/* Failed Search Query Badge if available */}
            {lastSearchQuery && (
              <div className="mb-3 bg-[#f4f9f7] dark:bg-zinc-800/90 px-3 py-1.5 rounded-xl border border-[#c3d4cc]/60 text-xs font-mono text-[#157a6d] dark:text-[#84d6b9] font-semibold truncate">
                <span className="text-slate-500 font-normal">Searched: </span>
                <span className="underline decoration-dotted">{lastSearchQuery}</span>
              </div>
            )}

            {/* Description Text */}
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 leading-relaxed font-normal mb-5">
              Send us your medicine name or prescription image on WhatsApp. Our licensed pharmacy team will check our inventory and assist with your order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-5 rounded-2xl transition-all shadow-[0_6px_20px_rgba(37,211,102,0.35)] flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden="true">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.479 1.332 5.006L2 22l5.176-1.358a9.941 9.941 0 004.836 1.234c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.791 14.195c-.244.686-1.427 1.348-1.959 1.41-.497.058-1.144.116-3.327-.78-2.784-1.147-4.577-3.99-4.717-4.178-.14-.188-1.127-1.498-1.127-2.859 0-1.361.713-2.029.967-2.302.254-.272.553-.34.737-.34.184 0 .368.002.528.01.168.008.396-.064.62.484.23.564.787 1.92.855 2.058.068.138.113.3.02.487-.092.188-.138.305-.276.467-.138.162-.292.361-.418.484-.138.136-.282.285-.12.563.162.278.718 1.184 1.542 1.916.824.732 1.52.959 1.737 1.05.217.091.344.077.472-.069.128-.146.553-.64.701-.858.148-.218.296-.184.498-.109.202.075 1.282.605 1.503.716.221.111.369.166.423.259.054.093.054.54-.19 1.226z" />
              </svg>
              <span>Chat on WhatsApp</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-semibold text-xs py-2 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicineHelpPopup;

