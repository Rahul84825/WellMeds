import React from "react";

/**
 * MiniTooltip — Centered White Background Tooltip with Theme Green Text
 */
const MiniTooltip = ({ text, active, textColor = "text-[#157a6d] dark:text-emerald-400" }) => {
  return (
    <div
      style={{
        transform: active
          ? "translate3d(-50%, 0, 0)"
          : "translate3d(-50%, 4px, 0)",
        pointerEvents: active ? "auto" : "none",
      }}
      className={`absolute top-full left-1/2 z-50 mt-2.5 w-max max-w-[150px] min-h-[30px]
                  flex items-center justify-center rounded-xl border border-slate-200/90
                  bg-white px-3 py-1.5 text-center shadow-md
                  transition-all duration-[130ms] ease-out
                  dark:border-zinc-700 dark:bg-zinc-900
                  ${active ? "opacity-100" : "opacity-0"}`}
    >
      <span className={`block whitespace-nowrap text-[11px] font-semibold leading-none ${textColor}`}>
        {text}
      </span>
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45
                    border-t border-l border-slate-200/90 bg-white
                    dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
};

export default MiniTooltip;
