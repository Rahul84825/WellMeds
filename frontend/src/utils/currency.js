/**
 * Production-grade Indian currency & money utility for WellMeds.
 * Eliminates floating-point precision errors (e.g. 884.719999999998 -> 884.72).
 */

/**
 * Round any numeric price/amount to exactly 2 decimal places to fix floating-point precision issues.
 * @param {number|string} amount
 * @returns {number} Clean rounded number (e.g., 884.72)
 */
export const roundPrice = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Format a number as a clean price string without trailing noise.
 * If integer, returns e.g. "2230". If decimal, returns e.g. "884.72".
 * @param {number|string} amount
 * @returns {string} e.g. "2230" or "884.72"
 */
export const formatPrice = (amount) => {
  const rounded = roundPrice(amount);
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(2);
};

/**
 * Calculate savings amount (MRP - Selling Price) safely rounded to 2 decimals.
 * @param {number|string} mrp
 * @param {number|string} price
 * @returns {number} Rounded savings amount or 0
 */
export const calculateSavings = (mrp, price) => {
  const numMrp = Number(mrp);
  const numPrice = Number(price);
  if (isNaN(numMrp) || isNaN(numPrice) || numMrp <= numPrice) return 0;
  return roundPrice(numMrp - numPrice);
};

/**
 * Calculate discount percentage safely rounded to integer or 1 decimal place.
 * @param {number|string} mrp
 * @param {number|string} price
 * @returns {number} Rounded integer discount percentage (e.g. 28)
 */
export const calculateDiscountPercent = (mrp, price) => {
  const numMrp = Number(mrp);
  const numPrice = Number(price);
  if (isNaN(numMrp) || isNaN(numPrice) || numMrp <= numPrice) return 0;
  return Math.round(((numMrp - numPrice) / numMrp) * 100);
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount as Indian Rupees (INR).
 * @param {number|string} amount - The numeric value to format.
 * @returns {string} Formatted string like "₹1,299.00"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0.00";
  return inrFormatter.format(roundPrice(amount));
};

/**
 * Format a numeric amount as a short Indian Rupee string without decimals.
 * @param {number|string} amount
 * @returns {string} e.g. "₹1,299"
 */
export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundPrice(amount));
};

export default formatCurrency;
