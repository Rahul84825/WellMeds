import React from "react";
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
    <section className="py-10 md:py-14 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight
                           text-[#1D2B5C] dark:text-zinc-100">
              Why Choose{" "}
              <span className="text-[#038076]">WellMeds</span>?
            </h2>
          </div>

          {/* CTA pill */}
          <a
            href="/about"
            className="hidden md:inline-flex items-center gap-2 self-end
                       rounded-full border border-[#038076] px-4 py-2
                       text-[13px] font-semibold text-[#038076]
                       transition-all hover:bg-[#038076] hover:text-white shrink-0"
          >
            Learn More <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

          {/* ── Featured card (left) ── */}
          <div className="md:col-span-4 lg:col-span-4">
            <div
              className="relative flex h-full min-h-[260px] flex-col justify-between
                         overflow-hidden rounded-2xl p-6 md:p-7"
              style={{
                background: "linear-gradient(135deg, #004782 0%, #038076 100%)",
              }}
            >
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40
                              rounded-full bg-white/8 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32
                              rounded-full bg-white/6 blur-xl" />

              {/* Icon */}
              <div className="relative z-10 mb-4 flex h-11 w-11 items-center
                              justify-center rounded-xl bg-white/15
                              border border-white/20 backdrop-blur-sm">
                <Hospital className="h-5 w-5 text-white" />
              </div>

              {/* Text */}
              <div className="relative z-10 space-y-2">
                <h3 className="text-[18px] font-extrabold leading-tight text-white
                               sm:text-[20px]">
                  Trusted by Patients Across India
                </h3>
                <p className="text-[12px] leading-relaxed text-white/75">
                  Families navigating chronic illness, cancer care, and transplant
                  therapies trust WellMeds for authentic medicines with complete
                  clinical tracking.
                </p>
              </div>

              {/* Badge */}
              <div className="relative z-10 mt-5 flex items-center gap-3 rounded-xl
                              border border-white/15 bg-white/10 p-3.5
                              backdrop-blur-md">
                <span className="text-[22px] font-extrabold text-white tracking-tight">
                  100%
                </span>
                <div className="h-7 w-px bg-white/25" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Genuine Meds
                  </p>
                  <p className="text-[11px] text-white/70">
                    Sourced directly from manufacturers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Benefit cards (right) ── */}
          <div className="md:col-span-8 lg:col-span-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className="group flex flex-col gap-3 rounded-xl border
                               border-slate-100 bg-slate-50/60 p-4
                               transition-all duration-200
                               hover:-translate-y-1
                               hover:border-[#038076]/25
                               hover:bg-white
                               hover:shadow-[0_6px_20px_rgba(3,128,118,0.10)]
                               dark:border-zinc-800 dark:bg-zinc-900
                               dark:hover:border-[#038076]/40"
                  >
                    {/* Icon */}
                    <div
                      className="flex h-9 w-9 items-center justify-center
                                 rounded-xl transition-transform duration-200
                                 group-hover:scale-105"
                      style={{
                        background: `${b.accent}14`,
                        color: b.accent,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Text */}
                    <div>
                      <h4
                        className="text-[13px] font-bold leading-snug text-[#1D2B5C]
                                   transition-colors group-hover:text-[#038076]
                                   dark:text-zinc-100"
                      >
                        {b.title}
                      </h4>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-500
                                    dark:text-zinc-400">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center md:hidden">
          <a
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border
                       border-[#038076] px-5 py-2.5 text-[13px] font-semibold
                       text-[#038076] transition-all hover:bg-[#038076] hover:text-white"
          >
            Learn More <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseWellMeds;