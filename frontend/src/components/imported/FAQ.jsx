import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How long does the import process take?",
    answer: "Typically, procurement and customs clearance take between 7 to 14 business days. For critical emergency cases, we can fast-track flight bookings and clearances to deliver within 5 to 7 days."
  },
  {
    question: "Do I need a prescription to order imported medicines?",
    answer: "Yes. Under Indian drug regulations (CDSCO guidelines), importing medicines for personal use requires a valid prescription from a registered medical practitioner (usually a specialist, like an oncologist or immunologist), along with a patient-named import permit (Form 12A)."
  },
  {
    question: "Are these imported medicines genuine?",
    answer: "Absolutely. We source all medications directly from the brand manufacturers or their licensed international distributors. Every shipment is accompanied by a Certificate of Analysis (CoA), original invoices, and customs bill of entry."
  },
  {
    question: "Can imported medicines be returned or cancelled?",
    answer: "Since these are specialty items procured specifically for an individual patient under a personal import permit, they cannot be returned or cancelled once the international procurement cycle has commenced."
  },
  {
    question: "Is GST and customs duty included in the quoted price?",
    answer: "Yes, our quoted prices are fully inclusive of basic customs duties, IGST, handling fees, and doorstep delivery charges. There are no hidden costs."
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
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Find answers to common questions about global medicine procurement.
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
