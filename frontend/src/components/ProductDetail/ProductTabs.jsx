import React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import SafetyAdviceCards from "./SafetyAdviceCards";
import { renderStorageContent } from "../../utils/renderStorageContent";

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
            className="pdp-paper-card p-6 md:p-8 space-y-4 scroll-mt-28 text-left font-sans"
          >
            <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line font-sans">
              {sec.title}
            </h2>

            {/* Key Benefits — Clean Point-by-Point List */}
            {sec.type === "benefits" && (
              <ul className="space-y-3 font-sans">
                {product.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-sm text-black leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#157a6d] shrink-0 mt-2" />
                    <div>
                      <p className="font-bold text-[#172b26] font-sans">{benefit.title}</p>
                      {benefit.description && <p className="text-[#3f544d] text-sm mt-0.5 font-normal leading-relaxed font-sans">{benefit.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Dosage Checklist — Clean Point-by-Point List */}
            {sec.type === "usage" && (
              <ul className="space-y-2.5 font-sans">
                {product.usageInstructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-black leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#157a6d] shrink-0 mt-2" />
                    <span className="text-[#172b26] font-medium font-sans">{inst}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Warnings — Clean Point-by-Point List */}
            {sec.type === "warnings" && (
              <ul className="space-y-2.5 font-sans">
                {product.warnings.map((warn, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-black leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e] shrink-0 mt-2" />
                    <span className="text-[#172b26] font-medium font-sans">{warn}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Side Effects — Clean Point-by-Point List */}
            {sec.type === "sideeffects" && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-sm text-[#172b26] font-medium">
                {product.sideEffects.map((side, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#157a6d] shrink-0" />
                    <span className="font-sans">{side}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Storage Content */}
            {sec.type === "storage" && (
              <div className="pt-1 text-left font-sans">
                {renderStorageContent(
                  product.storageInstructions && product.storageInstructions.length > 0
                    ? product.storageInstructions
                    : sec.content
                )}
              </div>
            )}

            {/* Safety Cards Grid — Locked & Preserved */}
            {sec.type === "safety" && (
              <SafetyAdviceCards safetyCards={product.safetyCards} />
            )}

            {/* FAQs Accordion */}
            {sec.type === "faqs" && (
              <div className="space-y-2.5 font-sans">
                {product.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="pdp-faq-item">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="pdp-faq-button font-sans font-bold"
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
                        <div className="pdp-faq-content pt-1 border-t border-dashed border-[#dde8e3] font-sans text-sm">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* References — Clean Numbered Point List */}
            {sec.type === "references" && (
              <ol className="space-y-2 font-sans text-sm text-[#3f544d]">
                {product.references.map((ref, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="font-bold text-[#157a6d] shrink-0 font-sans">[{idx + 1}]</span>
                    <span className="text-left font-sans">{ref}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* Default Text Content for Custom Sections */}
            {!sec.type && (
              <p className="font-sans text-sm text-[#3f544d] leading-relaxed whitespace-pre-line text-left font-medium">
                {sec.content}
              </p>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default ProductTabs;
