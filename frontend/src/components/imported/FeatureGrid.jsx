import React from "react";
import { ShieldAlert, Cpu, Thermometer, FileSpreadsheet, Hourglass, HeartHandshake } from "lucide-react";

const defaultFeatures = [
  { title: "100% Genuine Medicines", desc: "Every imported medication is sourced through fully licensed channels, complete with batch certificates." },
  { title: "Direct Sourcing Channels", desc: "We bypass multi-tiered distributor layers to procure products directly from global WHO-GMP manufacturers." },
  { title: "Validated Cold Chain", desc: "Equipped with real-time temperature logs and specialized insulation boxes to preserve potency." },
  { title: "Customs & Documentation", desc: "Our compliance desk guides you through the necessary import licensing, customs clearances, and filings." },
  { title: "Expedited Lead Times", desc: "Leveraging cargo logistics pathways to import and deliver rare treatments in the shortest possible timeframe." },
  { title: "Dedicated Pharmacist", desc: "A certified clinical case pharmacist is assigned to monitor your procurement cycle." }
];

const icons = [ShieldAlert, Cpu, Thermometer, FileSpreadsheet, Hourglass, HeartHandshake];

const FeatureGrid = ({ featuresData }) => {
  const list = featuresData || defaultFeatures;

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            Why Choose WellMeds for Global Procurement
          </h2>
          <p className="text-sm text-slate-550 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            We operate under strict regulatory compliance to bring you genuine therapies securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {list.map((item, idx) => {
            const IconComp = icons[idx % icons.length];
            return (
              <div 
                key={idx}
                className="bg-slate-50/85 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-800/80 p-xl rounded-2xl text-left space-y-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#004782]/5 border border-[#004782]/10 text-[#004782] dark:bg-blue-950/20 dark:border-blue-800/50 dark:text-blue-400 flex items-center justify-center">
                  <IconComp size={22} />
                </div>
                <div className="space-y-xs">
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-zinc-400 leading-relaxed font-medium">
                    {item.desc}
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

export default FeatureGrid;
