import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageCircle, Globe, ShieldCheck, HelpCircle, Activity, FileText, Truck, ArrowRight, DollarSign, Clock, MapPin, Star } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import PromoNavigation from "./PromoNavigation";

const promoSlides = [
  {
    id: "life-saving-medicines",
    title: "Critical & Life-Saving Medicine Support",
    subtitle: "Struggling to find rare or critical care medicines? Request them directly via WhatsApp. Dedicated clinical team, cold-chain logistics, and immediate dispatch.",
    bgGradient: "from-[#004782] via-[#0b5c9e] to-[#086b53]"
  },
  {
    id: "why-patients-trust",
    title: "Why 15,000+ Patients Trust WellMeds",
    subtitle: "We maintain 100% authentic pharmacy operations, certified clinical pharmacist oversight, and specialized cold-chain integrity for every single delivery.",
    bgGradient: "from-[#086b53] via-[#055743] to-[#004782]"
  },
  {
    id: "exclusive-savings",
    title: "Direct-from-Manufacturer Pricing",
    subtitle: "Bypass distributor markups. WellMeds connects you directly to WHO-GMP certified manufacturers to deliver up to 85% savings on chronic care therapies.",
    bgGradient: "from-[#0b5c9e] via-[#004782] to-[#086b53]"
  },
  {
    id: "prescription-upload",
    title: "10-Minute Prescription Verification",
    subtitle: "Upload your medical prescription sheet. Our certified clinical pharmacists will review, validate, and call you back within 10 minutes to finalize your order.",
    bgGradient: "from-[#004782] via-[#0b5c9e] to-[#0b5c9e]"
  },
  {
    id: "three-hour-delivery",
    title: "Express 3-Hour Emergency Delivery",
    subtitle: "Urgent medical requirements? Our express delivery riders are active across Pune, Hinjawadi, and PCMC to deliver critical supplies with certified cold-chain bags.",
    bgGradient: "from-[#086b53] via-[#055743] to-[#086b53]"
  }
];

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayTimer = useRef(null);

  // Interactive Calculator State (Slide 3)
  const [calcCost, setCalcCost] = useState(10000);

  // Live Timer State (Slide 5)
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 20 });

  const totalSlides = promoSlides.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay Effect
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

  // Slide 5 Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: 14, seconds: 59 }; // Reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch Swipe handlers for mobile
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

  // Render Right Column Content for each unique slide
  const renderRightColumn = (slideId) => {
    switch (slideId) {
      case "life-saving-medicines":
        return (
          <div className="w-full flex gap-md items-center justify-center relative">
            {/* Medicine Card 1 */}
            <div className="w-full max-w-[220px] mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur rounded-2xl border border-white/20 p-md shadow-xl animate-float text-left space-y-xs">
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">Natco Pharma</span>
              <h4 className="font-black text-xs text-slate-800 dark:text-zinc-100 truncate">Sorafenat 200mg</h4>
              <p className="text-[9px] text-slate-450 truncate">Sorafenib Tosylate</p>
              <div className="flex justify-between items-end pt-xs border-t border-slate-100 dark:border-zinc-800/60 mt-xs">
                <div>
                  <span className="text-[10px] text-slate-400 line-through block">₹8,900</span>
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100">₹3,450</span>
                </div>
                <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">61% OFF</span>
              </div>
            </div>
            {/* Medicine Card 2 */}
            <div className="w-full sm:w-[210px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur rounded-2xl border border-white/20 p-md shadow-xl animate-float [animation-delay:1.5s] text-left space-y-xs hidden sm:block">
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">Cipla Oncology</span>
              <h4 className="font-black text-xs text-slate-800 dark:text-zinc-100 truncate">Gefticip 250mg</h4>
              <p className="text-[9px] text-slate-450 truncate">Gefitinib IP</p>
              <div className="flex justify-between items-end pt-xs border-t border-slate-100 dark:border-zinc-800/60 mt-xs">
                <div>
                  <span className="text-[10px] text-slate-400 line-through block">₹7,200</span>
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100">₹2,890</span>
                </div>
                <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">60% OFF</span>
              </div>
            </div>
          </div>
        );
      case "why-patients-trust":
        return (
          <div className="w-full flex flex-col sm:flex-row gap-sm items-stretch justify-center text-left">
            {/* Stats Grid */}
            <div className="hidden sm:grid flex-1 grid-cols-2 gap-sm">
              <div className="bg-white/10 dark:bg-black/25 backdrop-blur border border-white/15 p-sm rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-xl font-black text-white">4.9 ★</span>
                <span className="text-[9px] text-white/80 font-bold">Google Rating</span>
              </div>
              <div className="bg-white/10 dark:bg-black/25 backdrop-blur border border-white/15 p-sm rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-xl font-black text-white">35%</span>
                <span className="text-[9px] text-white/80 font-bold">Avg. Savings</span>
              </div>
              <div className="bg-white/10 dark:bg-black/25 backdrop-blur border border-white/15 p-sm rounded-xl flex flex-col justify-center items-center text-center col-span-2">
                <span className="text-xl font-black text-white">100%</span>
                <span className="text-[9px] text-white/80 font-bold">Authenticity Guarantee</span>
              </div>
            </div>
            {/* Testimonial Quote */}
            <div className="w-full max-w-[280px] sm:max-w-none mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-white/20 p-md rounded-2xl shadow-lg flex flex-col justify-between min-h-[130px]">
              <div className="flex gap-xs text-amber-500">
                <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic font-medium leading-relaxed my-xs">
                "Saved over ₹15,000 monthly on my mother's oncology prescriptions. The cold-chain packing was extremely professional."
              </p>
              <span className="text-[9px] font-black text-[#004782] dark:text-blue-400 uppercase tracking-wider">— Mrs. Iyer, Pune</span>
            </div>
          </div>
        );
      case "exclusive-savings":
        return (
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-white/20 p-md rounded-2xl shadow-xl space-y-md text-left text-slate-800 dark:text-zinc-100">
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
          </div>
        );
      case "prescription-upload":
        return (
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto bg-white/10 dark:bg-black/25 backdrop-blur border border-white/15 p-md rounded-2xl shadow-lg space-y-md text-left text-white">
              <h4 className="font-bold text-xs flex items-center gap-xs border-b border-white/10 pb-xs">
                <FileText size={14} />
                Quick Verification Checklist
              </h4>
              <div className="space-y-sm text-xs">
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
          </div>
        );
      case "three-hour-delivery":
        return (
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto bg-white/10 dark:bg-black/25 backdrop-blur border border-white/15 p-md rounded-2xl shadow-lg space-y-md text-left text-white">
              <div className="flex justify-between items-center border-b border-white/10 pb-xs">
                <h4 className="font-bold text-xs flex items-center gap-xs">
                  <Truck size={14} className="animate-bounce" />
                  Express Dispatch Timer
                </h4>
                <span className="text-[8px] bg-emerald-500 px-2 py-0.5 rounded uppercase font-black tracking-wider">Riders Active</span>
              </div>
              
              <div className="flex items-center justify-between">
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
      className="relative max-w-[1400px] mx-auto my-md min-h-[520px] sm:min-h-[480px] md:min-h-[430px] lg:min-h-[450px] h-auto rounded-3xl overflow-hidden bg-gradient-to-br from-[#004782] to-[#086b53] shadow-xl group focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 outline-none transition-all duration-300 flex flex-col justify-center"
    >
      {/* Slides */}
      <div className="relative w-full h-full flex flex-col">
        {promoSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`w-full transition-all duration-700 ease-in-out bg-gradient-to-br ${slide.bgGradient || "from-[#004782] to-[#086b53]"} ${
                isActive
                  ? "relative opacity-100 z-10 pointer-events-auto flex flex-col md:flex-row items-center px-6 sm:px-12 lg:px-16 py-8 md:py-0 min-h-[480px] md:min-h-[430px]"
                  : "absolute inset-0 opacity-0 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              {/* Floating Background Blobs */}
              <div className="absolute top-10 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-2xl animate-pulse-slow pointer-events-none"></div>
              <div className="absolute bottom-10 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl animate-pulse-slow [animation-delay:3s] pointer-events-none"></div>

              <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-lg items-center justify-between z-10 text-white">
                {/* Left: Content */}
                <div className={`w-full md:w-[50%] space-y-md text-left ${isActive ? "animate-slide-in-left" : ""}`}>
                  <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="font-body-md text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed font-medium line-clamp-3">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-sm pt-xs w-full">
                    {slide.id === "life-saving-medicines" ? (
                      <>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20need%20help%20finding%20a%20medicine."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          <MessageCircle size={14} />
                          WhatsApp Sourcing Desk
                        </a>
                        <Link
                          to="/products"
                          className="h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Browse Catalog
                        </Link>
                      </>
                    ) : slide.id === "prescription-upload" ? (
                      <>
                        <Link
                          to="/upload-prescription"
                          className="h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          Upload Rx Sheet
                        </Link>
                        <a
                          href="https://wa.me/917420909445?text=Hello%20WellMeds,%20I%20want%20to%20upload%20my%20prescription."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Send via WhatsApp
                        </a>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/products"
                          className="h-11 px-lg bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow cursor-pointer select-none w-full sm:w-auto"
                        >
                          Explore Therapies
                        </Link>
                        <Link
                          to="/contact"
                          className="h-11 px-lg border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer select-none w-full sm:w-auto"
                        >
                          Contact Support
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Unique Slides Layout */}
                <div className={`w-full md:w-[45%] mt-lg md:mt-0 ${isActive ? "animate-slide-in-right" : ""}`}>
                  {renderRightColumn(slide.id)}
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
