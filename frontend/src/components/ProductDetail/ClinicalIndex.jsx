import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

const ClinicalIndex = ({ clinicalItems, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset scroll so it doesn't get covered by sticky headers
      const yOffset = -110; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsOpen(false); // Close accordion on mobile
    }
  };

  if (!clinicalItems || clinicalItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-sm md:p-md rounded-2xl shadow-xs w-full transition-all">
      {/* Accordion Trigger for mobile, static header for tablet/desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:cursor-default flex items-center justify-between text-left focus:outline-none md:pointer-events-none"
      >
        <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-150 uppercase tracking-wider flex items-center gap-xs">
          <BookOpen size={16} className="text-[#038076] dark:text-[#40a390]" />
          Clinical Index
        </h3>
        {/* Chevron visible only on mobile */}
        <span className={`transition-transform duration-200 md:hidden text-slate-500 flex items-center justify-center ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>

      {/* List container */}
      <div className={`mt-sm space-y-[4px] ${isOpen ? "block" : "hidden md:block"}`} role="navigation" aria-label="Clinical Index">
        {clinicalItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`w-full text-left py-1.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer border border-transparent select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#038076] ${
                isActive
                  ? "bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#40a390] border-l-2 border-l-[#038076] dark:border-l-[#40a390] pl-[10px] font-bold shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-850 dark:hover:text-zinc-200"
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight 
                size={12} 
                className={`transition-all duration-150 ${
                  isActive 
                    ? "opacity-100 translate-x-0 text-[#038076] dark:text-[#40a390]" 
                    : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400"
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
