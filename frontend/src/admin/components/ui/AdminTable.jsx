import React from "react";

/**
 * AdminTable — Standardized Modern Data Table Component
 * Row hovers, sticky headers, subtle dividers, responsive overflow, clean empty states.
 */
export const AdminTable = ({ children, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar border border-slate-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xs">
      <table className={`w-full text-left border-collapse text-xs ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const AdminTableHead = ({ children, className = "" }) => {
  return (
    <thead className={`bg-slate-50/80 dark:bg-zinc-850/80 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium text-[11px] uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const AdminTableBody = ({ children, className = "" }) => {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-zinc-800/80 text-slate-700 dark:text-zinc-200 ${className}`}>
      {children}
    </tbody>
  );
};

export const AdminTableRow = ({ children, className = "", onClick, ...props }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const AdminTableCell = ({ children, className = "", align = "left" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align] || "text-left";

  return (
    <td className={`px-4 py-3.5 align-middle ${alignClass} ${className}`}>
      {children}
    </td>
  );
};

export const AdminTableHeaderCell = ({ children, className = "", align = "left" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align] || "text-left";

  return (
    <th className={`px-4 py-3 font-semibold ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

export default AdminTable;
