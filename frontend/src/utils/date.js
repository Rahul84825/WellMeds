/**
 * Indian date formatting utility for WellMeds.
 * All dates are displayed in DD/MM/YYYY format.
 */

/**
 * Format a date string or Date object in Indian format (DD/MM/YYYY).
 * @param {string|Date} date - ISO date string or Date object.
 * @returns {string} e.g. "24/06/2026"
 */
export const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format a date with time in Indian format (DD/MM/YYYY, HH:MM).
 * @param {string|Date} date
 * @returns {string} e.g. "24/06/2026, 14:30"
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format a date as a human-readable relative time (e.g. "2 hours ago").
 * Falls back to Indian date format if more than 7 days ago.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
};

export default formatDate;
