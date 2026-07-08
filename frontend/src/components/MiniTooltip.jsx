const MiniTooltip = ({ text, active, textColor = "text-white" }) => {
  return (
    <div
      style={{
        transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 4px, 0)",
        pointerEvents: active ? "auto" : "none",
      }}
      className={`absolute top-full right-0 z-50 mt-2 w-max max-w-[130px] h-[30px]
                  flex items-center justify-center rounded-[10px] border border-slate-800
                  bg-slate-900 px-[10px] py-[6px] text-center shadow-md
                  transition-all duration-[130ms] ease-out
                  dark:border-zinc-800 dark:bg-zinc-950
                  ${active ? "opacity-100" : "opacity-0"}`}
    >
      <span className={`block whitespace-nowrap text-[11px] font-bold leading-none ${textColor}`}>
        {text}
      </span>
      <div className="absolute -top-1 right-3 h-2 w-2 rotate-45
                      border-t border-l border-slate-800 bg-slate-900
                      dark:border-zinc-800 dark:bg-zinc-950" />
    </div>
  );
};

export default MiniTooltip;
