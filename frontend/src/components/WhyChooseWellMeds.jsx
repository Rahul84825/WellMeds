import {
  Hospital,
  ShieldCheck,
  IndianRupee,
  Truck,
  PackageCheck,
  Stethoscope,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    id: "genuine",
    title: "100% Genuine Medicines",
    description: "Sourced directly from manufacturers with full batch traceability.",
    icon: ShieldCheck,
    accent: "#038076",
    bgAccent: "bg-[#038076]/10",
  },
  {
    id: "pricing",
    title: "Affordable Pricing",
    description: "Significant savings on long-term and chronic treatment plans.",
    icon: IndianRupee,
    accent: "#004782",
    bgAccent: "bg-[#004782]/10",
  },
  {
    id: "support",
    title: "Pharmacist Support",
    description: "Licensed pharmacists guide you on dosage, storage, and alternatives.",
    icon: Stethoscope,
    accent: "#038076",
    bgAccent: "bg-[#038076]/10",
  },
  {
    id: "delivery",
    title: "Fast Delivery",
    description: "Rapid delivery across Pune and reliable shipping pan-India.",
    icon: Truck,
    accent: "#004782",
    bgAccent: "bg-[#004782]/10",
  },
  {
    id: "packaging",
    title: "Safe Packaging",
    description: "Tamper-evident, temperature-conscious packaging on every order.",
    icon: PackageCheck,
    accent: "#038076",
    bgAccent: "bg-[#038076]/10",
  },
];

const WhyChooseWellMeds = () => {
  return (
    <section className="relative py-16 md:py-24 bg-slate-50/50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#038076]/10 to-transparent dark:from-[#038076]/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Centered Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#038076]" />
            <span className="text-xs font-bold tracking-widest text-[#038076] uppercase">
              The WellMeds Advantage
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-5">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004782] to-[#038076]">WellMeds</span>?
          </h2>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Your trusted partner in health, delivering authentic medicines, professional support, and absolute clinical safety directly to your door.
          </p>
        </div>

        {/* ── Benefits Grid (3 Columns) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="group relative bg-white dark:bg-zinc-900/60 p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:border-[#038076]/30 overflow-hidden flex flex-col items-center text-center"
              >
                {/* Hover Gradient Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${b.accent}04 0%, transparent 70%)` }}
                />

                <div className={`relative z-10 w-16 h-16 mb-6 rounded-2xl ${b.bgAccent} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-7 h-7" style={{ color: b.accent }} strokeWidth={2} />
                </div>

                <h4 className="relative z-10 text-lg font-bold text-slate-900 dark:text-white mb-3 transition-colors group-hover:text-[#038076]">
                  {b.title}
                </h4>
                
                <p className="relative z-10 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Full-Width Horizontal Banner ── */}
        <div className="relative w-full rounded-[2.5rem] overflow-hidden p-8 md:p-12 shadow-2xl"
             style={{ background: "linear-gradient(135deg, #004782 0%, #038076 100%)" }}>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#004782]/40 blur-3xl rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Left Content */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 lg:max-w-2xl">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Hospital className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                  Trusted by Patients Across India
                </h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  Families navigating chronic illness, cancer care, and transplant therapies trust WellMeds for authentic medicines with complete clinical tracking and expert support.
                </p>
              </div>
            </div>

            {/* Right Content (Badge & CTA) */}
            <div className="flex flex-col sm:flex-row items-center gap-5 flex-shrink-0">
              <div className="flex items-center gap-4 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-4 shadow-inner">
                <span className="text-3xl font-black text-white tracking-tighter">
                  100<span className="text-[#038076]">%</span>
                </span>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-white">Genuine Meds</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Sourced from manufacturers</p>
                </div>
              </div>

              <a
                href="/about"
                className="group flex items-center gap-2 bg-white text-[#004782] px-6 py-4 rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn More
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseWellMeds;