import React from "react";
import { Link } from "react-router-dom";
import PromoCard from "./PromoCard";
import PromoStats from "./PromoStats";
import { 
  Activity, 
  ShieldCheck, 
  FileText, 
  Truck,
  MessageCircle,
  MapPin,
  Clock
} from "lucide-react";

// Render background SVG patterns with 5-10% opacity
const BackgroundPattern = ({ type }) => {
  if (type === "cross") {
    return (
      <div className="absolute inset-0 opacity-[0.06] text-white pointer-events-none select-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cross-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 30 10 L 30 50 M 10 30 L 50 30" stroke="currentColor" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cross-grid)" />
        </svg>
      </div>
    );
  }
  if (type === "shield") {
    return (
      <div className="absolute inset-0 opacity-[0.05] text-white pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <ShieldCheck size={400} className="stroke-[0.5]" />
      </div>
    );
  }
  if (type === "hexagon") {
    return (
      <div className="absolute inset-0 opacity-[0.07] text-white pointer-events-none select-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hex-grid" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M28 97 L56 81 L56 49 L28 33 L0 49 L0 81 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-grid)" />
        </svg>
      </div>
    );
  }
  if (type === "dna") {
    return (
      <div className="absolute inset-0 opacity-[0.05] text-white pointer-events-none select-none overflow-hidden flex items-center justify-end pr-[64px]">
        <Activity size={350} className="rotate-45 stroke-[0.5]" />
      </div>
    );
  }
  if (type === "molecule") {
    return (
      <div className="absolute inset-0 opacity-[0.06] text-white pointer-events-none select-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="20%" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="12%" cy="22%" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="currentColor" strokeWidth="1" />
          <circle cx="40%" cy="50%" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="70%" cy="30%" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="40%" y1="50%" x2="70%" y2="30%" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    );
  }
  return null;
};

const PromoSlide = ({ slide, isActive }) => {
  const renderRightContent = () => {
    switch (slide.id) {
      case "life-saving-medicines":
        return (
          <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-md items-center justify-center relative">
            {slide.customData.medicines.map((med, idx) => (
              <div 
                key={idx}
                className={`w-full sm:w-[220px] shrink-0 animate-float ${
                  idx === 1 ? "sm:translate-y-6 [animation-delay:1.5s]" : ""
                }`}
              >
                <PromoCard medicine={med} />
              </div>
            ))}
          </div>
        );
      case "why-patients-trust":
        return (
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <PromoStats stats={slide.customData.stats} />
          </div>
        );
      case "exclusive-savings":
        return (
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Outer Glows */}
              <div className="absolute w-60 h-60 rounded-full bg-white/5 animate-pulse-slow"></div>
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/10 animate-pulse-slow [animation-delay:2s]"></div>
              
              {/* Main Discount Badge */}
              <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-full w-40 h-40 border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center p-md">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#086b53] dark:text-emerald-400">
                  {slide.customData.badgeText}
                </span>
                <span className="text-3xl font-black text-slate-800 dark:text-zinc-100 my-xs">
                  {slide.customData.discountHighlight}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold leading-tight">
                  {slide.customData.subText}
                </span>
              </div>
            </div>
          </div>
        );
      case "prescription-upload":
        return (
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-md">
            <div className="bg-white/10 dark:bg-black/25 backdrop-blur-md border border-white/15 dark:border-zinc-800/80 p-lg rounded-2xl shadow-lg space-y-md">
              <h4 className="font-bold text-sm text-white flex items-center gap-xs border-b border-white/10 pb-xs">
                <FileText size={16} />
                Verification Process Timeline
              </h4>
              <div className="space-y-sm">
                {slide.customData.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-md text-left text-white">
                    <span className="text-sm font-black bg-white/20 h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                      {step.number}
                    </span>
                    <div>
                      <p className="font-bold text-xs">{step.title}</p>
                      <p className="text-[10px] text-white/70 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "three-hour-delivery":
        return (
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-md text-white text-left">
            <div className="bg-white/10 dark:bg-black/25 backdrop-blur-md border border-white/15 dark:border-zinc-800/80 p-lg rounded-2xl shadow-lg space-y-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-xs">
                <h4 className="font-bold text-sm flex items-center gap-xs">
                  <Truck size={16} className="animate-bounce" />
                  Live Dispatch Status
                </h4>
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {slide.customData.riderStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-sm text-xs">
                <div className="space-y-xs">
                  <p className="text-white/60 font-bold text-[9px] uppercase tracking-wider">Dispatch Time</p>
                  <p className="text-sm font-black flex items-center gap-xs">
                    <Clock size={14} className="text-emerald-400" />
                    {slide.customData.dispatchSpeed}
                  </p>
                </div>
                <div className="space-y-xs">
                  <p className="text-white/60 font-bold text-[9px] uppercase tracking-wider">Active Locations</p>
                  <p className="text-[11px] font-semibold flex items-center gap-xs">
                    <MapPin size={14} className="text-red-400 shrink-0" />
                    <span>Pune, Hinjawadi & PCMC</span>
                  </p>
                </div>
              </div>

              <div className="pt-xs border-t border-white/10">
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-xs">Coverage Suburbs</p>
                <div className="flex flex-wrap gap-xs">
                  {slide.customData.deliveryAreas.map((area, aIdx) => (
                    <span key={aIdx} className="bg-white/5 border border-white/10 px-md py-0.5 rounded-lg text-[9px] font-bold">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full flex items-center px-lg md:px-xl xl:px-xxl transition-opacity duration-700 ease-in-out ${
        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {/* Background Pattern */}
      <BackgroundPattern type={slide.pattern} />

      {/* Floating decorative elements */}
      <div className="absolute top-12 left-1/4 w-3 h-3 bg-white/10 rounded-full animate-float pointer-events-none"></div>
      <div className="absolute bottom-16 right-1/3 w-5 h-5 bg-white/5 rounded-full animate-float [animation-delay:2.5s] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-xl items-center justify-between z-10 text-white">
        {/* Left Column: Text & CTAs */}
        <div className={`w-full lg:w-[48%] space-y-md text-left ${
          isActive ? "animate-slide-in-left" : ""
        }`}>
          <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-black leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            {slide.title}
          </h2>
          <p className="font-body-md text-sm md:text-base text-white/85 leading-relaxed font-medium">
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-sm pt-sm">
            {slide.cta.map((btn, bIdx) => {
              const isPrimary = btn.type === "primary";
              
              if (btn.external) {
                return (
                  <a
                    key={bIdx}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-12 px-xl rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-md select-none cursor-pointer outline-none ${
                      isPrimary
                        ? "bg-[#038076] hover:bg-[#038076]/90 text-white shadow-emerald-900/20"
                        : "border border-white/30 hover:bg-white/10 text-white"
                    }`}
                  >
                    {btn.label === "Request via WhatsApp" && <MessageCircle size={16} />}
                    {btn.label}
                  </a>
                );
              }

              return (
                <Link
                  key={bIdx}
                  to={btn.to}
                  className={`h-12 px-xl rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-md select-none cursor-pointer outline-none ${
                    isPrimary
                      ? "bg-[#038076] hover:bg-[#038076]/90 text-white shadow-emerald-900/20"
                      : "border border-white/30 hover:bg-white/10 text-white"
                  }`}
                >
                  {btn.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unique layouts */}
        <div className={`w-full lg:w-[48%] mt-lg lg:mt-0 ${
          isActive ? "animate-slide-in-right" : ""
        }`}>
          {renderRightContent()}
        </div>
      </div>
    </div>
  );
};

export default PromoSlide;
