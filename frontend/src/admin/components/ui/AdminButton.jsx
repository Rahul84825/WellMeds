import React from "react";

/**
 * AdminButton — Standardized Admin Panel Action Button
 * Primary teal (#157a6d), Secondary, Danger, Ghost, Icon styles.
 */
export const AdminButton = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-medium rounded-lg h-8 gap-1.5",
    md: "px-4 py-2 text-xs font-medium rounded-xl h-9 gap-2",
    lg: "px-5 py-2.5 text-sm font-medium rounded-xl h-10 gap-2",
    icon: "p-2 rounded-lg h-9 w-9 flex items-center justify-center",
  }[size] || "px-4 py-2 text-xs font-medium rounded-xl h-9 gap-2";

  const variantClasses = {
    primary:
      "bg-[#157a6d] hover:bg-[#0f5c52] text-white shadow-2xs active:scale-[0.98] border border-[#157a6d]",
    secondary:
      "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60 active:scale-[0.98]",
    outline:
      "bg-transparent text-[#157a6d] dark:text-emerald-400 border border-[#157a6d]/30 dark:border-emerald-500/30 hover:bg-[#157a6d]/5 active:scale-[0.98]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs active:scale-[0.98] border border-rose-600",
    ghost:
      "bg-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100",
  }[variant] || "bg-[#157a6d] text-white";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : 16} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default AdminButton;
