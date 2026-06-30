import React from "react";
import { FileEdit, ClipboardCheck, Globe2, ShieldAlert, Truck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Submit Request",
    desc: "Provide medicine name, prescription sheet, and contact details via our secure form.",
    icon: FileEdit
  },
  {
    number: "02",
    title: "Clinical Check",
    desc: "Our registered pharmacists verify the prescription and determine importing guidelines.",
    icon: ClipboardCheck
  },
  {
    number: "03",
    title: "Global Sourcing",
    desc: "We coordinate with authorized global manufacturers to procure the medicine.",
    icon: Globe2
  },
  {
    number: "04",
    title: "Quality Audit",
    desc: "Every batch is inspected for authenticity, packaging integrity, and temperature logs.",
    icon: ShieldAlert
  },
  {
    number: "05",
    title: "Express Delivery",
    desc: "Direct delivery to your doorstep using validated cold-chain temperature bags.",
    icon: Truck
  }
];

const Timeline = () => {
  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-slate-50 dark:bg-zinc-950/40">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            How Global Medicine Procurement Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            Our step-by-step compliant import process ensures you receive verified therapies safely.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-lg lg:gap-sm">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-slate-200 dark:border-zinc-800 -translate-y-[60px] hidden lg:block z-0" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={idx}
                className="relative flex-1 bg-white dark:bg-zinc-900/90 border border-slate-150 dark:border-zinc-800/80 rounded-2xl p-lg shadow-sm hover:shadow-md transition-all duration-300 z-10 flex flex-col items-center text-center space-y-md group"
              >
                {/* Step Number Badge */}
                <span className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#004782]/10 text-[#004782] dark:bg-[#a4c9ff]/10 dark:text-[#a4c9ff] rounded-full text-[10px] font-black">
                  STEP {step.number}
                </span>

                {/* Icon circle */}
                <div className="w-14 h-14 rounded-full bg-[#038076]/5 border border-[#038076]/10 text-[#038076] dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <IconComponent size={24} />
                </div>

                {/* Text */}
                <div className="space-y-xs">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-550 dark:text-zinc-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
