import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS_INFO } from "../config/businessInfo";
import {
  ShieldCheck,
  CheckCircle2,
  Snowflake,
  Thermometer,
  UserCheck,
  Award,
  Lock,
  PackageCheck,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  FileText,
  Search,
  Truck,
  HeartHandshake,
  HelpCircle,
  QrCode,
  Shield,
  Check,
  ExternalLink
} from "lucide-react";

import SEO from "../components/common/SEO";

const HowWeKeepYouSafePage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "How We Keep You Safe", url: "/how-we-keep-you-safe" },
  ];

  // Accordion state for FAQ section
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const trustMetrics = [
    {
      label: "Direct Sourcing",
      stat: "100%",
      sub: "Manufacturer Verified",
      icon: CheckCircle2,
      color: "text-[#157a6d]",
      bg: "bg-[#f4f9f7] dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/60"
    },
    {
      label: "Cold-Chain Integrity",
      stat: "2–8°C",
      sub: "Temp Monitored 24/7",
      icon: Snowflake,
      color: "text-sky-600",
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-200 dark:border-sky-800/60"
    },
    {
      label: "Rx Verification",
      stat: "100%",
      sub: "Licensed Pharmacists",
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800/60"
    },
    {
      label: "Emergency Support",
      stat: "24/7",
      sub: "Direct Clinical Help",
      icon: Phone,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800/60"
    }
  ];

  const safetySteps = [
    { num: "01", title: "Rx Upload", desc: "Patient uploads prescription securely.", icon: FileText },
    { num: "02", title: "Pharmacist Audit", desc: "Pharmacist verifies dosage & interactions.", icon: UserCheck },
    { num: "03", title: "Source Check", desc: "Batch & QR code verified against database.", icon: QrCode },
    { num: "04", title: "Clean Packing", desc: "Sealed in clean room under strict protocol.", icon: PackageCheck },
    { num: "05", title: "Cold Lock", desc: "Insulated 2-8°C ice-gel packs inserted.", icon: Snowflake },
    { num: "06", title: "Sealed Dispatch", desc: "Tamper-evident security seal applied.", icon: Lock },
    { num: "07", title: "Safe Delivery", desc: "Hand-delivered directly to customer.", icon: Truck }
  ];

  const faqs = [
    {
      question: "How do you verify medicine authenticity?",
      answer: "Every single medicine strip and vial is sourced directly from CDSCO-registered manufacturers and authorized primary distributors. We do not operate with unverified third-party vendors. Additionally, you can scan the batch QR code on your product box to verify manufacturer authenticity instantly."
    },
    {
      question: "How does 2–8°C cold-chain shipping work for insulin & GLP-1 injections?",
      answer: "Temperature-sensitive biologics, insulins, and GLP-1 injections are stored in calibrated 2–8°C cold rooms. During dispatch, they are packaged in specialized thermo-insulated boxes with food-grade gel ice packs capable of holding exact temperature control for up to 48 hours during express transit."
    },
    {
      question: "Can I speak directly with a licensed pharmacist before ordering?",
      answer: "Yes, absolutely! Our clinical pharmacy team is available 24/7. You can connect with a licensed pharmacist via WhatsApp or Phone to ask about dosage, drug-to-drug interactions, storage guidelines, or prescription verification."
    },
    {
      question: "Is my medical data and prescription kept private?",
      answer: "Your health records, prescription uploads, and clinical details are stored in HIPAA & CDSCO compliant 256-bit encrypted servers. We never sell, rent, or share patient medical data with third-party marketing agencies."
    },
    {
      question: "What happens if a medicine arrives damaged or warm?",
      answer: "If your cold-chain shipment arrives without adequate cooling or if packaging shows signs of damage, contact our emergency line immediately. We provide free instant replacement dispatch or 100% full refund with zero questions asked."
    }
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="How We Keep You Safe | WellMeds Safety Standards"
        description="Discover WellMeds clinical safety standards: 2–8°C cold-chain shipping, CDSCO compliance, manufacturer QR tracking, and licensed pharmacist prescription verification."
        canonical="/how-we-keep-you-safe"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── 1. HERO SECTION ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 md:p-12 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#b08d3e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3.5 py-1.5 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL SAFETY STANDARDS</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
                How We Keep You Safe
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
                Every medicine delivered with authenticity, safety, privacy, and clinical care. At <span className="font-bold text-[#157a6d] dark:text-emerald-400">WellMeds</span>, you're not just ordering a product — you're trusting us with life-saving therapies. We built our entire process around that responsibility.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Us</span>
                </a>
                <Link
                  to="/upload-prescription"
                  className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-zinc-700 flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>Upload Prescription</span>
                </Link>
              </div>
            </div>

            {/* Glowing Hero Icon Badge */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-lg relative">
                <div className="absolute inset-2 rounded-full border border-dashed border-[#157a6d]/30 dark:border-emerald-500/30 animate-[spin_25s_linear_infinite]" />
                <ShieldCheck size={72} className="relative z-10 text-[#157a6d] dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TRUST METRICS GRID (STEP 9) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustMetrics.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-5 shadow-sm text-left space-y-3 transition-transform hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.border} border flex items-center justify-center ${item.color}`}>
                  <IconComp size={20} />
                </div>
                <div>
                  <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#172b26] dark:text-white">
                    {item.stat}
                  </p>
                  <p className="font-bold text-xs text-[#172b26] dark:text-zinc-200 mt-0.5">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 3. SAFETY PILLARS GRID (STEPS 4 & 5) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

          {/* Pillar 1: Verified Sourcing */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
              1. Every Medicine Verified at the Source
            </h3>
            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              We source directly from licensed CDSCO manufacturers and authorized primary distributors — never from gray markets or unverified sellers.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span>Every batch is cross-checked against manufacturer databases prior to storage.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span>No medicine leaves our facility without a double-verified batch and expiry audit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span className="font-bold text-[#172b26] dark:text-zinc-100">Scan QR codes on boxes to verify manufacturer authenticity.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Cold-Chain Protection */}
          <div className="bg-sky-50/60 dark:bg-sky-950/20 rounded-[28px] border border-sky-200 dark:border-sky-900/50 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 border border-sky-200 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Snowflake size={24} className="animate-pulse" />
              </div>
              <span className="bg-sky-200/80 dark:bg-sky-900/80 text-sky-800 dark:text-sky-300 font-clinical-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-300">
                CRITICAL CARE 2–8°C
              </span>
            </div>
            <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
              2. Certified 2–8°C Cold-Chain Protection
            </h3>
            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Insulin, biologics, and GLP-1 injections lose efficacy if exposed to improper temperatures, even briefly. We guarantee exact thermal stability.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2 border-t border-sky-200/50 dark:border-sky-900/50">
              <li className="flex items-start gap-2.5">
                <Thermometer size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <span className="font-bold text-slate-800 dark:text-zinc-200">Maintained strictly at 2–8°C from warehouse to your doorstep.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Thermometer size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <span>Shipped in insulated thermo-boxes with food-grade gel ice packs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Thermometer size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <span>Real-time temperature logging throughout express transit.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Pharmacist Prescription Verification */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
              3. Checked by a Licensed Clinical Pharmacist
            </h3>
            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              We do not accept automated uploads blindly. A certified pharmacist audits every prescription-only order before dispatch.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span>Verifies prescription validity, physician stamp, and exact dosage match.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span>Flags potential drug-to-drug interactions or contraindications.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#157a6d] shrink-0 mt-0.5" />
                <span className="font-bold text-[#172b26] dark:text-zinc-100">Directly reachable for dosage or administration queries.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: CDSCO Licensing & Compliance */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-[28px] border border-amber-200 dark:border-amber-900/50 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Award size={24} />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
                4. Licensed & Compliant Pharmacy Setup
              </h3>
              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                WellMeds operates under official state retail pharmacy licensing regulations and follows all rules under the Drugs & Cosmetics Act.
              </p>
            </div>

            {/* License Stamp Card */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-950/80 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3.5 mt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 shrink-0">
                <Award size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                  Official License Verification
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-mono font-medium">
                  License No: DL-12345/A-B & DL-67890/C-D
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    CDSCO Active & Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 5: Packaging & Security */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-600 flex items-center justify-center">
              <PackageCheck size={24} />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
              5. Packaging Built for Care & Privacy
            </h3>
            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Every shipment is prepared under clean room protocols, keeping medicine integrity and patient confidentiality intact.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#f4f9f7]/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                <ShieldAlert size={18} className="text-[#157a6d] mb-1" />
                <h4 className="text-xs font-bold text-[#172b26] dark:text-zinc-200">Tamper-Evident</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Security seals prevent transit tampering.</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#f4f9f7]/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                <UserCheck size={18} className="text-[#157a6d] mb-1" />
                <h4 className="text-xs font-bold text-[#172b26] dark:text-zinc-200">Safe Agents</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Certified medical dispatch agents.</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#f4f9f7]/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                <Lock size={18} className="text-[#157a6d] mb-1" />
                <h4 className="text-xs font-bold text-[#172b26] dark:text-zinc-200">Discreet Box</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Unmarked exterior for privacy.</p>
              </div>
            </div>
          </div>

          {/* Pillar 6: Data Privacy */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-[#157a6d] flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-[#172b26] dark:text-white">
                6. Encrypted Patient Health Data Privacy
              </h3>
              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Your medical prescriptions and clinical data are used strictly for order fulfillment and pharmacy care. We never sell or share patient records with third-party advertisers.
              </p>
            </div>
            <div className="mt-4 p-3 rounded-2xl bg-[#f4f9f7] dark:bg-zinc-800/60 text-xs text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-center font-medium">
              🔒 256-bit SSL encrypted healthcare database compliance.
            </div>
          </div>

        </div>

        {/* ── 4. VISUAL 7-STAGE MEDICINE SAFETY TIMELINE (STEP 8) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              END-TO-END VERIFICATION
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              7-Stage Medicine Safety Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              How every order passes through rigorous clinical checkpoints before reaching your hands.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 pt-4">
            {safetySteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#f4f9f7]/70 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 text-center space-y-2 relative flex flex-col items-center justify-between"
                >
                  <span className="font-clinical-mono text-[10px] font-bold text-[#157a6d] bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-[#157a6d] border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                    <StepIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-[#172b26] dark:text-white leading-tight">
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. INTERACTIVE FAQ ACCORDIONS (STEP 10) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                Frequently Asked Safety Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Clear answers regarding cold-chain protocols, verification, and patient privacy.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 bg-[#f4f9f7]/50 dark:bg-zinc-800/40 hover:bg-[#f4f9f7] dark:hover:bg-zinc-800/80 text-left flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base text-[#172b26] dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#157a6d] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans animate-[fade-in_0.2s_ease-out]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. BOTTOM CALL-TO-ACTION SECTION (STEP 11) ── */}
        <div className="bg-gradient-to-r from-[#157a6d] to-[#0f5c52] rounded-[28px] p-8 sm:p-12 text-white text-center space-y-6 shadow-md relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight">
              Need Help Choosing the Right Medicine?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Every order is backed by certified clinical pharmacists available 24/7 to answer dosage, storage, or prescription verification questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Us</span>
            </a>

            <Link
              to="/upload-prescription"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#172b26] px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              <span>Upload Prescription</span>
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span>Browse Medicines</span>
            </Link>
          </div>

          <p className="text-[11px] text-emerald-200/70 pt-1">
            Have a question about our cold-chain shipping or CDSCO license? Reach out anytime.
          </p>
        </div>

      </div>
    </div>
  );
};

export default HowWeKeepYouSafePage;
