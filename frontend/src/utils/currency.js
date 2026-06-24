/**
 * Indian currency formatting utility for WellMeds.
 * All prices are displayed in Indian Rupees (INR).
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount as Indian Rupees.
 * @param {number} amount - The numeric value to format.
 * @returns {string} Formatted string like "₹1,299.00"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0.00";
  return inrFormatter.format(Number(amount));
};

/**
 * Format a numeric amount as a short Indian Rupee string without decimals.
 * @param {number} amount
 * @returns {string} e.g. "₹1,299"
 */
export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default formatCurrency;
