/**
 * Frontend Pricing Configuration (WellMeds)
 * Mirrors backend authoritative pricing rules for instant, fluid UI feedback.
 */

export const PRICING_CONFIG = {
  DELIVERY_THRESHOLD: 2000,
  DELIVERY_FEE: 99,
  PACKAGING: {
    regular: {
      type: "regular",
      name: "Regular Packaging",
      price: 19,
      description: "Standard tamper-evident secure clinical packaging",
    },
    cold: {
      type: "cold",
      name: "Cold Packaging",
      price: 79,
      description: "Temperature-controlled insulated packaging with cold gel packs",
    },
  },
  DEFAULT_PACKAGING_TYPE: "regular",
};

export const PACKAGING_OPTIONS = [
  PRICING_CONFIG.PACKAGING.regular,
  PRICING_CONFIG.PACKAGING.cold,
];

/**
 * Checks if a cart item or product requires cold-chain packaging.
 * Supports isColdChain boolean, coldChain, or specifications inspection.
 * @param {object} item 
 * @returns {boolean}
 */
export const isColdChainItem = (item) => {
  if (!item) return false;
  if (item.isColdChain === true || item.coldChain === true) return true;
  if (typeof item.isColdChain === "string" && (item.isColdChain.toLowerCase() === "yes" || item.isColdChain.toLowerCase() === "true")) return true;
  if (Array.isArray(item.specifications)) {
    return item.specifications.some(
      (s) =>
        s &&
        s.label &&
        s.label.toLowerCase().includes("cold") &&
        (s.value === true || String(s.value).toLowerCase() === "yes")
    );
  }
  if (item.specifications && typeof item.specifications === "object") {
    const val = item.specifications.coldChain ?? item.specifications.isColdChain;
    if (val === true || String(val).toLowerCase() === "yes") return true;
  }
  return false;
};

/**
 * Checks if any item in the cart is a cold chain product.
 * @param {Array} items 
 * @returns {boolean}
 */
export const hasColdChainItems = (items = []) => {
  if (!Array.isArray(items)) return false;
  return items.some(isColdChainItem);
};

/**
 * Calculates delivery fee for a given subtotal.
 * @param {number} subtotal 
 * @param {boolean} hasFreeDeliveryCoupon 
 * @returns {number} 0 or 99
 */
export const getDeliveryFee = (subtotal = 0, hasFreeDeliveryCoupon = false) => {
  const numericSubtotal = Number(subtotal) || 0;
  if (numericSubtotal <= 0) return 0;
  if (hasFreeDeliveryCoupon) return 0;
  return numericSubtotal > PRICING_CONFIG.DELIVERY_THRESHOLD ? 0 : PRICING_CONFIG.DELIVERY_FEE;
};

/**
 * Calculates packaging info based on selected type and cart items.
 * If ANY cold-chain product is present in the cart, Cold Packaging (₹79) has mandatory priority.
 * @param {string} packagingType 
 * @param {Array} items
 * @returns {typeof PRICING_CONFIG.PACKAGING.regular}
 */
export const getPackagingOption = (packagingType, items = []) => {
  if (hasColdChainItems(items)) {
    return PRICING_CONFIG.PACKAGING.cold;
  }
  if (packagingType === "cold") {
    return PRICING_CONFIG.PACKAGING.cold;
  }
  return PRICING_CONFIG.PACKAGING.regular;
};

/**
 * Returns the additional cart amount needed to achieve free delivery.
 * @param {number} subtotal 
 * @returns {number} Amount needed (0 if already above threshold)
 */
export const getAmountNeededForFreeDelivery = (subtotal = 0) => {
  const numericSubtotal = Number(subtotal) || 0;
  if (numericSubtotal > PRICING_CONFIG.DELIVERY_THRESHOLD) return 0;
  // If subtotal is 2000, adding 1 rupee gets > 2000 for free delivery
  return Math.max(0, PRICING_CONFIG.DELIVERY_THRESHOLD - numericSubtotal + 1);
};
