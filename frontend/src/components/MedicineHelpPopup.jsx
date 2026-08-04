import React from "react";
import { X, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";

const MedicineHelpPopup = ({ isOpen, onClose, lastSearchQuery = "" }) => {
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
    <div className="fixed z-[9998] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm w-auto animate-[slide-up_0.25s_ease-out] font-sans select-none text-left">
      {/* Floating Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-5 relative overflow-hidden backdrop-blur-md">
        
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#157a6d]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="inline-flex items-center gap-1.5 bg-[#e8f8ee] dark:bg-emerald-950/60 border border-[#25D366]/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#157a6d] dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles size={12} className="text-[#25D366]" />
            <span>WellMeds Support</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistance popup"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Display Failed Search Query Badge if available */}
        {lastSearchQuery && (
          <div className="mb-2 bg-[#f4f9f7] dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-[#c3d4cc]/60 text-[11px] font-mono text-[#157a6d] dark:text-emerald-400 font-semibold truncate">
            <span className="text-slate-500 font-normal">Your search: </span>"{lastSearchQuery}"
          </div>
        )}

        {/* Heading */}
        <h3 className="font-editorial text-lg sm:text-xl font-extrabold text-[#172b26] dark:text-white leading-tight mb-1.5">
          Can't find your medicine?
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-4 font-medium">
          We're constantly adding new medicines. If you couldn't find what you need, send us the medicine name or prescription on WhatsApp and we'll check availability for you.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-98 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,211,102,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0" aria-hidden="true">
              <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.479 1.332 5.006L2 22l5.176-1.358a9.941 9.941 0 004.836 1.234c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.791 14.195c-.244.686-1.427 1.348-1.959 1.41-.497.058-1.144.116-3.327-.78-2.784-1.147-4.577-3.99-4.717-4.178-.14-.188-1.127-1.498-1.127-2.859 0-1.361.713-2.029.967-2.302.254-.272.553-.34.737-.34.184 0 .368.002.528.01.168.008.396-.064.62.484.23.564.787 1.92.855 2.058.068.138.113.3.02.487-.092.188-.138.305-.276.467-.138.162-.292.361-.418.484-.138.136-.282.285-.12.563.162.278.718 1.184 1.542 1.916.824.732 1.52.959 1.737 1.05.217.091.344.077.472-.069.128-.146.553-.64.701-.858.148-.218.296-.184.498-.109.202.075 1.282.605 1.503.716.221.111.369.166.423.259.054.093.054.54-.19 1.226z" />
            </svg>
            <span>Contact on WhatsApp</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 font-bold text-xs py-1.5 transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};

export default MedicineHelpPopup;
