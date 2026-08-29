/**
 * Authoritative Central Pricing Configuration (WellMeds)
 * 
 * Rules:
 * - Delivery Fee: Free for cart values ABOVE ₹2000, else ₹99
 * - Regular Packaging: Selling Price ₹19
 * - Cold Packaging: Selling Price ₹79
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

/**
 * Checks if a product requires cold chain packaging.
 * @param {object} product
 * @returns {boolean}
 */
export const isColdChainProduct = (product) => {
  if (!product) return false;
  if (product.isColdChain === true || product.coldChain === true) return true;
  if (typeof product.isColdChain === "string" && (product.isColdChain.toLowerCase() === "yes" || product.isColdChain.toLowerCase() === "true")) return true;
  if (Array.isArray(product.specifications)) {
    return product.specifications.some(
      (s) =>
        s &&
        s.label &&
        s.label.toLowerCase().includes("cold") &&
        (s.value === true || String(s.value).toLowerCase() === "yes")
    );
  }
  if (product.specifications && typeof product.specifications === "object") {
    const val = product.specifications.coldChain ?? product.specifications.isColdChain;
    if (val === true || String(val).toLowerCase() === "yes") return true;
  }
  return false;
};

/**
 * Authoritatively resolves packaging for a collection of cart/order items.
 * If ANY product is cold chain, Cold Packaging (₹79) has mandatory priority.
 * @param {Array} items
 * @param {string} requestedType
 * @returns {{ type: string, name: string, price: number, description: string }}
 */
export const resolvePackagingForItems = (items = [], requestedType = "regular") => {
  const hasCold = Array.isArray(items) && items.some((item) => {
    const prod = item.product && typeof item.product === "object" ? item.product : item;
    return isColdChainProduct(prod);
  });
  if (hasCold) {
    return { ...PRICING_CONFIG.PACKAGING.cold };
  }
  return resolvePackaging(requestedType);
};
