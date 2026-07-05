import React from "react";

const TableOfContents = ({ computedSections, activeSection, sectionRefs }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-xs select-none">
      <h3 className="font-extrabold text-[11px] text-slate-800 dark:text-zinc-150 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800 mb-sm flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-[#004782]">format_list_bulleted</span>
        Clinical Index
      </h3>
      <div className="space-y-xs relative pl-sm border-l border-slate-100 dark:border-zinc-800">
        {computedSections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                const target = sectionRefs.current[sec.id];
                if (target) {
                  window.scrollTo({
                    top: target.offsetTop - 120,
                    behavior: "smooth"
                  });
                }
              }}
              className={`w-full text-left py-1.5 px-sm rounded-lg text-[11px] font-bold transition-all relative block cursor-pointer select-none ${
                isActive
                  ? "bg-[#004782]/5 text-primary dark:text-[#a4c9ff]"
                  : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50/30 dark:hover:bg-zinc-900/30"
              }`}
            >
              {isActive && (
                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[3px] h-3.5 bg-[#004782] dark:bg-[#a4c9ff] rounded-r-full" />
              )}
              {sec.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableOfContents;
