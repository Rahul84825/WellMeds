import React from "react";
import {
  ShieldCheck,
  IndianRupee,
  Truck,
  PackageCheck,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Hospital,
} from "lucide-react";

/**
 * WhyChooseWellMeds — WellMeds Design System V2
 * Clinical trust and specialty pharmacy advantage cards.
 */
const benefits = [
  {
    num: "01",
    id: "genuine",
    title: "100% Genuine Medicines",
    description: "Sourced directly from verified pharmaceutical manufacturers with full batch traceability.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    id: "pricing",
    title: "Affordable Chronic Care",
    description: "Significant savings and transparent pricing on long-term specialty and chronic treatment plans.",
    icon: IndianRupee,
  },
  {
    num: "03",
    id: "support",
    title: "Licensed Pharmacist Support",
    description: "24/7 certified pharmacists guide you on dosage, cold-chain storage, and therapeutic alternatives.",
    icon: Stethoscope,
  },
  {
    num: "04",
    id: "delivery",
    title: "Express & Cold-Chain Logistics",
    description: "Rapid local dispatch in Pune and temperature-controlled shipping across pan-India.",
    icon: Truck,
  },
  {
    num: "05",
    id: "packaging",
    title: "Tamper-Evident Packaging",
    description: "Multi-layer thermal insulated packaging for sensitive biologicals and hospital supplies.",
    icon: PackageCheck,
  },
];

const WhyChooseWellMeds = () => {
  return (
    <section className="relative py-16 md:py-20 w-full bg-white dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      <div className="home-section-container">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE WELLMEDS ADVANTAGE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
            <span>CLINICAL STANDARDS</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight mb-3">
            Why Choose WellMeds Specialty Pharmacy?
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Combining certified clinical excellence, cold-chain integrity, and compassionate patient care.
          </p>
        </div>

        {/* 5 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="group relative bg-[#f4f9f7] dark:bg-zinc-900 p-6 rounded-xl border border-[#dde8e3] dark:border-zinc-800 hover:border-[#157a6d]/50 hover:bg-white dark:hover:bg-zinc-850 hover:shadow-[0_10px_28px_rgba(23,43,38,0.06)] transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#e7f0ea] dark:bg-zinc-800 border border-[#c3d4cc] dark:border-zinc-700 flex items-center justify-center text-[#157a6d] group-hover:bg-[#157a6d] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-clinical-mono text-xs font-bold text-[#b08d3e] bg-[#fdf8ee] dark:bg-amber-950/40 border border-[#e8d2a5] px-2 py-0.5 rounded">
                      {b.num}
                    </span>
                  </div>

                  <h3 className="font-editorial text-base font-semibold text-[#172b26] dark:text-zinc-100 mb-2 group-hover:text-[#157a6d] transition-colors">
                    {b.title}
                  </h3>

                  <p className="font-sans text-xs text-[#3f544d] dark:text-zinc-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Trusted Healthcare Banner Tile */}
          <div className="group relative bg-[#157a6d] p-6 rounded-xl text-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="font-clinical-mono text-[10px] font-bold tracking-widest uppercase text-[#e7f0ea] mb-2 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5" />
                <span>SPECIALTY THERAPIES</span>
              </div>
              <h3 className="font-editorial text-lg font-semibold text-white mb-2 leading-snug">
                Trusted by 50,000+ Chronic & Specialty Patients
              </h3>
              <p className="font-sans text-xs text-white/90 leading-relaxed">
                Dedicated support for oncology, nephrology, cardiology, and rare disease treatment plans.
              </p>
            </div>
            <a
              href="/about"
              className="mt-4 inline-flex items-center gap-1.5 font-clinical-mono text-xs font-bold uppercase tracking-wider text-white hover:underline"
            >
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(WhyChooseWellMeds);