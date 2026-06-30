import React from "react";
import { FileText, Search, UserCheck, Send, ClipboardCheck, Truck } from "lucide-react";

const defaultSteps = [
  { step: "01", title: "Doctor Rx", desc: "Your treating specialist prescribes a therapy covered under a manufacturer PAP." },
  { step: "02", title: "Eligibility Check", desc: "Our caseworkers evaluate your clinical and financial details against PAP criteria." },
  { step: "03", title: "Document Review", desc: "We verify your medical reports, income certificates, and ID proofs." },
  { step: "04", title: "Apply Sourcing", desc: "We compile and submit your application docket to the respective pharma brand desk." },
  { step: "05", title: "Brand Approval", desc: "The manufacturer reviews the docket and issues the subsidized drug approval voucher." },
  { step: "06", title: "Safe Delivery", desc: "WellMeds dispenses and delivers your approved subsidized medicine under cold-chain." }
];

const icons = [FileText, Search, UserCheck, Send, ClipboardCheck, Truck];

const Timeline = ({ timelineData }) => {
  const stepsList = timelineData || defaultSteps;

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-slate-50 dark:bg-zinc-950/40">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            How the Patient Assistance Program Works
          </h2>
          <p className="text-sm text-slate-555 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            We handle the complete coordination between you, your doctor, and the manufacturer.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-md">
          {stepsList.map((step, idx) => {
            const IconComponent = icons[idx % icons.length];
            return (
              <div 
                key={idx}
                className="relative bg-white dark:bg-zinc-900/90 border border-slate-150 dark:border-zinc-800/80 rounded-2xl p-lg shadow-sm hover:shadow-md transition-all duration-300 z-10 flex flex-col items-center text-center space-y-md group"
              >
                <span className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#086b53]/10 text-[#086b53] dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-[10px] font-black">
                  STEP {step.step || step.number}
                </span>

                <div className="w-14 h-14 rounded-full bg-[#086b53]/5 border border-[#086b53]/10 text-[#086b53] dark:bg-emerald-950/20 dark:border-emerald-850/50 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <IconComponent size={24} />
                </div>

                <div className="space-y-xs">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-550 dark:text-zinc-400 leading-relaxed font-medium">
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
