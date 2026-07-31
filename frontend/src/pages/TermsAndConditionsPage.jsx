import React from "react";
import SEO from "../components/common/SEO";
import { FileText, ShieldAlert, Pill, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const TermsAndConditionsPage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Terms & Conditions", url: "/terms-and-conditions" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title="Terms & Conditions | Legal Pharmacy Terms"
        description="Review WellMeds terms of service for online medication orders, prescription requirements under Drugs and Cosmetics Rules, patient obligations, and service policies."
        canonical="/terms-and-conditions"
        breadcrumbs={breadcrumbs}
      />

      {/* Header */}
      <section className="bg-[#172b26] text-white py-14 px-4 border-b border-[#26453d]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#203a34] text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-[#2e5249]">
            <FileText className="w-3.5 h-3.5" />
            <span>Pharmacy Act 1948 & Information Technology Act Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
            Terms & Conditions of Service
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Please read these legal terms carefully before placing orders for prescription medicines, surgical supplies, or wellness products on WellMeds.
          </p>
          <div className="mt-4 text-xs font-mono text-slate-400">
            Effective Date: July 2026
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Pill className="w-5 h-5 shrink-0" />
              <h2>1. Prescription Requirement (Schedule H & H1 Drugs)</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              In accordance with the Drugs and Cosmetics Act 1940 and Rules framed thereunder, prescription-only medicines (Schedule H, H1, and Schedule X) will strictly be dispensed only upon submission and clinical verification of a valid written prescription issued by a registered medical practitioner (RMP).
            </p>
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Orders for Schedule H/H1 medications lacking a valid RMP prescription will be flagged and cancelled automatically by our pharmacist desk.</span>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <FileText className="w-5 h-5 shrink-0" />
              <h2>2. Ordering, Pricing & Cold-Chain Storage</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              All prices listed on WellMeds are inclusive of GST. Products are stored in climate-controlled, temperature-monitored facilities adhering to WHO GDP (Good Distribution Practice) guidelines. We reserve the right to revise prices or update product specifications as notified by pharmaceutical manufacturers.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h2>3. Medical Disclaimer</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              The health information, molecule descriptions, and clinical guidance provided on WellMeds are intended strictly for educational purposes and do not constitute medical diagnosis or replace professional consultation with a qualified doctor.
            </p>
          </section>

          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Governing Jurisdiction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              These terms are governed by the laws of India. Any legal disputes arising out of the use of WellMeds platforms are subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default TermsAndConditionsPage;
