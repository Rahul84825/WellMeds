import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

const ClinicalIndex = ({ clinicalItems, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  if (!clinicalItems || clinicalItems.length === 0) return null;

  return (
    <div className="pdp-paper-card p-4 rounded-xl w-full text-left font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:cursor-default flex items-center justify-between text-left focus:outline-none md:pointer-events-none pb-2 pdp-dashed-line"
      >
        <h3 className="pdp-serif-title text-sm font-bold text-[#172b26] flex items-center gap-2">
          <BookOpen size={16} className="text-[#157a6d]" />
          Clinical Index
        </h3>
        <span className={`transition-transform duration-200 md:hidden text-[#5f776e] flex items-center justify-center ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>

      <div className={`mt-3 space-y-1 ${isOpen ? "block" : "hidden md:block"}`} role="navigation" aria-label="Clinical Index">
        {clinicalItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer border border-transparent select-none ${
                isActive
                  ? "bg-[#f0f8f5] text-[#157a6d] border-l-2 border-l-[#157a6d] font-bold shadow-2xs"
                  : "text-[#3f544d] hover:bg-[#f4f8f6] hover:text-[#172b26]"
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight 
                size={12} 
                className={`transition-all duration-150 ${
                  isActive 
                    ? "opacity-100 translate-x-0 text-[#157a6d]" 
                    : "opacity-0 -translate-x-1 text-[#5f776e]"
                }`} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClinicalIndex;
