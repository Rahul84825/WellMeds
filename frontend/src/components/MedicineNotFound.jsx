import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight, ShieldCheck, Zap, Bell, Sparkles, Pill, Stethoscope, Heart, Search } from "lucide-react";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";

const MedicineNotFound = ({ searchQuery = "", suggestions = [], onSelectSuggestion }) => {
  const navigate = useNavigate();

  // Analytics Event Tracking
  useEffect(() => {
    if (searchQuery) {
      console.log("[Analytics] Medicine Not Found Impression:", {
        event: "medicine_not_found_view",
        searchQuery,
        timestamp: new Date().toISOString()
      });
    }
  }, [searchQuery]);

  const handleWhatsAppClick = () => {
    console.log("[Analytics] WhatsApp Sourcing Clicked:", {
      event: "medicine_not_found_whatsapp_click",
      searchQuery,
      timestamp: new Date().toISOString()
    });

    // Save contacted state to prevent annoying popups in this session
    try {
      sessionStorage.setItem("wellmeds_help_contacted", "true");
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    const prefilledMessage = `Hello WellMeds,

I searched for this medicine on your website but couldn't find it.

Medicine Name:
${searchQuery.trim() || "Medicine Name"}

Could you please check its availability?`;

    const whatsappUrl = getWhatsAppLink(prefilledMessage);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleSuggestionClick = (term) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(term);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 sm:p-10 md:p-12 shadow-sm my-6 text-left select-none animate-[fade-in_0.3s_ease-out] font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Content & WhatsApp Call-To-Action (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          
          {/* Eyebrow Sourcing Badge */}
          <div className="inline-flex items-center gap-2 bg-[#e8f8ee] dark:bg-emerald-950/60 border border-[#25D366]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
            <MessageSquare size={13} className="text-[#25D366]" />
            <span>PERSONAL MEDICINE SOURCING</span>
          </div>

          {/* Heading */}
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#172b26] dark:text-white leading-tight">
            Can't find <span className="text-[#157a6d] dark:text-[#84d6b9] italic">your medicine?</span>
          </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
            Couldn't find the medicine you're looking for? Send us the medicine name or prescription on WhatsApp. Our sourcing team will check availability and get back to you as quickly as possible.
          </p>

          {/* "Did You Mean?" Fuzzy Suggestions (if available) */}
          {suggestions && suggestions.length > 0 && (
            <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-[#c3d4cc]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#157a6d] uppercase tracking-wider">
                <Search size={13} />
                <span>Did you mean...</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.slice(0, 4).map((sug, idx) => {
                  const label = typeof sug === "string" ? sug : sug.name || sug.slug;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(label)}
                      className="bg-white dark:bg-zinc-900 hover:bg-[#157a6d] hover:text-white text-[#172b26] dark:text-zinc-200 border border-[#c3d4cc] px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary WhatsApp CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)] active:scale-98 flex items-center justify-center gap-3 group cursor-pointer"
            >
              {/* WhatsApp SVG Icon */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0" aria-hidden="true">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.479 1.332 5.006L2 22l5.176-1.358a9.941 9.941 0 004.836 1.234c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.791 14.195c-.244.686-1.427 1.348-1.959 1.41-.497.058-1.144.116-3.327-.78-2.784-1.147-4.577-3.99-4.717-4.178-.14-.188-1.127-1.498-1.127-2.859 0-1.361.713-2.029.967-2.302.254-.272.553-.34.737-.34.184 0 .368.002.528.01.168.008.396-.064.62.484.23.564.787 1.92.855 2.058.068.138.113.3.02.487-.092.188-.138.305-.276.467-.138.162-.292.361-.418.484-.138.136-.282.285-.12.563.162.278.718 1.184 1.542 1.916.824.732 1.52.959 1.737 1.05.217.091.344.077.472-.069.128-.146.553-.64.701-.858.148-.218.296-.184.498-.109.202.075 1.282.605 1.503.716.221.111.369.166.423.259.054.093.054.54-.19 1.226z" />
              </svg>
              <span>WhatsApp Us</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/upload-prescription"
              className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-[#172b26] dark:text-zinc-200 border border-[#c3d4cc] dark:border-zinc-700 font-bold text-xs sm:text-sm px-6 py-4 rounded-2xl text-center transition-all cursor-pointer"
            >
              Upload Prescription
            </Link>
          </div>

          {/* Trust Points Badges */}
          <div className="pt-4 border-t border-[#c3d4cc]/40 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#172b26] dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <span>Genuine Medicines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <span>Fast Sourcing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <span>We'll Notify You</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Premium Healthcare Illustration Card (lg:col-span-5) */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="relative w-full bg-gradient-to-br from-[#f4f9f7] via-[#ebf5f1] to-[#d8ece5] dark:from-zinc-850 dark:via-zinc-800 dark:to-emerald-950/40 rounded-3xl p-8 border border-[#c3d4cc] dark:border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-center shadow-inner min-h-[300px]">
            {/* Background Blur Orbs */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#157a6d]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#25D366]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Central Healthcare Visual */}
            <div className="relative z-10 my-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-[#157a6d]/30 shadow-xl flex items-center justify-center text-[#157a6d] dark:text-[#84d6b9] transform hover:scale-105 transition-transform duration-300">
                <Pill size={48} className="stroke-[1.5]" />
              </div>

              {/* Floating Healthcare Badges */}
              <div className="absolute -top-2 -right-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full shadow-md text-[11px] font-extrabold text-[#157a6d] dark:text-emerald-400 flex items-center gap-1.5 animate-bounce">
                <Sparkles size={13} className="text-[#b08d3e]" /> Custom Sourcing
              </div>
              <div className="absolute -bottom-2 -left-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full shadow-md text-[11px] font-extrabold text-[#172b26] dark:text-zinc-200 flex items-center gap-1.5">
                <Stethoscope size={13} className="text-[#157a6d]" /> Pharmacist Verified
              </div>
            </div>

            {/* Subtext */}
            <div className="relative z-10 mt-6 space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#157a6d] dark:text-[#84d6b9]">
                WellMeds Sourcing Network
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                Connecting with licensed manufacturers & authorized distributors across India
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicineNotFound;
