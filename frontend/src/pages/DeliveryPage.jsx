import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import SEO from "../components/common/SEO";
import UniversalSearch from "../components/common/UniversalSearch";
import {
  Search,
  MessageSquare,
  Upload,
  PhoneCall,
  ShieldCheck,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Award,
  DollarSign,
  Truck,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";

const PUNE_PINCODES = [
  { name: "Koregaon Park", code: "411001" },
  { name: "Deccan Gymkhana", code: "411004" },
  { name: "Viman Nagar", code: "411014" },
  { name: "Baner", code: "411045" },
  { name: "Hadapsar", code: "411028" },
  { name: "Kothrud", code: "411038" },
  { name: "Wakad", code: "411057" },
  { name: "Pimple Saudagar", code: "411027" },
  { name: "Rasta Peth", code: "411002" },
  { name: "Kasba Peth", code: "411003" },
  { name: "Shivajinagar", code: "411005" },
  { name: "Yerwada", code: "411006" },
  { name: "Aundh", code: "411007" },
  { name: "Bopodi", code: "411008" },
  { name: "Bhavani Peth", code: "411009" },
  { name: "Raviwar Peth", code: "411011" },
  { name: "Somwar Peth", code: "411012" },
  { name: "Kondhwa", code: "411013" },
  { name: "Vishrantwadi", code: "411015" },
  { name: "Sadashiv Peth", code: "411016" },
  { name: "Kalewadi", code: "411017" },
  { name: "Vishrambaug Wada", code: "411018" },
  { name: "Chinchwad East", code: "411019" },
  { name: "Sinhagad Road", code: "411020" },
  { name: "Bavdhan", code: "411021" },
  { name: "Warje", code: "411022" },
  { name: "Wanawadi", code: "411023" },
  { name: "Parvati", code: "411024" },
  { name: "Ambegaon Budruk", code: "411025" },
  { name: "Fatima Nagar", code: "411026" },
  { name: "Kondhwa Budruk", code: "411029" },
  { name: "Ghorpadi", code: "411030" },
  { name: "Mundhwa", code: "411031" },
  { name: "Kharadi", code: "411032" },
  { name: "Chinchwad Gaon", code: "411033" },
  { name: "Aundh Camp", code: "411034" },
  { name: "Vadgaon Sheri", code: "411035" },
  { name: "Bibwewadi", code: "411036" },
  { name: "Bibwewadi Extension", code: "411037" },
  { name: "Karve Nagar", code: "411039" },
  { name: "Wanowrie", code: "411040" },
  { name: "Katraj", code: "411041" },
  { name: "Ambegaon Khurd", code: "411042" },
  { name: "Dhankawadi", code: "411043" },
  { name: "Nigdi", code: "411044" },
  { name: "Katraj Extension", code: "411046" },
  { name: "Kondhwa Khurd", code: "411047" },
  { name: "Undri", code: "411048" },
  { name: "Uruli Devachi", code: "411049" },
  { name: "Loni Kalbhor", code: "411050" },
  { name: "Chikhali", code: "411051" },
  { name: "Moshi", code: "411052" },
  { name: "Bhosari", code: "411053" },
  { name: "Charholi", code: "411054" },
  { name: "Alandi Road", code: "411055" },
  { name: "Dapodi", code: "411056" },
  { name: "Tathawade", code: "411059" },
  { name: "Punawale", code: "411060" },
  { name: "Pimple Gurav", code: "411061" },
  { name: "Talwade", code: "411062" }
];

const FAQS = [
  {
    q: "How fast can I get medicines delivered in Pune?",
    a: "Most orders within Pune city limits are delivered within 3 hours from pharmacist confirmation. Delivery time may vary depending on item availability and exact distance, and 2-day delivery applies to pan-India orders."
  },
  {
    q: "Can I order prescription medicines online?",
    a: "Yes — simply upload a clear photo or PDF of your doctor's prescription through the WellMeds site or message it to us on WhatsApp. Our registered in-house pharmacists will verify the dosage and availability before dispatch."
  },
  {
    q: "Do you deliver outside Pune city limits too?",
    a: "Yes, WellMeds delivers pan-India with express 2-day cold-chain logistics, so suburban areas on the outskirts of Pune and PCMC are fully covered."
  },
  {
    q: "What if I don't have a prescription?",
    a: "Over-the-counter (OTC) medicines, daily health supplements, personal care, and wellness products can be ordered directly without a prescription."
  }
];

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [pincodesExpanded, setPincodesExpanded] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [revealedSections, setRevealedSections] = useState({});
  const carouselTimerRef = useRef(null);
  const isHoveringCarousel = useRef(false);

  // Copy offer code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Intersection Observer for graceful reveal animations
  const sectionRefs = useRef({});
  const registerSectionRef = (key) => (el) => {
    if (el) sectionRefs.current[key] = el;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute("data-section-key");
            if (key) {
              setRevealedSections((prev) => ({ ...prev, [key]: true }));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Offer carousel autoplay
  useEffect(() => {
    carouselTimerRef.current = setInterval(() => {
      if (!isHoveringCarousel.current) {
        setOfferIndex((prev) => (prev === 0 ? 1 : 0));
      }
    }, 5000);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

  const displayedPincodes = pincodesExpanded ? PUNE_PINCODES : PUNE_PINCODES.slice(0, 8);

  const whatsappOrderUrl = getWhatsAppLink(
    "Hi WellMeds, I would like to order medicines for delivery in Pune."
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Medicine Delivery in Pune", url: "/delivery" }
  ];

  // FAQPage Schema matching visible FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white text-[#172B26] font-sans antialiased selection:bg-[#157A6D] selection:text-white">
      <SEO
        title="Medicine Delivery in Pune | WellMeds"
        description="Order genuine medicines online with WellMeds for reliable 3-hour medicine delivery across Pune. Upload your prescription or browse specialty healthcare."
        canonical="/delivery"
        breadcrumbs={breadcrumbs}
        schema={faqSchema}
      />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative bg-gradient-to-b from-[#0F3B34] to-[#0d332d] text-white pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden text-center px-4 sm:px-8">
        {/* Glow ambient background circles */}
        <div
          className="absolute -top-40 -right-28 w-[480px] h-[480px] rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(21,122,109,0.5) 0%, rgba(21,122,109,0) 70%)" }}
        />
        <div
          className="absolute -bottom-48 -left-28 w-[420px] h-[420px] rounded-full pointer-events-none opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(176,141,62,0.3) 0%, rgba(176,141,62,0) 70%)" }}
        />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Main Headline (Single H1) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Your medicines, delivered anywhere in{" "}
            <span className="text-[#E8C547]">
              Pune
            </span>{" "}
            — in 3 hours.
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Genuine medicines, licensed pharmacist verification, and temperature-controlled doorstep delivery across 60+ Pune pincodes.
          </p>

          {/* Universal Search Bar */}
          <div id="hero-search-anchor" className="max-w-2xl mx-auto w-full text-left relative z-30">
            <UniversalSearch variant="default" />
          </div>

          {/* Quick Action Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium">
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 hover:border-[#157A6D] hover:bg-[#157A6D]/20 text-white transition-all bg-white/5 backdrop-blur-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#84d6b9]" />
              <span>↳ Order on WhatsApp</span>
            </a>

            <Link
              to="/upload-prescription"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 hover:border-[#157A6D] hover:bg-[#157A6D]/20 text-white transition-all bg-white/5 backdrop-blur-sm"
            >
              <Upload className="w-4 h-4 text-[#E8C547]" />
              <span>↳ Upload Prescription</span>
            </Link>

            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 hover:border-[#157A6D] hover:bg-[#157A6D]/20 text-white transition-all bg-white/5 backdrop-blur-sm"
            >
              <PhoneCall className="w-4 h-4 text-[#84d6b9]" />
              <span>↳ Call to Order ({BUSINESS_INFO.phoneDisplay})</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST / SERVICE HIGHLIGHTS ── */}
      <section
        ref={registerSectionRef("trust")}
        data-section-key="trust"
        className={`bg-white border-b border-[#172B26]/10 py-7 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.trust ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#157A6D]/10 text-[#157A6D] flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#172B26]">Cash on delivery</h4>
              <p className="text-xs sm:text-sm text-[#172B26]/65">Pay when it arrives at your doorstep</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#157A6D]/10 text-[#157A6D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#172B26]">Verified pharmacists</h4>
              <p className="text-xs sm:text-sm text-[#172B26]/65">Every order checked before dispatch</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#157A6D]/10 text-[#157A6D] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#172B26]">Easy returns</h4>
              <p className="text-xs sm:text-sm text-[#172B26]/65">No awkward questions on damaged items</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#157A6D]/10 text-[#157A6D] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#172B26]">3-hour delivery</h4>
              <p className="text-xs sm:text-sm text-[#172B26]/65">Within Pune city, 2 days pan-India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FIRST ORDER OFFERS / CAROUSEL ── */}
      <section
        ref={registerSectionRef("offers")}
        data-section-key="offers"
        className={`py-12 md:py-16 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.offers ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-8">
            <div className="text-xs font-bold tracking-widest text-[#157A6D] uppercase mb-1">
              THIS WEEK IN PUNE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B26]">Offers for your first order</h2>
          </div>

          {/* Carousel Container */}
          <div
            className="relative max-w-xl mx-auto md:mx-0"
            onMouseEnter={() => { isHoveringCarousel.current = true; }}
            onMouseLeave={() => { isHoveringCarousel.current = false; }}
          >
            <div className="overflow-hidden rounded-2xl shadow-lg border border-[#172B26]/10">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${offerIndex * 100}%)` }}
              >
                {/* Slide 1: FIRST200 */}
                <div className="w-full shrink-0 p-1">
                  <div className="bg-[#0F3B34] text-white rounded-2xl p-7 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-4 -right-8 rotate-45 bg-[#C1703A] text-white text-[10px] font-bold tracking-widest px-8 py-1 shadow-md uppercase">
                      ₹200 OFF
                    </div>
                    <div className="text-xs font-semibold tracking-widest text-[#84d6b9] uppercase mb-2">
                      FIRST ORDER SAVINGS
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Flat ₹200 off on your first order
                    </h3>
                    <p className="text-sm text-white/75 mb-5 max-w-md">
                      Valid on prescription medicines and healthcare products above ₹500 across Pune.
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyCode("FIRST200")}
                        className="inline-flex items-center gap-2 border border-dashed border-white/30 px-4 py-2 rounded-lg font-mono font-bold text-sm text-[#E8C547] hover:bg-white/10 transition-colors cursor-pointer"
                        title="Click to copy coupon code"
                      >
                        <span>CODE: FIRST200</span>
                        {copiedCode === "FIRST200" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-70" />
                        )}
                      </button>
                      <Link
                        to="/products"
                        className="text-xs text-[#84d6b9] hover:underline font-semibold"
                      >
                        Shop Now →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Slide 2: WhatsApp Refill */}
                <div className="w-full shrink-0 p-1">
                  <div className="bg-white text-[#172B26] border border-[#172B26]/10 rounded-2xl p-7 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-4 -right-8 rotate-45 bg-[#157A6D] text-white text-[10px] font-bold tracking-widest px-8 py-1 shadow-md uppercase">
                      NEW
                    </div>
                    <div className="text-xs font-semibold tracking-widest text-[#C1703A] uppercase mb-2">
                      AUTOMATED REFILLS
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#172B26] mb-2">
                      Refill reminders via WhatsApp
                    </h3>
                    <p className="text-sm text-[#172B26]/75 mb-5 max-w-md">
                      Never miss a chronic medicine refill — our Pune team messages you before your monthly supply runs out.
                    </p>

                    <a
                      href={whatsappOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#157A6D] hover:bg-[#12665b] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Set Up on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={() => setOfferIndex((prev) => (prev === 0 ? 1 : 0))}
              className="absolute top-1/2 -left-4 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#172B26]/20 text-[#172B26] flex items-center justify-center shadow-md hover:bg-[#157A6D] hover:text-white transition-colors cursor-pointer"
              aria-label="Previous offer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setOfferIndex((prev) => (prev === 0 ? 1 : 0))}
              className="absolute top-1/2 -right-4 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#172B26]/20 text-[#172B26] flex items-center justify-center shadow-md hover:bg-[#157A6D] hover:text-white transition-colors cursor-pointer"
              aria-label="Next offer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setOfferIndex(0)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  offerIndex === 0 ? "bg-[#157A6D] w-6" : "bg-[#172B26]/20"
                }`}
                aria-label="Slide 1"
              />
              <button
                onClick={() => setOfferIndex(1)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  offerIndex === 1 ? "bg-[#157A6D] w-6" : "bg-[#172B26]/20"
                }`}
                aria-label="Slide 2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FACTS & FIGURES / STATISTICS ── */}
      <section
        ref={registerSectionRef("stats")}
        data-section-key="stats"
        className={`bg-[#0F3B34] text-white py-14 md:py-18 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto text-left space-y-8">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#84d6b9] uppercase mb-1">
              FACTS & FIGURES
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Built for how Pune actually orders medicine
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-4">
            <div className="border-l-2 border-[#157A6D] pl-4 sm:pl-5 space-y-1">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                3 hrs
              </span>
              <p className="text-xs sm:text-sm text-white/65">
                average delivery time in Pune
              </p>
            </div>

            <div className="border-l-2 border-[#157A6D] pl-4 sm:pl-5 space-y-1">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                60+
              </span>
              <p className="text-xs sm:text-sm text-white/65">
                Pune & PCMC pincodes covered
              </p>
            </div>

            <div className="border-l-2 border-[#157A6D] pl-4 sm:pl-5 space-y-1">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                100%
              </span>
              <p className="text-xs sm:text-sm text-white/65">
                orders pharmacist-verified
              </p>
            </div>

            <div className="border-l-2 border-[#157A6D] pl-4 sm:pl-5 space-y-1">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                24x7
              </span>
              <p className="text-xs sm:text-sm text-white/65">
                prescription upload & ordering
              </p>
            </div>
          </div>

          <p className="text-xs text-white/60 max-w-xl">
            Figures reflect current service commitments from our Baner, Pune hub and are continuously updated as local coverage expands.
          </p>
        </div>
      </section>

      {/* ── 5. PUNE DELIVERY COVERAGE / PINCODES ── */}
      <section
        ref={registerSectionRef("coverage")}
        data-section-key="coverage"
        className={`py-14 md:py-20 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.coverage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-6">
            <div className="text-xs font-bold tracking-widest text-[#0F3B34] uppercase mb-1">
              COVERAGE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B26]">
              Areas we deliver to in Pune
            </h2>
            <p className="text-xs sm:text-sm text-[#172B26]/70 mt-1 max-w-xl">
              Express 3-hour doorstep delivery across all key localities and suburban zones in Pune and Pimpri-Chinchwad.
            </p>
          </div>

          {/* Grid of Pincodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {displayedPincodes.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#172B26]/10 rounded-xl p-3.5 sm:p-4 text-sm hover:-translate-y-0.5 hover:border-[#157A6D] hover:shadow-sm transition-all text-left flex flex-col justify-between"
              >
                <span className="font-semibold text-[#172B26]">{item.name}</span>
                <span className="font-mono font-bold text-xs text-[#157A6D] mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C1703A]" />
                  {item.code}
                </span>
              </div>
            ))}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setPincodesExpanded((prev) => !prev)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#172B26]/20 hover:border-[#157A6D] hover:text-[#157A6D] font-bold text-sm text-[#172B26] transition-colors cursor-pointer bg-white/50"
          >
            <span>{pincodesExpanded ? "Show fewer areas" : "Show all 60 areas"}</span>
            {pincodesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* ── 6. ONLINE MEDICINE DELIVERY IN PUNE (SEO CONTENT) ── */}
      <section className="py-8 md:py-12 px-4 sm:px-8 border-t border-[#172B26]/10">
        <div className="max-w-6xl mx-auto text-left space-y-4">
          <div className="text-xs font-bold tracking-widest text-[#157A6D] uppercase">
            ABOUT THIS SERVICE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172B26]">
            Online medicine delivery in Pune
          </h2>
          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-[#172B26]/80">
            More residents across Pune are choosing to order genuine medicines online with WellMeds instead of waiting in line at local retail chemists. From chronic medications for diabetes, cardiology, and oncology to daily wellness essentials, every single order is reviewed and verified by a licensed pharmacist before it leaves our Baner distribution hub.
          </p>
          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-[#172B26]/80">
            Whether you need a one-time prescription filled or want to set up recurring monthly refills for family members, WellMeds delivers to Koregaon Park, Baner, Kothrud, Hadapsar, Viman Nagar, Wakad, and over 60 other pincodes across the city in as little as 3 hours. You can <Link to="/products" className="text-[#157A6D] underline font-semibold hover:text-[#0F3B34]">browse medicines directly</Link>, <Link to="/upload-prescription" className="text-[#157A6D] underline font-semibold hover:text-[#0F3B34]">upload a prescription photo</Link>, or simply message us on WhatsApp.
          </p>
        </div>
      </section>

      {/* ── 7. WHY WELLMEDS ── */}
      <section
        ref={registerSectionRef("why")}
        data-section-key="why"
        className={`bg-white py-14 md:py-20 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.why ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto text-left space-y-8">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#157A6D] uppercase mb-1">
              WHY WELLMEDS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B26]">
              Care that doesn't feel clinical
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-[#172B26]/10 hover:-translate-y-1 hover:shadow-md transition-all space-y-3">
              <div className="flex items-center gap-2 text-[#C1703A] font-bold text-xs tracking-widest uppercase">
                <Award className="w-5 h-5 text-[#C1703A]" />
                <span>GENUINE</span>
              </div>
              <h3 className="text-xl font-bold text-[#172B26]">Every medicine, verified</h3>
              <p className="text-sm text-[#172B26]/70 leading-relaxed">
                Sourced directly from certified pharmaceutical distributors and audited by our in-house pharmacists before shipping.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-[#172B26]/10 hover:-translate-y-1 hover:shadow-md transition-all space-y-3">
              <div className="flex items-center gap-2 text-[#C1703A] font-bold text-xs tracking-widest uppercase">
                <DollarSign className="w-5 h-5 text-[#C1703A]" />
                <span>AFFORDABLE</span>
              </div>
              <h3 className="text-xl font-bold text-[#172B26]">Honest generic pricing</h3>
              <p className="text-sm text-[#172B26]/70 leading-relaxed">
                The exact same active therapeutic ingredients as top branded formulations, priced fairly without artificial retail markups.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-[#172B26]/10 hover:-translate-y-1 hover:shadow-md transition-all space-y-3">
              <div className="flex items-center gap-2 text-[#C1703A] font-bold text-xs tracking-widest uppercase">
                <Truck className="w-5 h-5 text-[#C1703A]" />
                <span>RELIABLE</span>
              </div>
              <h3 className="text-xl font-bold text-[#172B26]">3-hour delivery, tracked</h3>
              <p className="text-sm text-[#172B26]/70 leading-relaxed">
                Dispatched directly from our Pune pharmacy straight to your door, complete with cold-chain packaging and real-time updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. PUNE FAQS ── */}
      <section
        ref={registerSectionRef("faq")}
        data-section-key="faq"
        className={`py-14 md:py-20 px-4 sm:px-8 transition-all duration-700 ${
          revealedSections.faq ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-8">
            <div className="text-xs font-bold tracking-widest text-[#157A6D] uppercase mb-1">
              PUNE FAQS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B26]">
              Common questions from Pune customers
            </h2>
          </div>

          <div className="divide-y divide-[#172B26]/10 border-t border-b border-[#172B26]/10">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-5 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-[#172B26] flex items-start gap-2">
                  <span className="text-[#157A6D]">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-sm text-[#172B26]/75 leading-relaxed pl-6 max-w-3xl">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ── */}
      <section
        ref={registerSectionRef("cta")}
        data-section-key="cta"
        className={`bg-[#157A6D] text-white py-14 md:py-20 px-4 sm:px-8 text-center transition-all duration-700 ${
          revealedSections.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Pune, your medicines are a tap away.
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-lg mx-auto">
            Upload your prescription now and our registered pharmacists will verify it in under a minute.
          </p>
          <div className="pt-3">
            <Link
              to="/upload-prescription"
              className="inline-flex items-center gap-2 bg-white hover:bg-white text-[#172B26] font-bold px-8 py-3.5 rounded-full text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 text-[#157A6D]" />
              <span>Upload Prescription</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeliveryPage;
