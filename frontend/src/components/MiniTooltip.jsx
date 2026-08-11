import React from "react";

/**
 * MiniTooltip — Contextual Tooltip with Theme Green / Sky Text
 * Supports 'right' or 'center' alignment to prevent card overflow.
 */
const MiniTooltip = ({ text, active, textColor = "text-[#157a6d] dark:text-emerald-400", align = "right" }) => {
  const isRight = align === "right";

  return (
    <div
      style={{
        transform: active
          ? isRight ? "translate3d(0, 0, 0)" : "translate3d(-50%, 0, 0)"
          : isRight ? "translate3d(0, 4px, 0)" : "translate3d(-50%, 4px, 0)",
        pointerEvents: active ? "auto" : "none",
      }}
      className={`absolute top-full ${isRight ? "right-0" : "left-1/2 -translate-x-1/2"} z-50 mt-2 w-max max-w-[170px] min-h-[28px]
                  flex items-center justify-center rounded-xl border border-slate-200/90
                  bg-white px-3 py-1.5 text-center shadow-lg
                  transition-all duration-[130ms] ease-out
                  dark:border-zinc-700 dark:bg-zinc-900
                  ${active ? "opacity-100" : "opacity-0"}`}
    >
      <span className={`block whitespace-nowrap text-[11px] font-semibold leading-none ${textColor}`}>
        {text}
      </span>
      <div
        className={`absolute -top-1.5 ${isRight ? "right-[9px]" : "left-1/2 -translate-x-1/2"} h-2.5 w-2.5 rotate-45
                    border-t border-l border-slate-200/90 bg-white
                    dark:border-zinc-700 dark:bg-zinc-900`}
      />
    </div>
  );
};

export default MiniTooltip;

