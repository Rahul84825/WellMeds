import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageCircle, Globe, ShieldCheck, HelpCircle, Activity, FileText, Truck, ArrowRight, DollarSign, Clock, MapPin, Star, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import PromoNavigation from "./PromoNavigation";

const promoSlides = [
  {
    id: "life-saving-medicines",
    eyebrow: "GLOBAL MEDICINE ACCESS",
    title: "Critical & Life-Saving Medicine Support",
    subtitle: "Struggling to find rare or critical care medicines? Request them directly via WhatsApp. Dedicated clinical team, cold-chain logistics, and immediate dispatch.",
    bgGradient: "from-[#FFF0ED] via-[#FFF6ED] to-white dark:from-[#251A18] dark:via-[#1D1614] dark:to-zinc-950"
  },
  {
    id: "why-patients-trust",
    eyebrow: "PATIENT TRUST",
    title: "Why 15,000+ Patients Trust WellMeds",
    subtitle: "We maintain 100% authentic pharmacy operations, certified clinical pharmacist oversight, and specialized cold-chain integrity for every single delivery.",
    bgGradient: "from-[#E8F8F5] via-[#EBF9FA] to-white dark:from-[#102421] dark:via-[#0F2122] dark:to-zinc-950"
  },
  {
    id: "exclusive-savings",
    eyebrow: "AFFORDABLE HEALTHCARE",
    title: "Direct-from-Manufacturer Pricing",
    subtitle: "Bypass distributor markups. WellMeds connects you directly to WHO-GMP certified manufacturers to deliver up to 85% savings on chronic care therapies.",
    bgGradient: "from-[#EBF3FC] via-[#F3EFFF] to-white dark:from-[#131E2A] dark:via-[#1B1826] dark:to-zinc-950"
  },
  {
    id: "prescription-upload",
    eyebrow: "EXPRESS VERIFICATION",
    title: "10-Minute Prescription Verification",
    subtitle: "Upload your medical prescription sheet. Our certified clinical pharmacists will review, validate, and call you back within 10 minutes to finalize your order.",
    bgGradient: "from-[#EAFBF3] to-white dark:from-[#0F251E] dark:to-zinc-950"
  },
  {
    id: "three-hour-delivery",
    eyebrow: "PUNE EMERGENCY CARE",
    title: "Express 3-Hour Emergency Delivery",
    subtitle: "Urgent medical requirements? Our express delivery riders are active across Pune, Hinjawadi, and PCMC to deliver critical supplies with certified cold-chain bags.",
    bgGradient: "from-[#FFF0F6] to-[#FFFBF0] dark:from-[#281A1F] dark:to-[#202018]"
  }
];

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayTimer = useRef(null);

  const [calcCost, setCalcCost] = useState(10000);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 20 });

  const totalSlides = promoSlides.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    } else {
      autoplayTimer.current = setInterval(handleNext, 6000);
    }
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [isPaused, handleNext]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: 14, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
  };

  const renderSlideDecorations = (slideId) => {
    switch (slideId) {
      case "life-saving-medicines":
        return (
          <>
            <div className="absolute top-12 right-12 w-8 h-8 opacity-20 dark:opacity-10 text-[#038076] animate-float pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
              </svg>
            </div>
            <div className="absolute bottom-24 left-[20%] w-10 h-5 rounded-full border-[3px] border-orange-400/20 dark:border-orange-500/10 rotate-45 animate-float [animation-delay:1.5s] pointer-events-none select-none" />
          </>
        );
      case "why-patients-trust":
        return (
          <>
            <div className="absolute top-20 left-[15%] w-8 h-8 opacity-15 dark:opacity-10 text-[#086b53] animate-float [animation-delay:0.7s] pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.11-2.78 8.04-7 9.17-4.22-1.13-7-5.06-7-9.17v-4.7l7-3.12z"/>
              </svg>
            </div>
            <div className="absolute bottom-16 right-[35%] w-12 h-12 rounded-full border-[2px] border-emerald-400/20 dark:border-emerald-500/10 animate-pulse pointer-events-none select-none" />
          </>
        );
      case "exclusive-savings":
        return (
          <>
            <div className="absolute top-10 right-1/3 w-10 h-10 opacity-[0.05] dark:opacity-[0.03] text-slate-800 dark:text-white pointer-events-none select-none">
              <svg viewBox="0 0 80 80" fill="currentColor">
                <path d="M40 0 L74.64 20 L74.64 60 L40 80 L5.36 60 L5.36 20 Z" />
              </svg>
            </div>
            <div className="absolute bottom-24 left-[28%] w-8 h-8 opacity-20 dark:opacity-10 text-blue-500 animate-float [animation-delay:2s] pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
              </svg>
            </div>
          </>
        );
      case "prescription-upload":
        return (
          <>
            <div className="absolute top-16 right-1/4 w-8 h-8 opacity-15 dark:opacity-10 text-emerald-600 animate-float pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div className="absolute bottom-12 left-12 w-6 h-6 rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[1px] animate-pulse pointer-events-none select-none" />
          </>
        );
      case "three-hour-delivery":
        return (
          <>
            <div className="absolute top-12 right-12 w-10 h-5 rounded-full border-[3px] border-pink-400/20 dark:border-pink-500/10 -rotate-12 animate-float pointer-events-none select-none" />
            <div className="absolute bottom-16 left-[22%] w-6 h-6 opacity-15 dark:opacity-10 text-red-500 animate-float [animation-delay:1s] pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderCardWidget = (slideId) => {
    const cardBaseClass = "w-full max-w-[380px] sm:max-w-[400px] h-[220px] sm:h-[230px] rounded-[28px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/80 dark:border-zinc-800/40 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left text-slate-800 dark:text-zinc-100";
    
    switch (slideId) {
      case "life-saving-medicines":
        return (
          <div className={`${cardBaseClass} bg-[#FFF5F2]/75 dark:bg-[#251A18]/60`}>
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-md">Natco Pharma</span>
              <h4 className="font-extrabold text-base text-slate-800 dark:text-zinc-100 truncate">Sorafenat 200mg</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Sorafenib Tosylate (Cancer Care)</p>
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-slate-200/50 dark:border-zinc-800/50">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 line-through block">Original: ₹8,900</span>
                <span className="text-base font-black text-slate-800 dark:text-zinc-100">WellMeds: ₹3,450</span>
              </div>
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/15">61% SAVINGS</span>
            </div>
          </div>
        );
      case "why-patients-trust":
        return (
          <div className={`${cardBaseClass} bg-[#F0FAF7]/75 dark:bg-[#102421]/60`}>
            <div className="flex gap-1 text-amber-400">
              <Star size={14} fill="currentColor" className="stroke-amber-400" />
              <Star size={14} fill="currentColor" className="stroke-amber-400" />
              <Star size={14} fill="currentColor" className="stroke-amber-400" />
              <Star size={14} fill="currentColor" className="stroke-amber-400" />
              <Star size={14} fill="currentColor" className="stroke-amber-400" />
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-200 italic font-medium leading-relaxed my-2">
              "Saved over ₹15,000 monthly on my mother's oncology prescriptions. The cold-chain packing was extremely professional."
            </p>
            <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-zinc-800/50 pt-3">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">— Mrs. Iyer, Pune</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent rounded-full flex items-center gap-1">
                <CheckCircle size={9} /> Verified Patient
              </span>
            </div>
          </div>
        );
      case "exclusive-savings":
        return (
          <div className={`${cardBaseClass} text-slate-800 dark:text-zinc-100 bg-[#F4F9FD]/95 dark:bg-[#131E2A]/90 border border-slate-200/60 dark:border-zinc-800/60`}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60 pb-2">
              <h4 className="font-extrabold text-xs flex items-center gap-1.5 text-[#038076] dark:text-emerald-400">
                <DollarSign size={14} />
                Savings Calculator
              </h4>
              <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/15">85% MAX OFF</span>
            </div>

            <div className="space-y-2 py-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                <span>Monthly Medicine Cost</span>
                <span className="font-extrabold text-slate-700 dark:text-zinc-200">{formatCurrency(calcCost)}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={calcCost}
                onChange={(e) => setCalcCost(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#038076] dark:accent-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-center">
              <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold block">WellMeds Price</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calcCost * 0.15)}</span>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold block">You Save</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calcCost * 0.85)}</span>
              </div>
            </div>
          </div>
        );
      case "prescription-upload":
        return (
          <div className={`${cardBaseClass} bg-[#F2FAF6]/75 dark:bg-[#0F251E]/60`}>
            <h4 className="font-bold text-xs flex items-center gap-1.5 border-b border-slate-200/50 dark:border-zinc-800/50 pb-2 text-slate-800 dark:text-zinc-100">
              <FileText size={14} className="text-[#038076] dark:text-emerald-400" />
              Quick Verification Checklist
            </h4>
            <div className="space-y-2 text-xs py-2">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">✓</span>
                <span className="text-slate-700 dark:text-zinc-200 font-medium">Select Medicine & Quantity</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">✓</span>
                <span className="text-slate-700 dark:text-zinc-200 font-medium">Upload Prescription Image/PDF</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-full flex items-center justify-center text-[10px] font-black border border-emerald-500/20 animate-pulse">3</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-100">Certified Pharmacist Review (10 mins)</span>
              </div>
            </div>
          </div>
        );
      case "three-hour-delivery":
        return (
          <div className={`${cardBaseClass} bg-[#FFF5F8]/75 dark:bg-[#281A1F]/60`}>
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-zinc-800/50 pb-2">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-zinc-100">
                <Truck size={14} className="animate-bounce text-[#038076] dark:text-emerald-400" />
                Express Dispatch Timer
              </h4>
              <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-extrabold tracking-wider shadow-sm shadow-emerald-500/15 uppercase">Riders Active</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <p className="text-slate-400 dark:text-zinc-500 text-[9px] font-bold uppercase">Next Dispatch In</p>
                <p className="text-xl font-black flex items-center gap-1 text-slate-800 dark:text-zinc-100 font-mono">
                  <Clock size={16} className="text-emerald-500 dark:text-emerald-400" />
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-slate-400 dark:text-zinc-500 text-[9px] font-bold uppercase">Locations</p>
                <p className="text-[11px] font-extrabold flex items-center justify-end gap-1 text-slate-800 dark:text-zinc-100">
                  <MapPin size={12} className="text-red-400" />
                  <span>Pune & PCMC</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/50 text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-normal">
              Our temperature-monitored cold-chain bags guarantee medicine potency upon arrival.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const primaryCTAClass = "h-12 px-6 bg-gradient-to-r from-[#038076] to-[#086b53] hover:from-[#038076]/90 hover:to-[#086b53]/90 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer select-none w-full sm:w-auto";

  const secondaryCTAClass = "h-12 px-6 bg-white/40 backdrop-blur-md border border-slate-200/50 hover:bg-white/60 hover:border-[#038076]/30 text-slate-800 dark:text-zinc-200 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(3,128,118,0.15)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer select-none w-full sm:w-auto";

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative max-w-[1470px] mx-auto my-md min-h-[540px] sm:min-h-[480px] md:min-h-[480px] lg:min-h-[560px] lg:h-[560px] rounded-[32px] overflow-hidden bg-white dark:bg-zinc-950 shadow-[0_20px_50px_-12px_rgba(0,43,73,0.08)] group focus:ring-2 focus:ring-[#038076] focus:ring-offset-2 outline-none transition-all duration-300 flex flex-col justify-center"
    >
      {/* Subtle Medical SVG Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 0h40v40H0z%22 fill=%22none%22/><path d=%22M0 20h40M20 0v40%22 stroke=%22%23086b53%22 stroke-width=%221.5%22/></svg>')] bg-repeat" />

      {/* Slides */}
      <div className="relative w-full h-full flex flex-col">
        {promoSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`w-full transition-all duration-700 ease-in-out bg-gradient-to-br ${slide.bgGradient || "from-[#FFF0ED] via-[#FFF6ED] to-white"} ${
                isActive
                  ? "relative opacity-100 z-10 pointer-events-auto flex flex-col md:flex-row items-center px-6 sm:px-10 lg:px-[72px] py-8 md:py-0 min-h-[540px] sm:min-h-[480px] md:min-h-[480px] lg:min-h-[560px] lg:h-[560px]"
                  : "absolute inset-0 opacity-0 pointer-events-none h-0 overflow-hidden flex flex-col md:flex-row items-center px-6 sm:px-10 lg:px-[72px] py-8 md:py-0"
              }`}
            >
              {/* Floating Background Blobs */}
              <div className="absolute top-10 left-1/4 w-36 h-36 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl animate-pulse-slow pointer-events-none"></div>
              <div className="absolute bottom-10 right-1/4 w-44 h-44 rounded-full bg-[#038076]/10 dark:bg-emerald-500/5 blur-3xl animate-pulse-slow [animation-delay:3s] pointer-events-none"></div>

              {/* Decorative items */}
              {renderSlideDecorations(slide.id)}

              <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between z-10">
                
                {/* Left Column (60% Desktop) */}
                <div className={`w-full md:w-[58%] space-y-4 md:space-y-6 text-center md:text-left ${isActive ? "animate-[fade-in-up_0.8s_ease-out_both]" : ""}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#038076]/10 dark:bg-emerald-500/20 text-[#038076] dark:text-emerald-300 border border-[#038076]/20 dark:border-transparent rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest select-none">
                    {slide.eyebrow}
                  </span>
                  <h2 className="lg:text-[60px] lg:leading-[1.1] md:text-[48px] md:leading-[1.15] text-[30px] sm:text-[34px] leading-[1.2] font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="lg:text-[22px] lg:leading-[1.6] md:text-[19px] md:leading-[1.6] text-[15px] sm:text-[16px] leading-[1.6] text-slate-600 dark:text-zinc-300 font-medium max-w-2xl mx-auto md:mx-0 mt-3 md:mt-4">
                    {slide.subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2 w-full">
                    {slide.id === "life-saving-medicines" ? (
                      <>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20need%20help%20finding%20a%20medicine."
                          target="_blank"
                          rel="noopener noreferrer"
                          className={primaryCTAClass}
                        >
                          <MessageCircle size={16} />
                          WhatsApp Sourcing Desk
                        </a>
                        <Link
                          to="/products"
                          className={secondaryCTAClass}
                        >
                          Browse Catalog
                        </Link>
                      </>
                    ) : slide.id === "prescription-upload" ? (
                      <>
                        <Link
                          to="/upload-prescription"
                          className={primaryCTAClass}
                        >
                          Upload Rx Sheet
                        </Link>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20want%20to%20upload%20my%20prescription."
                          target="_blank"
                          rel="noopener noreferrer"
                          className={secondaryCTAClass}
                        >
                          Send via WhatsApp
                        </a>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/products"
                          className={primaryCTAClass}
                        >
                          Explore Therapies
                        </Link>
                        <Link
                          to="/contact"
                          className={secondaryCTAClass}
                        >
                          Contact Support
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Trust Badges as Floating Glass Chips */}
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 pt-6 border-t border-slate-200/40 dark:border-zinc-800/40 w-full">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300 text-xs font-semibold shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 cursor-default select-none">
                      ⭐ 4.9 Rating
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300 text-xs font-semibold shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 cursor-default select-none">
                      👨‍⚕️ Certified Pharmacist
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300 text-xs font-semibold shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 cursor-default select-none">
                      🚚 Express Delivery
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300 text-xs font-semibold shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 cursor-default select-none">
                      💊 Genuine Medicines
                    </span>
                  </div>
                </div>

                {/* Right Column (40% Desktop) */}
                <div className={`w-full md:w-[38%] hidden md:flex flex-col md:flex-row items-center justify-center gap-6 ${isActive ? "animate-[fade-in-up_0.8s_ease-out_0.2s_both]" : ""}`}>
                  {/* Floating Stat Pills */}
                  <div className="flex flex-row md:flex-col gap-3 select-none w-full md:w-auto justify-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-[11px] font-bold text-slate-800 dark:text-zinc-200 rounded-full shadow-sm hover:scale-105 transition-all duration-300 animate-float">
                      ★★★★★ 4.9 Rating
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-[11px] font-bold text-slate-800 dark:text-zinc-200 rounded-full shadow-sm hover:scale-105 transition-all duration-300 animate-float [animation-delay:1s]">
                      15,000+ Patients
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/50 dark:border-zinc-800/50 text-[11px] font-bold text-slate-800 dark:text-zinc-200 rounded-full shadow-sm hover:scale-105 transition-all duration-300 animate-float [animation-delay:2s]">
                      100% Genuine
                    </span>
                  </div>

                  {/* Card Widget */}
                  <div className="w-full flex justify-center">
                    {renderCardWidget(slide.id)}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Layer */}
      <div className="pb-sm md:pb-0">
        <PromoNavigation
          total={totalSlides}
          current={currentSlide}
          onPrev={handlePrev}
          onNext={handleNext}
          onDotClick={(idx) => setCurrentSlide(idx)}
        />
      </div>
    </section>
  );
};

export default PromoCarousel;
