/**
 * Authoritative Central Pricing Configuration (WellMeds)
 * 
 * Rules:
 * - Delivery Fee: Free for cart values ABOVE ₹2000, else ₹99
 * - Regular Packaging: MRP ₹19, Selling Price ₹12
 * - Cold Packaging: MRP ₹79, Selling Price ₹59
 */

export const PRICING_CONFIG = {
  DELIVERY_THRESHOLD: 2000,
  DELIVERY_FEE: 99,
  PACKAGING: {
    regular: {
      type: "regular",
      name: "Regular Packaging",
      price: 12,
      description: "Standard tamper-evident secure clinical packaging",
    },
    cold: {
      type: "cold",
      name: "Cold Packaging",
      price: 59,
      description: "Temperature-controlled insulated packaging with cold gel packs for sensitive medicines",
    },
  },
  DEFAULT_PACKAGING_TYPE: "regular",
};

/**
 * Authoritatively calculates the delivery fee based on cart subtotal and coupon benefits.
 * @param {number} subtotal Applicable merchandise subtotal
 * @param {boolean} hasFreeDeliveryCoupon Whether an active coupon grants free delivery
 * @returns {number} Calculated delivery fee (0 or 99)
 */
export const calculateDeliveryFee = (subtotal = 0, hasFreeDeliveryCoupon = false) => {
  const numericSubtotal = Number(subtotal) || 0;
  if (numericSubtotal <= 0) return 0;
  if (hasFreeDeliveryCoupon) return 0;
  return numericSubtotal > PRICING_CONFIG.DELIVERY_THRESHOLD ? 0 : PRICING_CONFIG.DELIVERY_FEE;
};

/**
 * Authoritatively resolves packaging metadata and price.
 * Defaults to Regular Packaging if an invalid or missing packaging type is provided.
 * @param {string} packagingType "regular" | "cold"
 * @returns {{ type: string, name: string, mrp: number, price: number, description: string }}
 */
export const resolvePackaging = (packagingType) => {
  const normalized = (typeof packagingType === "string" ? packagingType.toLowerCase().trim() : "");
  if (normalized === "cold") {
    return { ...PRICING_CONFIG.PACKAGING.cold };
  }
  return { ...PRICING_CONFIG.PACKAGING.regular };
};
