import React from "react";
import { HeartHandshake, ArrowRight } from "lucide-react";

const Hero = ({ onCheckEligibilityClick, onTalkPharmacistClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#086b53]/10 via-[#038076]/5 to-transparent py-20 px-6 sm:px-12 lg:px-24 text-left">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#086b53]/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#038076]/5 blur-3xl animate-pulse-slow [animation-delay:3s]"></div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <span className="inline-flex items-center gap-xs px-3.5 py-1.5 bg-[#086b53]/5 border border-[#086b53]/10 text-[#086b53] rounded-full text-xs font-black uppercase tracking-widest select-none">
            <HeartHandshake size={14} className="animate-bounce" />
            Patient Support Program
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-zinc-100 leading-tight">
            Making Life-Saving Medicines Affordable
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl font-medium">
            WellMeds partners with leading pharmaceutical manufacturers to help eligible patients reduce the financial burden of long-term treatments. Through verified Patient Assistance Programs (PAP), we facilitate access to subsidized or free chronic care therapies.
          </p>
          <div className="flex flex-col sm:flex-row gap-md pt-md">
            <button
              onClick={onCheckEligibilityClick}
              className="h-12 px-xl bg-[#086b53] hover:bg-[#065340] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs transition-all active:scale-95 shadow-md shadow-emerald-900/15 cursor-pointer select-none"
            >
              Check Eligibility
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onTalkPharmacistClick}
              className="h-12 px-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs transition-all active:scale-95 cursor-pointer select-none"
            >
              Talk to Pharmacist
            </button>
          </div>
        </div>

        {/* Right Column - Premium SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center z-10 select-none">
          <div className="relative w-full max-w-[420px] aspect-square">
            {/* Pulsing Background Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#086b53]/10 to-[#038076]/10 animate-pulse-slow"></div>
            
            {/* Main Illustration */}
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
              {/* Trust Shield with Heart */}
              <g transform="translate(100, 80)">
                {/* Shield Path */}
                <path d="M 100 20 L 180 20 C 180 100 140 160 100 190 C 60 160 20 100 20 20 Z" fill="url(#teal-blue-grad)" opacity="0.9" />
                
                {/* Heart inside Shield */}
                <path d="M 100 80 C 100 80 85 60 70 60 C 55 60 45 72 45 87 C 45 112 100 145 100 145 C 100 145 155 112 155 87 C 155 72 145 60 130 60 C 115 60 100 80 100 80 Z" fill="white" />
              </g>

              {/* Financial/Subsidized Therapy Elements (Coins & Crosses) */}
              <g transform="translate(60, 240)">
                {/* Coin 1 */}
                <circle cx="30" cy="30" r="25" fill="#0b74c9" opacity="0.8" />
                <text x="30" y="36" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">₹</text>
                
                {/* Coin 2 */}
                <circle cx="70" cy="50" r="20" fill="#086b53" />
                <text x="70" y="55" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">₹</text>
              </g>

              {/* Help & Support Indicator */}
              <g transform="translate(260, 220)">
                <circle cx="40" cy="40" r="35" fill="white" className="shadow-lg" />
                <circle cx="40" cy="40" r="30" fill="url(#teal-blue-grad)" />
                {/* Clinical Cross */}
                <path d="M 40 25 L 40 55 M 25 40 L 55 40" stroke="white" strokeWidth="6" strokeLinecap="round" />
              </g>

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="teal-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#086b53" />
                  <stop offset="100%" stopColor="#0b74c9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
