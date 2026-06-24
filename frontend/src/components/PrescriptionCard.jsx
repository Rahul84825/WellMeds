import React from "react";
import { formatDate } from "../utils/date";

const STATUS_CONFIG = {
  "Pending Review": {
    icon: "schedule",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Pending Review",
  },
  "Under Verification": {
    icon: "manage_search",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Under Verification",
  },
  Approved: {
    icon: "verified",
    color: "text-secondary",
    bg: "bg-secondary-container/20 border-secondary/30",
    dot: "bg-secondary",
    badge: "bg-secondary-container/30 text-on-secondary-container",
    label: "Approved",
  },
  Rejected: {
    icon: "cancel",
    color: "text-error",
    bg: "bg-error-container/20 border-error/30",
    dot: "bg-error",
    badge: "bg-error-container/20 text-error",
    label: "Rejected",
  },
  Expired: {
    icon: "event_busy",
    color: "text-outline",
    bg: "bg-surface-container border-outline-variant/60",
    dot: "bg-outline",
    badge: "bg-surface-container-high text-on-surface-variant",
    label: "Expired",
  },
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG["Pending Review"];

/**
 * PrescriptionCard — renders a single prescription record.
 *
 * Props:
 *  - prescription: { id, _id, name, fileUrl, fileType, fileSizeFormatted, status, adminNotes, createdAt, date }
 *  - onDelete: (id) => void
 *  - onPreview: (url) => void
 */
const PrescriptionCard = ({ prescription, onDelete, onPreview }) => {
  const config = getStatusConfig(prescription.status);
  const displayId = prescription.id || prescription._id;
  const displayDate = prescription.date || (prescription.createdAt
    ? formatDate(prescription.createdAt)
    : "—");

  const isPDF = prescription.fileType === "application/pdf" || prescription.name?.toLowerCase().endsWith(".pdf");
  const isApproved = prescription.status === "Approved";
  const canDelete = ["Pending Review", "Rejected", "Expired"].includes(prescription.status);

  return (
    <div
      className={`rounded-xl border p-md shadow-sm bg-surface-container-lowest dark:bg-inverse-surface transition-all hover:shadow-md ${
        isApproved ? "ring-1 ring-secondary/30" : ""
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start gap-md">
        {/* File Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border`}>
          <span className={`material-symbols-outlined text-2xl ${config.color}`}>
            {isPDF ? "picture_as_pdf" : "image"}
          </span>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-sm flex-wrap">
            <p className="font-label-md text-label-md font-bold text-on-surface truncate max-w-[200px] sm:max-w-xs">
              {prescription.name}
            </p>
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              {config.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-md gap-y-0.5 mt-xs text-xs text-on-surface-variant dark:text-surface-variant">
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
              {displayDate}
            </span>
            {prescription.fileSizeFormatted && (
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[13px]">storage</span>
                {prescription.fileSizeFormatted}
              </span>
            )}
            <span className="flex items-center gap-xs font-mono opacity-60">
              <span className="material-symbols-outlined text-[13px]">tag</span>
              {displayId?.substring(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {prescription.adminNotes && (
        <div className={`mt-md p-sm rounded-lg text-xs border ${config.bg} ${config.color}`}>
          <div className="flex items-center gap-xs font-semibold mb-0.5">
            <span className="material-symbols-outlined text-[14px]">comment</span>
            Pharmacist Note:
          </div>
          <p className="text-on-surface-variant dark:text-surface-variant leading-relaxed">{prescription.adminNotes}</p>
        </div>
      )}

      {/* Approved badge */}
      {isApproved && (
        <div className="mt-md flex items-center gap-xs text-secondary text-xs font-semibold bg-secondary-container/20 rounded-lg px-sm py-xs border border-secondary/20">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          Ready for ordering — attach this prescription at checkout
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-md pt-sm border-t border-outline-variant/50 flex items-center justify-end gap-sm">
        {prescription.fileUrl && (
          <button
            onClick={() => onPreview(prescription)}
            className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            Preview
          </button>
        )}
        {isApproved && (
          <a
            href="/products"
            className="flex items-center gap-xs px-md py-xs bg-secondary text-white rounded-lg text-xs font-bold hover:bg-on-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
            Order Medicines
          </a>
        )}
        {prescription.status === "Rejected" && (
          <a
            href="/upload-prescription"
            className="flex items-center gap-xs px-md py-xs bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
            Re-upload
          </a>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(displayId, prescription.name)}
            className="flex items-center gap-xs px-md py-xs border border-error/30 rounded-lg text-xs font-semibold text-error hover:bg-error-container/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">delete</span>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PrescriptionCard;
