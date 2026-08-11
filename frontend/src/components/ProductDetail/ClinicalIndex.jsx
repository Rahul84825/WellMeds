import React from "react";
import {
  BookOpen,
  FlaskConical,
  Pill,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  BookMarked,
  HelpCircle,
  Info,
  List,
  CheckCircle,
  Atom,
} from "lucide-react";

/**
 * Maps section IDs to cohesive Lucide icons matching Molecule Detail Page
 */
const getSectionIcon = (id) => {
  switch (id) {
    case "Specifications": return List;
    case "Introduction": return BookOpen;
    case "AboutThisMedicine": return Atom;
    case "Uses": return FlaskConical;
    case "Benefits": return CheckCircle;
    case "Dosage": return Pill;
    case "Warnings": return ShieldAlert;
    case "SideEffects": return Thermometer;
    case "Precautions": return ShieldCheck;
    case "Storage": return BookMarked;
    case "FAQs": return HelpCircle;
    case "References": return BookMarked;
    case "Disclaimer": return Info;
    default: return BookOpen;
  }
};

/**
 * ClinicalIndex — Clean, shared Clinical Index matching Molecule Detail Page system exactly
 */
const ClinicalIndex = ({ clinicalItems, activeSection }) => {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (!clinicalItems || clinicalItems.length === 0) return null;

  return (
    <div className="bg-white border border-[#dde8e3] rounded-sm overflow-hidden shadow-sm w-full text-left font-sans select-none">
      {/* Header matching Molecule Detail Clinical Index */}
      <div className="px-4 py-3.5 border-b border-dashed border-[#c3d4cc] bg-[#f4f9f7]">
        <p className="text-xs font-sans font-bold uppercase tracking-[2px] text-black">
          Clinical Index
        </p>
      </div>

      {/* Nav links matching Molecule Detail Clinical Index */}
      <nav aria-label="Clinical Index">
        {clinicalItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon || getSectionIcon(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-xs font-sans border-b border-[#dde8e3]/60 last:border-0 group cursor-pointer ${
                isActive
                  ? "bg-[#157a6d] text-white font-bold"
                  : "text-black hover:bg-[#f4f9f7] hover:text-[#157a6d] font-medium"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-[#157a6d] group-hover:text-[#157a6d]"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ClinicalIndex;
