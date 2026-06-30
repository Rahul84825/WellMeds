import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Who qualifies for the Patient Assistance Program?",
    answer: "Eligibility is primarily based on two criteria: clinical need (having a valid prescription for a covered specialty medication from a certified specialist) and financial assessment (demonstrating that the cost of therapy exceeds your household's disposable income or insurance limits)."
  },
  {
    question: "Is the Patient Assistance Program free?",
    answer: "Yes, applying through WellMeds is completely free. We do not charge any coordination or facilitation fees. The cost of the medication itself is either fully subsidized (free) or partially subsidized (co-pay support) depending on the specific program guidelines set by the manufacturer."
  },
  {
    question: "How long does the PAP approval take?",
    answer: "Once we compile your complete document dossier and submit it to the manufacturer's program desk, approval typically takes between 3 to 7 business days. We assign a dedicated caseworker to follow up daily and expedite the process."
  },
  {
    question: "Can anyone apply for PAP?",
    answer: "Any patient who has been prescribed a specialty medication that has an active PAP run by its manufacturer can apply. Our caseworkers will help you evaluate if you meet the specific income and clinical criteria before submitting the official paperwork."
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900">
      <div className="max-w-[800px] mx-auto space-y-8 text-left">
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            Frequently Asked Questions (PAP)
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Understand how patient assistance programs work and how you can benefit.
          </p>
        </div>

        <div className="space-y-sm">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-150 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-950/20"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-lg py-md flex justify-between items-center text-left font-extrabold text-sm text-slate-800 dark:text-zinc-100 outline-none focus:bg-slate-100/50 dark:focus:bg-zinc-800/20 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isOpen && (
                  <div className="px-lg pb-md text-xs text-slate-550 dark:text-zinc-400 leading-relaxed font-medium border-t border-slate-100 dark:border-zinc-800/40 pt-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
