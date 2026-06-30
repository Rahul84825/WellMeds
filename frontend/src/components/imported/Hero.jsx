import React from "react";
import { Globe, ArrowRight } from "lucide-react";

const Hero = ({ onBrowseClick, onRequestClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#004782]/10 via-[#038076]/5 to-transparent py-20 px-6 sm:px-12 lg:px-24 text-left">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#004782]/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#038076]/5 blur-3xl animate-pulse-slow [animation-delay:3s]"></div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <span className="inline-flex items-center gap-xs px-3.5 py-1.5 bg-[#004782]/5 border border-[#004782]/10 text-[#004782] rounded-full text-xs font-black uppercase tracking-widest select-none">
            <Globe size={14} className="animate-spin-slow" />
            Global Medicine Access
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-zinc-100 leading-tight">
            Imported Medicines from Trusted Global Manufacturers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl font-medium">
            WellMeds helps patients access genuine, life-saving imported medicines that are currently unavailable in the local market. We source directly from licensed international manufacturers while ensuring strict cold-chain logistics, proper documentation, and secure delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-md pt-md">
            <button
              onClick={onBrowseClick}
              className="h-12 px-xl bg-[#004782] hover:bg-[#003c6e] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs transition-all active:scale-95 shadow-md shadow-blue-900/15 cursor-pointer select-none"
            >
              Browse Specialties
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onRequestClick}
              className="h-12 px-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs transition-all active:scale-95 cursor-pointer select-none"
            >
              Request Imported Medicine
            </button>
          </div>
        </div>

        {/* Right Column - Premium SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center z-10 select-none">
          <div className="relative w-full max-w-[420px] aspect-square">
            {/* Pulsing Background Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#004782]/10 to-[#038076]/10 animate-pulse-slow"></div>
            
            {/* Main Illustration */}
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
              {/* World Map Dotted Grid */}
              <g className="text-slate-300 dark:text-zinc-700" opacity="0.6">
                <circle cx="100" cy="150" r="3" fill="currentColor" />
                <circle cx="150" cy="130" r="3" fill="currentColor" />
                <circle cx="200" cy="120" r="3" fill="currentColor" />
                <circle cx="250" cy="140" r="3" fill="currentColor" />
                <circle cx="300" cy="160" r="3" fill="currentColor" />
                <circle cx="120" cy="220" r="3" fill="currentColor" />
                <circle cx="180" cy="240" r="3" fill="currentColor" />
                <circle cx="240" cy="230" r="3" fill="currentColor" />
                <circle cx="280" cy="210" r="3" fill="currentColor" />
              </g>

              {/* Connection Lines */}
              <path d="M 100 150 Q 200 80 300 160" fill="none" stroke="url(#blue-teal-grad)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
              <path d="M 120 220 Q 200 140 280 210" fill="none" stroke="url(#blue-teal-grad)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite] [animation-delay:2s]" />

              {/* Glowing Nodes */}
              <circle cx="100" cy="150" r="6" fill="#004782" className="animate-ping" />
              <circle cx="100" cy="150" r="5" fill="#004782" />
              <circle cx="300" cy="160" r="6" fill="#038076" className="animate-ping" />
              <circle cx="300" cy="160" r="5" fill="#038076" />

              {/* Delivery Box (Centerpiece) */}
              <g transform="translate(160, 150)">
                {/* 3D Box Drawing */}
                <path d="M 40 0 L 80 20 L 40 40 L 0 20 Z" fill="#0b74c9" opacity="0.9" />
                <path d="M 0 20 L 40 40 L 40 80 L 0 60 Z" fill="#004782" />
                <path d="M 40 40 L 80 20 L 80 60 L 40 80 Z" fill="#038076" />
                
                {/* Medical Cross on Box */}
                <path d="M 35 48 L 45 48 M 40 43 L 40 53" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Shield Icon Overlay */}
              <g transform="translate(250, 220)">
                <circle cx="25" cy="25" r="25" fill="white" className="shadow-lg" />
                <circle cx="25" cy="25" r="21" fill="url(#blue-teal-grad)" />
                <path d="M 20 18 L 30 18 L 30 25 C 30 30 25 33 25 33 C 25 33 20 30 20 25 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              </g>

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="blue-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#004782" />
                  <stop offset="100%" stopColor="#038076" />
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
