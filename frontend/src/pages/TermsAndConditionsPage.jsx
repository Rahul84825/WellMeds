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
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 text-left">
      <SEO
        title="Terms & Conditions | Legal Pharmacy Terms"
        description="Review WellMeds terms of service for online medication orders, prescription requirements under Drugs and Cosmetics Rules, patient obligations, and service policies."
        canonical="/terms-and-conditions"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Terms & Conditions
          </h1>
        </div>
      </div>

      {/* ── 2. MAIN TERMS CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 text-left">
        
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
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
