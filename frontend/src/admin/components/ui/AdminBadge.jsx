import React from "react";

/**
 * AdminBadge — Standardized Status Badge for Admin Panel
 * Standardized HSL soft pill badges for Order Status, Payment Status, and Prescription Status.
 */
export const AdminBadge = ({ variant = "neutral", children, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1 text-xs font-semibold",
  }[size] || "px-2.5 py-1 text-xs";

  const variantClasses = {
    // Storefront Green / Approved / Completed / Paid / Delivered
    success: "bg-[#bbf7d0] text-[#15803d] dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40 font-semibold",
    
    // Soft Amber / Warning / Pending / Rx Review Needed
    warning: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70 font-semibold",

    // Storefront Soft Teal / Info / Processing / Packed / Shipped
    info: "bg-[#f4f9f7] text-[#157a6d] dark:bg-teal-950/50 dark:text-teal-300 border border-[#157a6d]/25 font-semibold",

    // Purple / Indigo / Special / Rx Verification
    purple: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 font-semibold",

    // Red / Danger / Cancelled / Rejected / Unpaid / OOS
    danger: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/70 font-semibold",

    // Slate / Neutral / Draft
    neutral: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-semibold",
  }[variant] || "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium leading-none select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const getOrderStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered") || s.includes("completed")) return <AdminBadge variant="success">Delivered</AdminBadge>;
  if (s.includes("shipped") || s.includes("out for delivery")) return <AdminBadge variant="info">Shipped</AdminBadge>;
  if (s.includes("packed") || s.includes("ready")) return <AdminBadge variant="purple">Packed</AdminBadge>;
  if (s.includes("approved")) return <AdminBadge variant="info">Approved</AdminBadge>;
  if (s.includes("cancel") || s.includes("reject")) return <AdminBadge variant="danger">Cancelled</AdminBadge>;
  return <AdminBadge variant="warning">Pending</AdminBadge>;
};

export const getPaymentStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("paid")) return <AdminBadge variant="success">Paid</AdminBadge>;
  if (s.includes("refund")) return <AdminBadge variant="purple">Refunded</AdminBadge>;
  if (s.includes("failed")) return <AdminBadge variant="danger">Payment Failed</AdminBadge>;
  return <AdminBadge variant="warning">Unpaid</AdminBadge>;
};

export const getPrescriptionStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("approved") || s.includes("verified")) return <AdminBadge variant="success">Rx Verified</AdminBadge>;
  if (s.includes("reject")) return <AdminBadge variant="danger">Rx Rejected</AdminBadge>;
  if (s.includes("not required") || s.includes("none")) return <AdminBadge variant="neutral">Not Required</AdminBadge>;
  return <AdminBadge variant="warning">Rx Pending Review</AdminBadge>;
};

export default AdminBadge;
