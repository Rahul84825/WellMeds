import apiInstance from "./api";

export const couponService = {
  /**
   * Apply a coupon code at checkout.
   * @param {string} code - coupon code (e.g. "SAVE10")
   * @param {number} subtotal - current cart subtotal (to validate minOrderValue)
   * @returns {{ success, coupon: { code, discountType, discountAmount } }}
   */
  async applyCoupon(code, subtotal) {
    const data = await apiInstance.post("/coupons/apply", { code, subtotal });
    return data; // { success, message, coupon }
  },

  /**
   * Create a new coupon (admin only).
   * @param {{ code, discountType, discountAmount, minOrderValue, expiryDate }} couponData
   */
  async createCoupon(couponData) {
    const data = await apiInstance.post("/coupons", couponData);
    return data.coupon;
  },

  /**
   * Delete a coupon by ID (admin only).
   */
  async deleteCoupon(id) {
    const data = await apiInstance.delete(`/coupons/${id}`);
    return data.success;
  },
};
