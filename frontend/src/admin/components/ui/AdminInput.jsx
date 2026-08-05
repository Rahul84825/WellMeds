import React from "react";

/**
 * AdminInput — Standardized Input & Select Field for Admin Panel
 * White background, subtle border, proper labels, zero unnecessary placeholders.
 */
export const AdminInput = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      type = "text",
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 text-left ${containerClassName}`}>
        {label && (
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon size={16} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#157a6d] focus:ring-1 focus:ring-[#157a6d] transition-all disabled:bg-slate-50 dark:disabled:bg-zinc-800 disabled:opacity-60 ${
              Icon ? "pl-9" : ""
            } ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-400 dark:text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";

export const AdminSelect = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      hint,
      children,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 text-left ${containerClassName}`}>
        {label && (
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#157a6d] focus:ring-1 focus:ring-[#157a6d] transition-all disabled:bg-slate-50 dark:disabled:bg-zinc-800 disabled:opacity-60 ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
          } ${className}`}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => (
                <option
                  key={typeof opt === "string" ? opt : opt.value}
                  value={typeof opt === "string" ? opt : opt.value}
                >
                  {typeof opt === "string" ? opt : opt.label}
                </option>
              ))}
        </select>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-400 dark:text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";

export default AdminInput;
