import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  Phone,
  Sparkles,
  ChevronRight,
  Server,
  UserCheck
} from "lucide-react";

const PrivacyPolicyPage = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans text-on-surface transition-colors duration-300 pb-16 select-none">
      <SEO
        title="Privacy Policy | Data Protection & Patient Security"
        description="WellMeds is committed to protecting your personal healthcare data, medical records, and payment information in full compliance with Indian DPDP laws and global standards."
        canonical="/privacy-policy"
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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
            <Lock size={14} className="text-[#b08d3e]" />
            <span>DPDP ACT 2023 & HIPAA COMPLIANT DATA GOVERNANCE</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight max-w-3xl">
            Privacy Policy & <span className="text-[#157a6d] dark:text-emerald-400">Data Protection</span>
          </h1>

          <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Your clinical trust is our highest priority. Learn how WellMeds collects, encrypts, and safeguards your medical prescriptions, patient records, and personal health identifiers.
          </p>

          <div className="pt-2 text-xs font-clinical-mono text-slate-500 dark:text-zinc-400 font-semibold">
            Last Updated: July 2026 | Effective Version 2.4
          </div>
        </div>
      </section>

      {/* ── 2. MAIN POLICY CARDS CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        
        {/* Key Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">256-Bit SSL Encryption</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              All prescription uploads and payment transactions are protected by bank-level SSL encryption end-to-end.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Strict Clinical Confidentiality</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              Medical records are restricted strictly to licensed pharmacists verifying dosage and dispensing requirements.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-[24px] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Server size={20} />
            </div>
            <h3 className="font-bold text-base text-[#172b26] dark:text-white">Zero Data Monetization</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
              We never sell, rent, or commercialize your personal health history to third-party ad networks or brokers.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 sm:p-10 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                01
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Information We Collect & Process
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              WellMeds operates as a licensed digital specialty pharmacy under the Pharmacy Act 1948 and Drugs and Cosmetics Rules of India. To verify prescriptions and safely dispatch medications, we collect:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Personal Identifiers</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Name, phone number, delivery address, and email for fulfillment and tracking.</p>
              </div>
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Prescription Records</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Uploaded Rx slips, prescriber details, and dosage instructions for Schedule H/H1 compliance.</p>
              </div>
              <div className="p-4 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <h3 className="font-bold text-xs text-[#172b26] dark:text-white uppercase tracking-wider">Technical Telemetry</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">Encrypted session identifiers and IP addresses for anti-fraud & security monitoring.</p>
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
                How We Safeguard Your Prescription Records
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              Your prescription images and health information are restricted strictly to registered pharmacists for clinical verification. We enforce end-to-end 256-bit SSL encryption during transit and encrypted storage at rest.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#157a6d] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#172b26] dark:text-white uppercase tracking-wider">No Commercial Data Trading</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-sans">We never sell or exchange patient prescription histories to external advertisers.</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#157a6d] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#172b26] dark:text-white uppercase tracking-wider">Statutory Audit Logs</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-sans">Dispensary logs are stored securely to comply with state drug administration audit laws.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center font-clinical-mono font-bold text-sm">
                03
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#172b26] dark:text-white">
                Patient Rights & DPDP Rights (2023)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              Under the Digital Personal Data Protection (DPDP) Act 2023, you retain full ownership of your personal health data. You may request access to, correction of, or deletion of your non-statutory records by contacting our Data Protection Officer.
            </p>
          </section>

          {/* Contact DPO Card */}
          <section className="bg-[#f4f9f7] dark:bg-zinc-800/60 p-6 rounded-[24px] border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-[#172b26] dark:text-white font-bold text-base">
              <Phone size={18} className="text-[#157a6d] dark:text-emerald-400" />
              <h3>Data Protection Officer Contact</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
              For privacy inquiries, data deletion requests, or compliance feedback, contact our dedicated officer:
              <br />
              <strong className="text-[#172b26] dark:text-white font-semibold">WellMeds Privacy & Compliance Office</strong> — Baner, Pune, Maharashtra 411045.
              <br />
              Email: <a href="mailto:privacy@wellmeds.in" className="text-[#157a6d] dark:text-emerald-400 font-bold underline">privacy@wellmeds.in</a> | Phone: +91-800-WELLMEDS
            </p>
          </section>

          {/* Policy Links */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs font-semibold text-[#157a6d] dark:text-emerald-400">
            <Link to="/terms-and-conditions" className="hover:underline flex items-center gap-1">
              <span>Terms & Conditions</span>
              <ChevronRight size={12} />
            </Link>
            <Link to="/refund-policy" className="hover:underline flex items-center gap-1">
              <span>Refund Policy</span>
              <ChevronRight size={12} />
            </Link>
            <Link to="/shipping-policy" className="hover:underline flex items-center gap-1">
              <span>Shipping Policy</span>
              <ChevronRight size={12} />
            </Link>
          </div>
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

export default PrivacyPolicyPage;
