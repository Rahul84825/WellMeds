import React from "react";
import { Gift, ShieldCheck, ArrowRight } from "lucide-react";

const defaultPrograms = [
  { name: "Roche Oncology Access Program", medicine: "Herceptin (Trastuzumab) / Kadcyla", manufacturer: "Roche Products India", savings: "Buy 2 Cycles, Get 1 Cycle Free", eligibility: "Diagnosed HER2+ breast cancer patients under specialist prescription." },
  { name: "AstraZeneca Tagrisso Support", medicine: "Tagrisso (Osimertinib)", manufacturer: "AstraZeneca India", savings: "Up to 45% Financial Subsidy", eligibility: "EGFR mutation-positive NSCLC patients with income verification." },
  { name: "Novartis Transplant Assistance", medicine: "Myfortic (Mycophenolate) / Sandimmun", manufacturer: "Novartis India", savings: "Subsidized Monthly Maintenance", eligibility: "Post-transplant patients undergoing active immunosuppression." },
  { name: "Pfizer Ibrance Co-Pay Program", medicine: "Ibrance (Palbociclib)", manufacturer: "Pfizer India", savings: "Co-pay support of up to 50%", eligibility: "HR+/HER2- metastatic breast cancer patients." }
];

const Programs = ({ programsData, onApplyClick }) => {
  const list = programsData || defaultPrograms;

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-slate-50 dark:bg-zinc-950/40 border-t border-b border-slate-150 dark:border-zinc-850/60">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            Active Patient Assistance Programs
          </h2>
          <p className="text-sm text-slate-555 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            We facilitate application submissions and cold-chain dispensing for the following corporate programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg text-left">
          {list.map((prog, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-2xl p-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-md">
                <div className="flex justify-between items-start">
                  <div className="space-y-xs">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#086b53] dark:text-emerald-400">
                      {prog.manufacturer}
                    </span>
                    <h3 className="font-black text-base sm:text-lg text-slate-850 dark:text-zinc-100">
                      {prog.name}
                    </h3>
                  </div>
                  <span className="p-xs bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                    <Gift size={20} />
                  </span>
                </div>

                <div className="border-t border-b border-slate-100 dark:border-zinc-800/60 py-sm space-y-xs text-xs">
                  <p className="font-medium text-slate-550 dark:text-zinc-400">
                    <strong className="text-slate-755 dark:text-zinc-300">Medicine:</strong> {prog.medicine}
                  </p>
                  <p className="font-semibold text-emerald-650 dark:text-emerald-400 flex items-center gap-xs">
                    <ShieldCheck size={14} />
                    <span>Benefit: {prog.savings}</span>
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  <strong>Criteria:</strong> {prog.eligibility}
                </p>
              </div>

              <div className="pt-md mt-md border-t border-slate-100 dark:border-zinc-800/60 flex justify-end">
                <button
                  onClick={() => onApplyClick(prog.name)}
                  className="px-lg h-9 bg-[#086b53] hover:bg-[#065340] text-white rounded-lg text-xs font-bold flex items-center gap-xs transition-all active:scale-95 cursor-pointer select-none"
                >
                  Apply to Program
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
