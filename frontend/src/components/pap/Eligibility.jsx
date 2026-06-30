import React from "react";
import { ShieldAlert, Sparkles, Heart, Activity, ShieldCheck, HelpCircle } from "lucide-react";

const eligibilityCategories = [
  {
    title: "Oncology & Cancer Patients",
    desc: "Patients prescribed high-value chemotherapy, immunotherapy, or targeted kinase inhibitors.",
    icon: ShieldAlert
  },
  {
    title: "Rare Diseases & Orphan Drugs",
    desc: "Families dealing with rare genetic disorders requiring specialized enzyme therapies.",
    icon: Sparkles
  },
  {
    title: "Organ Transplant Recipients",
    desc: "Patients requiring lifelong anti-rejection immunosuppressive therapies.",
    icon: Heart
  },
  {
    title: "Chronic Lifelong Therapies",
    desc: "Management of severe rheumatoid arthritis, psoriasis, or advanced cardiovascular conditions.",
    icon: Activity
  },
  {
    title: "Pediatric Care Support",
    desc: "Subsidized growth hormones, specialized nutrition, and pediatric critical care medications.",
    icon: ShieldCheck
  },
  {
    title: "Low & Middle-Income Families",
    desc: "Patients without adequate health insurance coverage or those who have exhausted their limits.",
    icon: HelpCircle
  }
];

const Eligibility = () => {
  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            Who Qualifies for Patient Assistance Programs?
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            PAP criteria are set by the manufacturing pharmaceutical companies, focusing on clinical need and financial support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {eligibilityCategories.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-800/80 p-xl rounded-2xl text-left space-y-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#086b53]/5 border border-[#086b53]/10 text-[#086b53] dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 flex items-center justify-center">
                  <IconComp size={22} />
                </div>
                <div className="space-y-xs">
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
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

export default Eligibility;
