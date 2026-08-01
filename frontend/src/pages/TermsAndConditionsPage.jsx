import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import {
  FileText,
  ShieldAlert,
  Pill,
  CheckCircle2,
  ChevronRight,
  Gavel,
  Scale,
  Sparkles
} from "lucide-react";

const TermsAndConditionsPage = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Terms & Conditions", url: "/terms-and-conditions" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 select-none">
      <SEO
        title="Terms & Conditions | Legal Pharmacy Terms"
        description="Review WellMeds terms of service for online medication orders, prescription requirements under Drugs and Cosmetics Rules, patient obligations, and service policies."
        canonical="/terms-and-conditions"
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
            <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Terms & Conditions</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
            <FileText size={14} className="text-[#b08d3e]" />
            <span>PHARMACY ACT 1948 & DRUGS AND COSMETICS ACT COMPLIANT</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight max-w-3xl">
            Terms & Conditions of <span className="text-[#157a6d] dark:text-emerald-400">Pharmacy Service</span>
          </h1>

          <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Please read these legal terms carefully before placing orders for prescription medicines, surgical supplies, or specialty biological products on WellMeds.
          </p>

          <div className="pt-2 text-xs font-clinical-mono text-slate-500 dark:text-zinc-400 font-semibold">
            Effective Version: July 2026 | Governing Body: CDSCO / Maharashtra FDA
          </div>
        </div>
      </section>

      {/* ── 2. MAIN TERMS CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Pill size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Strict Prescription Compliance</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Schedule H, H1, and specialty drugs require valid RMP written prescriptions verified by certified pharmacists.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Transparent GST Pricing</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              All prices include statutory GST and are sourced directly from WHO-GMP certified pharmaceutical manufacturers.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Gavel size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Jurisdiction & Legal Terms</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Governed by the laws of India with exclusive legal jurisdiction under the Courts of Pune, Maharashtra.
            </p>
          </div>
        </div>

        {/* Detailed Sections Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 sm:p-10 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                01
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Prescription Requirement (Schedule H & H1 Formulations)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              In accordance with the Drugs and Cosmetics Act 1940 and Rules framed thereunder, prescription-only medicines (Schedule H, H1, and Schedule X) will strictly be dispensed only upon submission and clinical verification of a valid written prescription issued by a registered medical practitioner (RMP).
            </p>
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-300 text-xs sm:text-sm">
              <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="font-sans leading-relaxed">
                <strong>Mandatory Verification Policy:</strong> Orders submitted without a legible, valid doctor’s prescription will be flagged by our clinical pharmacist desk and subject to immediate cancellation and refund.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                02
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Ordering, Pricing & Cold-Chain Storage Guidelines
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              All prices listed on WellMeds are inclusive of GST. Products are stored in climate-controlled, temperature-monitored facilities adhering strictly to WHO GDP (Good Distribution Practice) guidelines. We reserve the right to revise prices or update product specifications as notified by pharmaceutical manufacturers.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                03
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Medical & Educational Disclaimer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              The health information, molecule descriptions, and clinical guidance provided on WellMeds are intended strictly for educational purposes and do not constitute medical diagnosis or replace professional consultation with a qualified doctor.
            </p>
          </section>

          {/* Section 4: Governing Jurisdiction */}
          <section className="bg-[#f4f9f7] dark:bg-zinc-800/60 p-6 rounded-[24px] border border-slate-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Governing Law & Legal Jurisdiction</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              These terms are governed by the laws of India. Any legal disputes arising out of the use of WellMeds platforms are subject to the exclusive jurisdiction of the courts in <strong className="text-[#172b26] dark:text-white font-semibold">Pune, Maharashtra, India</strong>.
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

export default TermsAndConditionsPage;
