import React from "react";

/**
 * AdminCard — Standardized Admin Panel Card Primitive
 * Clean white surface, subtle border (#E8ECEF), soft shadow.
 */
export const AdminCard = ({ children, className = "", noPadding = false, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs overflow-hidden ${
        noPadding ? "" : "p-5 sm:p-6"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AdminCardHeader = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800/80 ${className}`}>
      <div>
        {title && (
          <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100 tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default AdminCard;
