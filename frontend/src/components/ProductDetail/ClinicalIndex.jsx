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
    <div className="pdp-paper-card rounded-sm overflow-hidden w-full text-left font-mono shadow-sm border border-[#dde8e3]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:cursor-default flex items-center justify-between text-left focus:outline-none md:pointer-events-none px-4 py-3.5 border-b border-dashed border-[#c3d4cc] bg-[#f4f9f7]"
      >
        <h3 className="text-xs font-mono font-bold uppercase tracking-[2px] text-black flex items-center gap-2">
          <BookOpen size={16} className="text-[#157a6d]" />
          Clinical Index
        </h3>
        <span className={`transition-transform duration-200 md:hidden text-black flex items-center justify-center ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>

      <div className={`p-1 space-y-0.5 ${isOpen ? "block" : "hidden md:block"}`} role="navigation" aria-label="Clinical Index">
        {clinicalItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`w-full text-left py-2.5 px-3.5 rounded-sm text-xs font-mono transition-all duration-150 flex items-center justify-between cursor-pointer border border-transparent select-none ${
                isActive
                  ? "bg-[#157a6d] text-white font-bold"
                  : "text-black hover:bg-[#f4f9f7] hover:text-[#157a6d] font-semibold"
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight 
                size={12} 
                className={`transition-all duration-150 ${
                  isActive 
                    ? "opacity-100 translate-x-0 text-white" 
                    : "opacity-0 -translate-x-1 text-black"
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
