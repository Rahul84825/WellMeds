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
    bgGradient: "from-[#003865] via-[#004782] to-[#038076]"
  },
  {
    id: "why-patients-trust",
    eyebrow: "PATIENT TRUST",
    title: "Why 15,000+ Patients Trust WellMeds",
    subtitle: "We maintain 100% authentic pharmacy operations, certified clinical pharmacist oversight, and specialized cold-chain integrity for every single delivery.",
    bgGradient: "from-[#086b53] via-[#055743] to-[#003865]"
  },
  {
    id: "exclusive-savings",
    eyebrow: "AFFORDABLE HEALTHCARE",
    title: "Direct-from-Manufacturer Pricing",
    subtitle: "Bypass distributor markups. WellMeds connects you directly to WHO-GMP certified manufacturers to deliver up to 85% savings on chronic care therapies.",
    bgGradient: "from-[#002244] via-[#003366] to-[#004782]"
  },
  {
    id: "prescription-upload",
    eyebrow: "EXPRESS VERIFICATION",
    title: "10-Minute Prescription Verification",
    subtitle: "Upload your medical prescription sheet. Our certified clinical pharmacists will review, validate, and call you back within 10 minutes to finalize your order.",
    bgGradient: "from-[#0b5c9e] via-[#0b6b53] to-[#086b53]"
  },
  {
    id: "three-hour-delivery",
    eyebrow: "PUNE EMERGENCY CARE",
    title: "Express 3-Hour Emergency Delivery",
    subtitle: "Urgent medical requirements? Our express delivery riders are active across Pune, Hinjawadi, and PCMC to deliver critical supplies with certified cold-chain bags.",
    bgGradient: "from-[#002b49] via-[#05436e] to-[#038076]"
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

  const renderCardWidget = (slideId) => {
    const cardBaseClass = "w-full max-w-[380px] sm:max-w-[400px] h-[220px] sm:h-[230px] rounded-[24px] bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 p-md shadow-xl flex flex-col justify-between text-left text-white";
    
    switch (slideId) {
      case "life-saving-medicines":
        return (
          <div className={cardBaseClass}>
            <div className="space-y-xs">
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Natco Pharma</span>
              <h4 className="font-black text-sm text-white truncate">Sorafenat 200mg</h4>
              <p className="text-[10px] text-white/70">Sorafenib Tosylate (Cancer Care)</p>
            </div>
            <div className="flex justify-between items-end pt-xs border-t border-white/10">
              <div>
                <span className="text-[10px] text-white/50 line-through block">Original: ₹8,900</span>
                <span className="text-sm font-black text-white">WellMeds: ₹3,450</span>
              </div>
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded">61% SAVINGS</span>
            </div>
          </div>
        );
      case "why-patients-trust":
        return (
          <div className={cardBaseClass}>
            <div className="flex gap-xs text-amber-400">
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p className="text-xs text-white/90 italic font-medium leading-relaxed my-xs">
              "Saved over ₹15,000 monthly on my mother's oncology prescriptions. The cold-chain packing was extremely professional."
            </p>
            <div className="flex justify-between items-center border-t border-white/10 pt-xs">
              <span className="text-[10px] font-black uppercase tracking-wider">— Mrs. Iyer, Pune</span>
              <span className="text-[8px] uppercase font-black tracking-widest px-2 py-0.5 bg-emerald-500/25 text-emerald-300 rounded flex items-center gap-xs">
                <CheckCircle size={8} /> Verified Patient
              </span>
            </div>
          </div>
        );
      case "exclusive-savings":
        return (
          <div className={`${cardBaseClass} text-slate-800 dark:text-zinc-100 !bg-white/95 dark:!bg-zinc-900/95`}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <h4 className="font-black text-xs flex items-center gap-xs text-[#086b53] dark:text-emerald-400">
                <DollarSign size={14} />
                Savings Calculator
              </h4>
              <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded">85% MAX OFF</span>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                <span>Monthly Medicine Cost</span>
                <span className="font-black text-slate-700 dark:text-zinc-200">{formatCurrency(calcCost)}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={calcCost}
                onChange={(e) => setCalcCost(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#086b53]"
              />
            </div>

            <div className="grid grid-cols-2 gap-sm pt-xs border-t border-slate-100 dark:border-zinc-800/60 text-center">
              <div className="bg-slate-50 dark:bg-zinc-950 p-sm rounded-lg">
                <span className="text-[9px] text-slate-400 dark:text-zinc-400 font-bold block">WellMeds Price</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calcCost * 0.15)}</span>
              </div>
              <div className="bg-emerald-500/10 p-sm rounded-lg border border-emerald-500/20">
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold block">You Save</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calcCost * 0.85)}</span>
              </div>
            </div>
          </div>
        );
      case "prescription-upload":
        return (
          <div className={cardBaseClass}>
            <h4 className="font-bold text-xs flex items-center gap-xs border-b border-white/10 pb-xs">
              <FileText size={14} />
              Quick Verification Checklist
            </h4>
            <div className="space-y-sm text-xs py-xs">
              <div className="flex items-center gap-md">
                <span className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Select Medicine & Quantity</span>
              </div>
              <div className="flex items-center gap-md">
                <span className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Upload Prescription Image/PDF</span>
              </div>
              <div className="flex items-center gap-md">
                <span className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">3</span>
                <span className="font-semibold">Certified Pharmacist Review (10 mins)</span>
              </div>
            </div>
          </div>
        );
      case "three-hour-delivery":
        return (
          <div className={cardBaseClass}>
            <div className="flex justify-between items-center border-b border-white/10 pb-xs">
              <h4 className="font-bold text-xs flex items-center gap-xs">
                <Truck size={14} className="animate-bounce" />
                Express Dispatch Timer
              </h4>
              <span className="text-[8px] bg-emerald-500 px-2 py-0.5 rounded uppercase font-black tracking-wider">Riders Active</span>
            </div>
            
            <div className="flex items-center justify-between py-xs">
              <div className="space-y-xs">
                <p className="text-white/60 text-[9px] font-bold uppercase">Next Dispatch In</p>
                <p className="text-xl font-black flex items-center gap-xs font-mono">
                  <Clock size={16} className="text-emerald-400" />
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </p>
              </div>
              <div className="text-right space-y-xs">
                <p className="text-white/60 text-[9px] font-bold uppercase">Locations</p>
                <p className="text-[10px] font-extrabold flex items-center justify-end gap-xs">
                  <MapPin size={12} className="text-red-400" />
                  <span>Pune & PCMC</span>
                </p>
              </div>
            </div>

            <div className="pt-xs border-t border-white/10 text-[9px] text-white/70 font-medium">
              Our temperature-monitored cold-chain bags guarantee medicine potency upon arrival.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
      className="relative max-w-[1400px] mx-auto my-md min-h-[620px] sm:min-h-[560px] md:min-h-[460px] lg:min-h-[520px] h-auto rounded-3xl overflow-hidden bg-gradient-to-br from-[#004782] to-[#086b53] shadow-xl group focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 outline-none transition-all duration-300 flex flex-col justify-center"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 0h40v40H0z%22 fill=%22none%22/><path d=%22M0 20h40M20 0v40%22 stroke=%22%23ffffff%22 stroke-width=%221.5%22/></svg>')] bg-repeat" />

      <div className="relative w-full h-full flex flex-col">
        {promoSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`w-full transition-all duration-700 ease-in-out bg-gradient-to-br ${slide.bgGradient || "from-[#004782] to-[#086b53]"} ${
                isActive
                  ? "relative opacity-100 z-10 pointer-events-auto flex flex-col md:flex-row items-center px-6 sm:px-12 lg:px-16 py-10 md:py-0 min-h-[560px] md:min-h-[460px] lg:min-h-[520px]"
                  : "absolute inset-0 opacity-0 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <div className="absolute top-10 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-2xl animate-pulse-slow pointer-events-none"></div>
              <div className="absolute bottom-10 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl animate-pulse-slow [animation-delay:3s] pointer-events-none"></div>

              <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-lg md:gap-xl items-center justify-between z-10 text-white">
                
                <div className={`w-full md:w-[58%] space-y-md text-center md:text-left ${isActive ? "animate-[fade-in-up_0.5s_ease-out_both]" : ""}`}>
                  <span className="inline-flex items-center gap-xs px-3.5 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-white/10 select-none">
                    {slide.eyebrow}
                  </span>
                  <h2 className="font-headline-lg text-[30px] sm:text-3xl md:text-4xl lg:text-[42px] font-black leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="font-body-md text-[15px] md:text-sm lg:text-base text-white/80 leading-relaxed font-medium max-w-2xl mx-auto md:mx-0">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-sm pt-xs w-full">
                    {slide.id === "life-saving-medicines" ? (
                      <>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20need%20help%20finding%20a%20medicine."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-[48px] md:h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          <MessageCircle size={14} />
                          WhatsApp Sourcing Desk
                        </a>
                        <Link
                          to="/products"
                          className="h-[48px] md:h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Browse Catalog
                        </Link>
                      </>
                    ) : slide.id === "prescription-upload" ? (
                      <>
                        <Link
                          to="/upload-prescription"
                          className="h-[48px] md:h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          Upload Rx Sheet
                        </Link>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20want%20to%20upload%20my%20prescription."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-[48px] md:h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Send via WhatsApp
                        </a>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/products"
                          className="h-[48px] md:h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          Explore Therapies
                        </Link>
                        <Link
                          to="/contact"
                          className="h-[48px] md:h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Contact Support
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-md gap-y-xs text-[11px] text-white/65 font-bold pt-md border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                      100% Genuine Medicines
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                      Certified Pharmacist Verified
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                      Express Doorstep Delivery
                    </span>
                  </div>
                </div>

                <div className={`w-full md:w-[38%] flex flex-col md:flex-row items-center justify-center gap-md ${isActive ? "animate-[fade-in-up_0.5s_ease-out_0.2s_both]" : ""}`}>
                  <div className="flex flex-row md:flex-col gap-xs select-none w-full md:w-auto justify-center">
                    <span className="inline-flex items-center gap-xs px-3 py-1 bg-white/10 dark:bg-black/30 backdrop-blur rounded-full border border-white/15 text-[10px] font-bold text-white shadow-sm animate-float">
                      ★★★★★ 4.9 Rating
                    </span>
                    <span className="inline-flex items-center gap-xs px-3 py-1 bg-white/10 dark:bg-black/30 backdrop-blur rounded-full border border-white/15 text-[10px] font-bold text-white shadow-sm animate-float [animation-delay:1s]">
                      15,000+ Patients
                    </span>
                    <span className="inline-flex items-center gap-xs px-3 py-1 bg-white/10 dark:bg-black/30 backdrop-blur rounded-full border border-white/15 text-[10px] font-bold text-white shadow-sm animate-float [animation-delay:2s]">
                      100% Genuine
                    </span>
                  </div>

                  <div className="w-full flex justify-center">
                    {renderCardWidget(slide.id)}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

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
