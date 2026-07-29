import React from "react";
import { Info, HelpCircle, Building, ShieldCheck, ChevronDown, Check, CheckCircle, AlertTriangle } from "lucide-react";
import SafetyAdviceCards from "./SafetyAdviceCards";

const ProductTabs = ({
  computedSections,
  openFaqIdx,
  setOpenFaqIdx,
  product,
  sectionRefs
}) => {
  return (
    <div className="space-y-6 select-none">
      {computedSections.map((sec) => {
        return (
          <div
            key={sec.id}
            id={sec.id}
            ref={el => sectionRefs.current[sec.id] = el}
            className="pdp-paper-card p-6 md:p-8 space-y-4 scroll-mt-28 text-left"
          >
            <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line">
              {sec.title}
            </h2>

            {/* Key Benefits Icon Grid */}
            {sec.type === "benefits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                {product.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="p-4 bg-[#f0f8f5] rounded-xl border border-[#c3d4cc] flex gap-3 items-start transition-all hover:border-[#157a6d]">
                    <div className="w-6 h-6 bg-[#157a6d] text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#172b26]">{benefit.title}</p>
                      {benefit.description && <p className="text-[11px] text-[#3f544d] mt-1 leading-relaxed">{benefit.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dosage Checklist */}
            {sec.type === "usage" && (
              <ul className="space-y-2.5 font-mono text-xs text-[#3f544d] font-medium">
                {product.usageInstructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-3 items-start leading-relaxed bg-[#f4f8f6] p-3 rounded-lg border border-[#dde8e3]">
                    <div className="w-5 h-5 rounded-full bg-[#157a6d] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-[#172b26] font-semibold">{inst}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Warnings Alert Panels */}
            {sec.type === "warnings" && (
              <div className="space-y-3 font-mono">
                {product.warnings.map((warn, idx) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-900 leading-relaxed font-semibold">{warn}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Side Effects List */}
            {sec.type === "sideeffects" && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs text-[#172b26] font-semibold">
                {product.sideEffects.map((side, idx) => (
                  <li key={idx} className="flex gap-2.5 items-center p-2.5 bg-[#f4f8f6] rounded-lg border border-[#dde8e3]">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{side}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Storage Checklist */}
            {sec.type === "storage" && (
              <ul className="space-y-2 font-mono text-xs text-[#3f544d] font-medium">
                {product.storageInstructions.map((store, idx) => (
                  <li key={idx} className="flex gap-3 items-center p-3 bg-[#f0f8f5] rounded-lg border border-[#c3d4cc]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#157a6d] shrink-0" />
                    <span className="text-[#172b26] font-semibold">{store}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Safety Cards Grid */}
            {sec.type === "safety" && (
              <SafetyAdviceCards safetyCards={product.safetyCards} />
            )}

            {/* FAQs Accordion */}
            {sec.type === "faqs" && (
              <div className="space-y-2.5">
                {product.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="pdp-faq-item">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="pdp-faq-button"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle size={16} className="text-[#157a6d] shrink-0" />
                          {faq.question}
                        </span>
                        <span className={`transform transition-transform duration-300 text-[#157a6d] ${isOpen ? "rotate-180" : ""}`}>
                          <ChevronDown size={16} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pdp-faq-content pt-1 border-t border-dashed border-[#dde8e3]">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* References */}
            {sec.type === "references" && (
              <ul className="space-y-2 font-mono text-xs text-[#5f776e] italic">
                {product.references.map((ref, idx) => (
                  <li key={idx} className="flex gap-2 items-start bg-[#f4f8f6] p-2.5 rounded border border-[#dde8e3]">
                    <span className="font-bold text-[#157a6d]">[{idx + 1}]</span>
                    <span className="text-left">{ref}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Default Text Content for Custom Sections */}
            {!sec.type && (
              <p className="font-mono text-xs text-[#3f544d] leading-relaxed whitespace-pre-line text-left font-medium">
                {sec.content}
              </p>
            )}

          </div>
        );
      })}

      {/* Manufacturer Information Card */}
      <div className="pdp-paper-card p-6 md:p-8 space-y-4 text-left">
        <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line">
          <Building size={18} className="text-[#157a6d]" />
          Manufacturer Information
        </h2>
        <div className="flex flex-col sm:flex-row gap-5 items-start font-mono text-xs text-left">
          <div className="w-14 h-14 rounded-xl bg-[#f0f8f5] flex items-center justify-center shrink-0 border border-[#c3d4cc]">
            <Building className="text-[#157a6d]" size={28} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="pdp-serif-title text-lg font-bold text-[#172b26]">{product.manufacturer || product.brand}</h3>
            <p className="text-[#157a6d] font-bold uppercase tracking-wider text-[11px]">Manufacturing License Verified</p>
            <p className="text-[#3f544d] leading-relaxed text-[12px]">
              {product.manufacturer || product.brand} is a certified pharmaceutical enterprise. All products are manufactured under WHO-GMP certified facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Banner Card */}
      <div className="bg-gradient-to-br from-[#157a6d] to-[#0f6157] text-white p-6 md:p-8 rounded-2xl shadow-md text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden font-mono">
        <div className="space-y-1.5 z-10">
          <h3 className="pdp-serif-title text-lg font-bold flex items-center gap-2 text-white">
            <ShieldCheck size={20} /> WellMeds Quality Guarantee
          </h3>
          <p className="text-xs text-white/90 leading-relaxed max-w-xl">
            Strict cold-chain logistics, licensed pharmacist validation, and clinical batch tracking guarantee that every single medicine delivered is 100% authentic.
          </p>
        </div>
        <div className="flex gap-2 z-10 shrink-0 select-none">
          <span className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">Licensed Hub</span>
          <span className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">Cold Chain</span>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
