import React from "react";
import { Info, HelpCircle, Building, ShieldCheck, ChevronDown, Check, CheckCircle, AlertTriangle } from "lucide-react";

const ProductTabs = ({
  computedSections,
  openFaqIdx,
  setOpenFaqIdx,
  product,
  sectionRefs
}) => {
  return (
    <div className="space-y-lg select-none">
      {computedSections.map((sec) => {
        return (
          <div
            key={sec.id}
            id={sec.id}
            ref={el => sectionRefs.current[sec.id] = el}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-lg rounded-3xl shadow-sm space-y-md scroll-mt-28 transition-all hover:shadow-md text-left"
          >
            <h2 className="font-bold text-xs md:text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider">
              {sec.title}
            </h2>


            {/* Key Benefits Icon Grid */}
            {sec.type === "benefits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {product.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="p-md bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] rounded-2xl border border-emerald-500/10 flex gap-sm items-start hover:shadow-xs transition-all">
                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="text-[#086b53]" size={12} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-805 dark:text-zinc-200">{benefit.title}</p>
                      {benefit.description && <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{benefit.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dosage Checklist */}
            {sec.type === "usage" && (
              <ul className="space-y-sm text-xs text-slate-650 dark:text-zinc-300 font-medium">
                {product.usageInstructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-sm items-start leading-relaxed">
                    <div className="w-4 h-4 rounded-full bg-[#004782]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="text-[#004782]" size={10} />
                    </div>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Warnings Alert Panels */}
            {sec.type === "warnings" && (
              <div className="space-y-sm">
                {product.warnings.map((warn, idx) => (
                  <div key={idx} className="p-md bg-red-500/[0.02] border border-red-500/10 rounded-2xl flex gap-sm items-start">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-xs text-slate-650 dark:text-zinc-300 leading-relaxed">{warn}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Side Effects List */}
            {sec.type === "sideeffects" && (
              <ul className="space-y-sm text-xs text-slate-650 dark:text-zinc-300 font-medium">
                {product.sideEffects.map((side, idx) => (
                  <li key={idx} className="flex gap-sm items-start leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-550 shrink-0 mt-2" />
                    <span>{side}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Storage Checklist */}
            {sec.type === "storage" && (
              <ul className="space-y-sm text-xs text-slate-650 dark:text-zinc-300 font-medium">
                {product.storageInstructions.map((store, idx) => (
                  <li key={idx} className="flex gap-sm items-start leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#086b53] shrink-0 mt-2" />
                    <span>{store}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Safety Cards Grid */}
            {sec.type === "safety" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {product.safetyCards.map((card, idx) => {
                  const status = card.status.toLowerCase();
                  
                  let badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400";
                  if (status.includes("avoid") || status.includes("unsafe") || status.includes("dangerous")) {
                    badgeStyle = "bg-red-100 text-red-800 border-red-200/50 dark:bg-red-950/20 dark:text-red-400";
                  } else if (status.includes("caution") || status.includes("moderate")) {
                    badgeStyle = "bg-yellow-100 text-yellow-800 border-yellow-200/50 dark:bg-yellow-950/20 dark:text-yellow-400";
                  } else if (status.includes("consult") || status.includes("doctor") || status.includes("physician")) {
                    badgeStyle = "bg-orange-100 text-orange-850 border-orange-200/50 dark:bg-orange-950/20 dark:text-orange-400";
                  }
                  
                  return (
                    <div key={idx} className="p-md bg-slate-50/30 dark:bg-zinc-955/10 rounded-2xl border border-slate-100 dark:border-zinc-855 space-y-sm text-xs transition-all hover:shadow-xs text-left">
                      <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-850/80">
                        <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                          <Info size={12} className="text-[#004782]" />
                          {card.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border tracking-wider ${badgeStyle}`}>
                          {card.status}
                        </span>
                      </div>
                      {card.description && <p className="text-[10px] text-slate-450 leading-relaxed text-left">{card.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* FAQs Accordion */}
            {sec.type === "faqs" && (
              <div className="space-y-sm">
                {product.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all bg-slate-50/30 dark:bg-zinc-955/5">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center p-md font-bold text-slate-700 dark:text-zinc-200 text-xs text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <span className="flex items-center gap-sm">
                          <HelpCircle size={14} className="text-[#004782] shrink-0" />
                          {faq.question}
                        </span>
                        <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                          <ChevronDown size={14} />
                        </span>
                      </button>
                      <div className={`transition-all duration-350 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-60 border-t border-slate-100 dark:border-zinc-800 p-md opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"
                      }`}>
                        <p className="text-[10px] text-slate-455 dark:text-zinc-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}


            {/* References */}
            {sec.type === "references" && (
              <ul className="space-y-xs text-[10px] text-slate-455 italic">
                {product.references.map((ref, idx) => (
                  <li key={idx} className="flex gap-sm items-start">
                    <span>[{idx + 1}]</span>
                    <span className="text-left">{ref}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Default Text Content for Custom Sections */}
            {!sec.type && (
              <p className="text-xs text-slate-655 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-left font-medium">
                {sec.content}
              </p>
            )}

          </div>
        );
      })}

      {/* Manufacturer Information Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-lg rounded-3xl shadow-sm space-y-md text-left">
        <h2 className="font-bold text-xs md:text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider">
          <Building size={14} className="text-[#004782]" />
          Manufacturer Information
        </h2>
        <div className="flex flex-col sm:flex-row gap-lg items-start text-xs text-left">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center shrink-0 border border-slate-100 dark:border-zinc-850">
            <Building className="text-[#004782]" size={28} />
          </div>
          <div className="space-y-sm flex-1">
            <h3 className="font-bold text-xs text-slate-855 dark:text-zinc-100">{product.manufacturer || product.brand}</h3>
            <p className="text-slate-400 font-medium">Manufacturing License Verified</p>
            <p className="text-[10px] text-slate-505 dark:text-zinc-455 leading-relaxed">
              {product.manufacturer || product.brand} is a global enterprise with core competencies in the life science fields of health care. Its products and services are designed to benefit people and improve their quality of life.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Banner Card */}
      <div className="bg-gradient-to-br from-[#004782] to-[#086b53] text-white p-lg rounded-3xl shadow-md text-left flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="space-y-xs z-10">
          <h3 className="text-sm font-black flex items-center gap-xs uppercase tracking-wider">
            <ShieldCheck size={16} /> WellMeds Quality Assurance
          </h3>
          <p className="text-[11px] text-white/85 leading-relaxed max-w-xl">
            We employ strict cold-chain logistics, licensed pharmacists validation, and clinical batch tracking to guarantee that every single medicine delivered is 100% authentic.
          </p>
        </div>
        <div className="flex gap-sm z-10 shrink-0 select-none">
          <span className="bg-white/10 border border-white/10 px-md py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider">Licensed Hub</span>
          <span className="bg-white/10 border border-white/10 px-md py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider">Cold Chain</span>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
