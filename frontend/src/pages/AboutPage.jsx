import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import { Sparkles, Phone, FileText, ChevronRight, ShieldCheck, HeartPulse, Award, Users } from "lucide-react";

const About = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ];

  const leaders = [
    {
      name: "Dr. Elizabeth Vance, MD",
      role: "Chief Medical Officer",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      desc: "Cardiologist with 15+ years of clinical practice, supervising health quality and prescription review controls."
    },
    {
      name: "Marcus Thorne, PharmD",
      role: "Lead Pharmacist",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      desc: "Specialized in pharmacology and clinical interactions, managing our state-of-the-art dispensing systems."
    },
    {
      name: "Sanjay Patel",
      role: "Operations Director",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
      desc: "Directs logistics operations to guarantee safe transit and temperature-controlled next-day delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="About WellMeds | Precision Healthcare & Licensed Pharmacy"
        description="Learn about WellMeds specialty pharmacy mission, licensed medical leadership, cold-chain storage standards, and commitment to authentic healthcare."
        canonical="/about"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* ── HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <Link to="/" className="hover:text-[#157a6d]">Home</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">About Us</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL EXCELLENCE & TRUST</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                About WellMeds
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                India’s trusted specialty digital pharmacy committed to authentic prescription drugs, cold-chain biologicals, and expert pharmacist consultations.
              </p>
            </div>

          </div>
        </div>

        {/* ── CORE PILLARS SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#172b26] dark:text-white">100% Genuine Sourcing</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Direct partnership with licensed pharma manufacturers ensures zero counterfeit risk for every formulation.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200">
              <HeartPulse size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#172b26] dark:text-white">Cold-Chain Assurance</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Strict 2°C – 8°C temperature monitoring for insulin, biologicals, and GLP-1 medications during transit.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#172b26] dark:text-white">Pharmacist Supervision</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Every prescription undergoes rigorous dual verification by registered clinical pharmacists before dispatch.
            </p>
          </div>
        </div>

        {/* ── LEADERSHIP SECTION ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#157a6d]" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-white">
              Medical Leadership
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaders.map((leader, idx) => (
              <div key={idx} className="bg-[#f4f9f7] dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-3 text-left">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#157a6d]"
                />
                <div>
                  <h4 className="font-bold text-base text-[#172b26] dark:text-white">{leader.name}</h4>
                  <p className="text-xs font-semibold text-[#157a6d] font-clinical-mono">{leader.role}</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                  {leader.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default About;
