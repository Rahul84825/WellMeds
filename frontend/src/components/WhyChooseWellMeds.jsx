import {
  Hospital,
  ShieldCheck,
  IndianRupee,
  Truck,
  PackageCheck,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

const benefits = [
  {
    id: "genuine",
    title: "100% Genuine Medicines",
    description: "Sourced directly from manufacturers with full batch traceability.",
    icon: ShieldCheck,
    accent: "#038076",
  },
  {
    id: "pricing",
    title: "Affordable Pricing",
    description: "Significant savings on long-term and chronic treatment plans.",
    icon: IndianRupee,
    accent: "#004782",
  },
  {
    id: "support",
    title: "Pharmacist Support",
    description: "Licensed pharmacists guide you on dosage, storage, and alternatives.",
    icon: Stethoscope,
    accent: "#038076",
  },
  {
    id: "delivery",
    title: "Fast Delivery",
    description: "Rapid delivery across Pune and reliable shipping pan-India.",
    icon: Truck,
    accent: "#004782",
  },
  {
    id: "packaging",
    title: "Safe Packaging",
    description: "Tamper-evident, temperature-conscious packaging on every order.",
    icon: PackageCheck,
    accent: "#038076",
  },
];

const WhyChooseWellMeds = () => {
  return (
    <section className="relative py-10 md:py-12 bg-white dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#038076]/5 dark:bg-[#038076]/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative home-section-container max-w-full lg:max-w-[82%] mx-auto">
        
        {/* ── Header ── */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-block mb-2 text-[10px] font-bold tracking-widest text-[#038076] uppercase">
              The WellMeds Advantage
            </span>
            <h2 className="text-2xl md:text-[32px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004782] to-[#038076]">WellMeds</span>?
            </h2>
          </div>

          <a
            href="/about"
            className="group hidden md:inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 text-[13px] font-semibold text-slate-900 dark:text-white shadow-sm transition-all hover:shadow hover:border-[#038076]/50 shrink-0"
          >
            Learn More 
            <ArrowRight className="h-3.5 w-3.5 text-[#038076] transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* ── Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

          {/* ── Featured Hero Card (Left, Spans 5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="group relative flex-1 w-full rounded-2xl overflow-hidden p-6 md:p-7 shadow-lg transition-transform duration-500 hover:scale-[1.01]"
                 style={{ background: "radial-gradient(circle at top right, #038076 0%, #004782 100%)" }}>
              
              {/* Abstract Background Shapes */}
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#004782]/40 blur-xl" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                    <Hospital className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight text-white mb-2.5">
                    Trusted by Patients Across India
                  </h3>
                  <p className="text-[13px] leading-relaxed text-white/80">
                    Families navigating chronic illness, cancer care, and transplant
                    therapies trust WellMeds for authentic medicines with complete
                    clinical tracking.
                  </p>
                </div>

                {/* Compact Glassy Badge */}
                <div className="mt-8 flex items-center gap-3.5 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-inner">
                  <div className="flex-shrink-0">
                    <span className="text-2xl font-black text-white tracking-tighter">
                      100<span className="text-[#038076] text-xl">%</span>
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                      Genuine Meds
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      Sourced directly from manufacturers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Benefit Cards (Right, Spans 7 cols) ── */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, index) => {
              const Icon = b.icon;
              const isLast = index === benefits.length - 1;
              
              return (
                <div
                  key={b.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/80 p-5 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-zinc-900 flex flex-row items-start gap-4
                    ${isLast ? "sm:col-span-2 sm:max-w-[50%]" : ""}
                  `}
                >
                  {/* Subtle hover gradient background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${b.accent}06 0%, transparent 70%)` }}
                  />

                  {/* Icon Wrapper (Left aligned now for compactness) */}
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `${b.accent}12`,
                      color: b.accent,
                    }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10 flex-1 pt-0.5">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1 transition-colors group-hover:text-[#038076]">
                      {b.title}
                    </h4>
                    <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center md:hidden">
          <a
            href="/about"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#038076] px-5 py-3 text-[13px] font-semibold text-white shadow transition-all hover:bg-[#02665e] active:scale-95"
          >
            Learn More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseWellMeds;