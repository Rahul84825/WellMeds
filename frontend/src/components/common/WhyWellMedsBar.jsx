import React from "react";
import {
  ShieldCheck,
  Stethoscope,
  Snowflake,
  PackageCheck,
  Percent,
  Truck,
  Sparkles,
  CheckCircle2
} from "lucide-react";

/**
 * WhyWellMedsBar — Redesigned Split Layout (WellMeds Design System)
 * Soft mint gradient background, medical grid texture, glass highlights, and split layout.
 */
const WhyWellMedsBar = () => {
  const trustBullets = [
    "Licensed Specialty Pharmacy",
    "100% Genuine & Batch Traceable",
    "Cold-Chain Logistics (2°C – 8°C)",
    "24/7 Certified Pharmacist Support"
  ];

  const cards = [
    {
      id: "genuine",
      title: "100% Genuine Medicines",
      desc: "Direct manufacturer sourcing with end-to-end batch traceability.",
      icon: ShieldCheck,
    },
    {
      id: "pharmacists",
      title: "Licensed Pharmacists",
      desc: "24/7 certified clinical advice on dosage & drug interactions.",
      icon: Stethoscope,
    },
    {
      id: "coldchain",
      title: "Cold Chain Logistics",
      desc: "Insulated 2°C – 8°C transit for biologicals & GLP-1 therapy.",
      icon: Snowflake,
    },
    {
      id: "packaging",
      title: "Secure Packaging",
      desc: "Multi-layer tamper-evident thermal protective covers.",
      icon: PackageCheck,
    },
    {
      id: "savings",
      title: "Affordable Care",
      desc: "Up to 85% savings with direct manufacturer pricing.",
      icon: Percent,
    },
    {
      id: "delivery",
      title: "Fast Delivery",
      desc: "Priority dispatch with rapid local Pune & express nationwide shipping.",
      icon: Truck,
    },
  ];

  return (
    <section className="w-full py-10 md:py-14 text-left select-none">
      <div className="bg-[#f4f9f7] dark:bg-zinc-900/70 rounded-[28px] border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Medical grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#157a6d 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Soft mint glow accents */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-[#157a6d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 bg-[#b08d3e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ── LEFT SIDE: HEADER & TRUST STATS ── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
              <Sparkles size={14} className="text-[#b08d3e]" />
              <span>CLINICAL ADVANTAGE & TRUST</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight leading-tight">
              Why <span className="text-[#157a6d] dark:text-emerald-400">WellMeds</span>?
            </h2>

            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-lg">
              India’s specialty digital pharmacy committed to authentic prescription drugs, cold-chain biologicals, direct manufacturer pricing, and 24/7 clinical pharmacist supervision.
            </p>

            {/* Trust Statistics Checklist */}
            <div className="space-y-2.5 pt-2">
              {trustBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#172b26] dark:text-zinc-200">
                  <CheckCircle2 size={16} className="text-[#157a6d] dark:text-emerald-400 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT SIDE: PREMIUM FEATURE CARDS GRID ── */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-zinc-800 rounded-[20px] p-4 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#157a6d]/40 transition-all duration-300 group space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-[#157a6d] group-hover:text-white transition-colors duration-300">
                    <IconComp size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#172b26] dark:text-white group-hover:text-[#157a6d] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(WhyWellMedsBar);
