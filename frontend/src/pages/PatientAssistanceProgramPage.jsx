import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import papHeroBg from "../assets/PAP/PAP_.png";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import { BUSINESS_INFO } from "../config/businessInfo";
import ConsultationModal from "../components/ConsultationModal";

import {
  Handshake,
  FileText,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  HeartPulse,
  Activity,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HeartHandshake,
  Brain,
  Stethoscope,
  Pill,
  BadgePercent,
  Zap,
  FolderCheck,
  Check,
  ArrowRight,
  Search,
  ShieldAlert,
  Dna,
  Syringe,
  FileCheck2,
  Building2,
  DollarSign
} from "lucide-react";

const PatientAssistanceProgramPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const handleApplyClick = () => {
    const el = document.getElementById("pap-contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleExpertClick = () => {
    setIsConsultationOpen(true);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const trustMetrics = [
    { stat: "Up to 100%", label: "Co-Pay Subsidy", sub: "Pharma Manufacturer Grants", icon: BadgePercent, color: "text-[#157a6d]", bg: "bg-[#f4f9f7] dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/60" },
    { stat: "5–7 Days", label: "Fast Processing", sub: "Dossier Review & Approval", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/60" },
    { stat: "100% Free", label: "Zero Fee Service", sub: "No Registration Charges", icon: HeartHandshake, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800/60" },
    { stat: "Dedicated", label: "Case Coordinator", sub: "Personal Application Manager", icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800/60" }
  ];

  const timelineSteps = [
    { step: "01", title: "Patient Applies", desc: "Submit basic details and upload prescription paperwork.", icon: FileText },
    { step: "02", title: "Document Review", desc: "Our team verifies medical reports & financial documents.", icon: FolderCheck },
    { step: "03", title: "Eligibility Audit", desc: "We evaluate eligibility against manufacturer criteria.", icon: FileCheck2 },
    { step: "04", title: "Pharma Approval", desc: "Dossier submitted to the pharma brand for subsidy approval.", icon: Building2 },
    { step: "05", title: "Cold-Chain Dispatch", desc: "Subsidized medicines dispatched under validated cold chain.", icon: HeartPulse }
  ];

  const eligibilityCards = [
    { title: "Cancer Patients", desc: "Subsidies for oncology cycles, targeted molecules, and immunotherapies.", icon: Activity, tag: "Oncology" },
    { title: "Rare Disease Patients", desc: "Support for orphan drug therapies and rare genetic disorders.", icon: Dna, tag: "Orphan Drugs" },
    { title: "Organ Transplant", desc: "Coverage for lifelong post-transplant immunosuppressant regimens.", icon: HeartPulse, tag: "Transplant" },
    { title: "Chronic Conditions", desc: "Assistance for complex autoimmune, neurological, and pulmonary diseases.", icon: Brain, tag: "Chronic Care" },
    { title: "Financial Household Need", desc: "Subsidies adjusted dynamically based on household income assessments.", icon: DollarSign, tag: "Income Grants" },
    { title: "Doctor Recommendation", desc: "Endorsement and clinical recommendation from certified medical specialists.", icon: Stethoscope, tag: "Clinical Rx" }
  ];

  const benefits = [
    { title: "Lower Medicine Cost", desc: "Up to 100% manufacturer subsidy or co-pay support on high-cost formulations.", icon: BadgePercent },
    { title: "Manufacturer Access Schemes", desc: "Direct access to patient access schemes run by top global pharma brands.", icon: Building2 },
    { title: "Dedicated Case Coordinator", desc: "Personal coordinator managing your approvals and application dossiers.", icon: UserCheck },
    { title: "Fast 5-7 Day Turnaround", desc: "Verification and brand approval coordination completed within 5-7 business days.", icon: Zap },
    { title: "Financial Guidance & Trust Grants", desc: "Expert guidance on medical trust sponsorships and alternate crowdfunding support.", icon: HeartHandshake }
  ];

  const specialities = [
    { name: "Oncology & Chemotherapy", desc: "Targeted cancer therapies, immunotherapies & monoclonal antibodies.", icon: Activity, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200" },
    { name: "Hepatology & Liver Care", desc: "Antiviral treatments and critical liver care regimens.", icon: Pill, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200" },
    { name: "HIV & Specialty Antivirals", desc: "Subsidized antiretroviral therapy access.", icon: ShieldCheck, color: "text-[#157a6d] bg-[#f4f9f7] dark:bg-emerald-950/40 border-emerald-200" },
    { name: "Neurology & MS", desc: "Multiple Sclerosis and complex neurological biologics.", icon: Brain, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
    { name: "Cardiology", desc: "Advanced cardiovascular and anti-thrombotic formulations.", icon: HeartPulse, color: "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200" },
    { name: "Rare Diseases", desc: "Orphan drugs for metabolic and genetic conditions.", icon: Dna, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200" },
    { name: "Immunology & Rheumatology", desc: "Biologic therapies for severe rheumatoid arthritis & psoriasis.", icon: Syringe, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200" },
    { name: "Organ Transplant", desc: "Immunosuppressants for kidney, liver, and heart transplants.", icon: HeartHandshake, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
    { name: "Endocrinology & GLP-1", desc: "Subsidized insulin analogs and obesity care GLP-1 injections.", icon: Activity, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200" },
    { name: "Autoimmune Disorders", desc: "Targeted disease-modifying antirheumatic drugs (DMARDs).", icon: ShieldAlert, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200" }
  ];

  const documents = [
    { title: "Specialist Prescription", desc: "Original prescription from a registered medical specialist.", icon: FileText },
    { title: "Doctor Recommendation", desc: "Clinical recommendation letter detailing treatment necessity.", icon: Stethoscope },
    { title: "Patient ID Proof", desc: "Aadhaar card, Passport, or PAN card of the patient.", icon: Award },
    { title: "Income Proof Documents", desc: "Latest tax returns, salary slips, or government income certificates.", icon: FileSpreadsheet },
    { title: "Medical Diagnostic Records", desc: "Biopsy reports, diagnostic scans, and hospital discharge summaries.", icon: FolderCheck }
  ];

  const faqs = [
    {
      q: "What is a Patient Assistance Program (PAP)?",
      a: "Patient Assistance Programs are access programs sponsored by top pharmaceutical manufacturers (like Roche, Novartis, Pfizer, and AstraZeneca). They are designed to help patients obtain high-cost specialty therapies (especially for oncology, transplants, and rare diseases) at highly subsidized or free-of-cost rates."
    },
    {
      q: "How do I qualify for financial assistance?",
      a: "Eligibility is determined by a combination of clinical criteria (having a valid specialist prescription for a covered drug) and financial criteria (verifying that the household cannot afford full retail pricing). Each manufacturer program sets its specific guidelines."
    },
    {
      q: "Is there a fee to apply for PAP through WellMeds?",
      a: "No. WellMeds facilitates the application, verification, manufacturer coordination, and drug dispensing completely free of charge. There are no registration or coordination fees."
    },
    {
      q: "What pharma brands sponsor these access programs?",
      a: "Most major global and domestic pharma manufacturers sponsor PAPs for high-cost critical care medicines. These include Roche, AstraZeneca, Novartis, MSD, Pfizer, and others."
    },
    {
      q: "How long does the approval process take?",
      a: "Once you submit all required clinical and financial documents to our support desk, the review and manufacturer approval cycle typically takes 5 to 7 business days."
    }
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Patient Assistance Program", url: "/patient-assistance-program" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Patient Assistance Program (PAP) | WellMeds Subsidized Healthcare"
        description="Access manufacturer-backed subsidies, co-pay support, and dedicated case manager assistance for high-cost specialty therapies through WellMeds."
        canonical="/patient-assistance-program"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── 1. HERO SECTION ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 md:p-12 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#b08d3e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3.5 py-1.5 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>THERAPY CO-PAY SUPPORT</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
                Patient Assistance Program (PAP)
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
                Helping patients access high-cost specialty therapies at affordable prices. Get guided support through corporate co-payment subsidies, manufacturer assistance schemes, and dedicated clinical pharmacist coordinators.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleExpertClick}
                  className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer"
                >
                  <Phone size={16} />
                  <span>Talk to a Pharmacist</span>
                </button>
              </div>
            </div>

            {/* Premium Right Illustration Badge */}
            <div className="flex-shrink-0 relative">
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[#f4f9f7] dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-lg relative">
                <div className="absolute inset-2 rounded-full border border-dashed border-[#157a6d]/30 dark:border-emerald-500/30 animate-[spin_30s_linear_infinite]" />
                <Handshake size={68} className="relative z-10 text-[#157a6d] dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TRUST METRICS GRID ── */}
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

        {/* ── 3. WHY PATIENT ASSISTANCE (ELIGIBILITY CRITERIA) ── */}
        <div className="space-y-6 text-left" id="pap-eligibility">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              PATIENT CRITERIA
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              Who Can Apply for Assistance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Our access program supports patients meeting any of the clinical or financial criteria below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibilityCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <IconComponent size={22} />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#172b26] dark:text-white truncate">
                        {card.title}
                      </h3>
                      <span className="bg-[#f4f9f7] text-[#157a6d] font-clinical-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. HOW IT WORKS TIMELINE (5 STAGES) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6" id="pap-how-it-works">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              APPLICATION TIMELINE
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              How PAP Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              A simple 5-step assistance path for manufacturer co-pay approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
            {timelineSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#f4f9f7]/70 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 text-left space-y-3 relative flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-clinical-mono text-xs font-bold text-[#157a6d] bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                      Step {step.step}
                    </span>
                    <StepIcon size={20} className="text-[#157a6d]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#172b26] dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. PROGRAM BENEFITS GRID ── */}
        <div className="space-y-6 text-left" id="pap-programs">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              ADDED VALUE
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              Program Benefits
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Experience stress-free, fully audited clinical assistance support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const BenefitIcon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center">
                    <BenefitIcon size={24} />
                  </div>
                  <h3 className="font-bold text-base text-[#172b26] dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. SUPPORTED SPECIALITIES GRID (10 CARDS) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              COVERED THERAPIES
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              Supported Medical Specialities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              We coordinate manufacturer co-pay assistance for critical formulations across 10 specialized therapeutic areas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            {specialities.map((spec, idx) => {
              const SpecIcon = spec.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#f4f9f7]/50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/80 space-y-2 transition-all hover:bg-white hover:shadow-xs"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${spec.color}`}>
                    <SpecIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#172b26] dark:text-white leading-snug">
                      {spec.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-tight font-sans">
                      {spec.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 7. REQUIRED DOCUMENT CHECKLIST (5 CARDS) ── */}
        <div className="space-y-6 text-left" id="pap-enrollment">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] uppercase tracking-widest">
              PREPARATION CHECKLIST
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              Required Documents
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Keep these clinical and identity documents ready for file verification and manufacturer approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {documents.map((doc, idx) => {
              const DocIcon = doc.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3 text-left hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#157a6d] border border-teal-200 flex items-center justify-center">
                    <DocIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#172b26] dark:text-white">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed font-sans">
                      {doc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 8. APPLICATION & SUPPORT HUB (#pap-contact) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6 relative overflow-hidden" id="pap-contact">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <span className="font-clinical-mono text-xs font-bold text-[#157a6d] bg-[#f4f9f7] border border-emerald-200 px-3 py-1 rounded-full uppercase">
              SUPPORT DESK
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#172b26] dark:text-white">
              Start Your PAP Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Connect with our dedicated co-pay assistance managers to submit files for manufacturer evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            <div className="p-5 rounded-2xl bg-[#f4f9f7] dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
              <Mail size={22} className="text-[#157a6d]" />
              <h4 className="font-bold text-xs text-[#172b26] dark:text-white">Email Inquiries</h4>
              <p className="text-xs font-mono font-bold text-[#157a6d] dark:text-emerald-400">pap@wellmeds.in</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Response within 2 hours</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f9f7] dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
              <Phone size={22} className="text-[#157a6d]" />
              <h4 className="font-bold text-xs text-[#172b26] dark:text-white">Phone Support</h4>
              <p className="text-xs font-mono font-bold text-[#172b26] dark:text-white">{BUSINESS_INFO.phoneDisplay}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">{BUSINESS_INFO.hoursDisplay}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f9f7] dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
              <MessageSquare size={22} className="text-[#25D366]" />
              <h4 className="font-bold text-xs text-[#172b26] dark:text-white">WhatsApp Direct</h4>
              <a href={BUSINESS_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-[#25D366] hover:underline block">{BUSINESS_INFO.phoneDisplay}</a>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Instant Chat & Files</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <a
              href="https://wa.me/917798795353"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-7 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Us</span>
            </a>
            <a
              href="mailto:pap@wellmeds.in"
              className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-7 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2"
            >
              <Mail size={16} />
              <span>Email Support</span>
            </a>
            <a
              href="tel:+917798795353"
              className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 px-7 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-zinc-700 flex items-center gap-2"
            >
              <Phone size={16} />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

        {/* ── 9. REUSABLE WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />

        {/* ── 10. INTERACTIVE FAQ ACCORDIONS (PHASE 13) ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm text-left space-y-6" id="pap-faqs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Common queries regarding Patient Assistance Program guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
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
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#157a6d] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans animate-[fade-in_0.2s_ease-out]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 11. BOTTOM CALL-TO-ACTION SECTION (PHASE 14) ── */}
        <div className="bg-gradient-to-r from-[#157a6d] to-[#0f5c52] rounded-[28px] p-8 sm:p-12 text-white text-center space-y-6 shadow-md relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight">
              We'll Help You Access the Treatment You Need
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Connect with our clinical case managers to verify eligibility for high-cost therapy subsidies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText size={16} />
              <span>Apply for Assistance</span>
            </button>

            <Link
              to="/products"
              className="w-full sm:w-auto border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span>Browse Medicines</span>
            </Link>
          </div>

          <p className="text-[11px] text-emerald-200/70 pt-1">
            Zero coordination fees. Fully compliant with pharmaceutical access guidelines.
          </p>
        </div>

      </div>

      {/* ── 12. CONSULTATION MODAL INTEGRATION (PHASE 12) ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default PatientAssistanceProgramPage;
