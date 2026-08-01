import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import {
  Truck,
  Thermometer,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Clock,
  PackageCheck,
  CheckCircle2
} from "lucide-react";

const ShippingPolicyPage = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shipping & Delivery Policy", url: "/shipping-policy" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 select-none">
      <SEO
        title="Shipping & Delivery Policy | Cold-Chain Transit"
        description="WellMeds shipping rates, express medicine delivery timelines across Pune, Maharashtra, and pan-India cold-chain logistics."
        canonical="/shipping-policy"
        breadcrumbs={breadcrumbs}
      />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative bg-[#f4f9f7] dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800 py-12 md:py-16 overflow-hidden text-left">
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#157a6d 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-[#157a6d]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Shipping & Delivery Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
            <Truck size={14} className="text-[#b08d3e]" />
            <span>TEMPERATURE-CONTROLLED COLD-CHAIN LOGISTICS</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight max-w-3xl">
            Shipping & <span className="text-[#157a6d] dark:text-emerald-400">Cold-Chain Delivery</span>
          </h1>

          <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Reliable, safe, and expedited medicine fulfillment directly to your doorstep or healthcare clinic with certified thermal protection.
          </p>

          <div className="pt-2 text-xs font-clinical-mono text-slate-500 dark:text-zinc-400 font-semibold">
            Pune Express Dispatch: 3 Hours | Pan-India Express: 24–48 Hours
          </div>
        </div>
      </section>

      {/* ── 2. MAIN CONTENT GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        
        {/* Delivery Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Same-Day Pune Dispatch</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Rapid 3-hour local dispatch for urgent prescriptions across Baner, Hinjawadi, Wakad, Kothrud & PCMC.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Thermometer size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Cold-Chain Guarantee</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              2°C – 8°C temperature integrity for insulin, biologicals, and GLP-1 therapy using calibrated gel packs.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <PackageCheck size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Live SMS & WhatsApp Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Real-time SMS & WhatsApp alerts with live temperature logs and courier tracking links upon dispatch.
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 sm:p-10 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                01
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Delivery Coverage & Express Slots
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              We offer express same-day and 24-hour priority medicine delivery across Pune city (Baner, Aundh, Wakad, Kothrud, Hinjawadi, Viman Nagar) and 2–4 day express courier service across all pin codes in India.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                02
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Cold-Chain Biological Transit (2°C – 8°C Protocol)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              Biological medicines, insulin, monoclonal antibodies, and vaccines are dispatched in insulated thermal boxes with calibrated gel ice packs, guaranteeing temperature integrity during the entire transit window.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                03
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Real-Time Order Tracking & Dispatch Verification
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              Upon pharmacist approval, a real-time tracking link with live dispatch status is dispatched via SMS and WhatsApp to ensure complete visibility until doorstep delivery.
            </p>
          </section>

        </div>

        {/* ── 3. REUSABLE WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
      </main>

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default ShippingPolicyPage;
