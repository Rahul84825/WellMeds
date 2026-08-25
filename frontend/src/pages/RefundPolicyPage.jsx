import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const RefundPolicyPage = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Refund & Cancellation Policy", url: "/refund-policy" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 text-left">
      <SEO
        title="Refund & Cancellation Policy | WellMeds"
        description="Learn about WellMeds hassle-free refund process, medicine return criteria, damaged shipment policies, and 100% money-back guarantee terms."
        canonical="/refund-policy"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 text-left">
        
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Full Refund Eligibility</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              100% refund or free replacement for damaged shipments, unsealed packages, or incorrect items.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Drug Safety Compliance</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Cold-chain biologicals and unsealed surgical consumables are non-returnable to prevent cross-contamination.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">3–5 Day Processing</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Approved refunds are credited back to your original payment method (UPI, Card, Net Banking) in 3–5 business days.
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
                Eligible Return & Refund Scenarios
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              We offer full replacement or 100% money-back refund under the following conditions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Damaged / Expired Item</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Delivered package seal was damaged or product expired.</p>
              </div>
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Incorrect Medicine Dispatched</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Product delivered differs from order confirmation slip.</p>
              </div>
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Pre-Dispatch Cancellation</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Order cancelled prior to pharmacist dispensary dispatch.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                02
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Non-Returnable Products (FDA Safety Mandates)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              To prevent cross-contamination and ensure patient safety under Drug Control regulations, cold-chain biological products (e.g. insulin), opened seals, and unsealed surgical consumables cannot be returned once delivered intact.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                03
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Refund Timeline & Method
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              Approved refunds are credited directly to your original payment method (UPI, Net Banking, Credit/Debit card) within <strong className="text-[#172b26] dark:text-white font-semibold">3–5 business days</strong> following returned item inspection.
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

export default RefundPolicyPage;
