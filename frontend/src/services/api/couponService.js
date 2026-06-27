import apiInstance from "./api";

export const couponService = {
  /**
   * Validate a coupon code at checkout (backend calculation).
   * @param {string} code
   * @param {number} subtotal
   * @returns {{ success, message, coupon: { code, discountType, discountValue }, discountAmount, finalAmount }}
   */
  async validateCoupon(code, subtotal) {
    const data = await apiInstance.post("/coupons/validate", { code, subtotal });
    return data; // { success, message, coupon, discountAmount, finalAmount }
  },

  /**
   * Apply coupon fallback.
   */
  async applyCoupon(code, subtotal) {
    return this.validateCoupon(code, subtotal);
  },

  /**
   * Get all active, non-expired coupons (customer).
   */
  async getCoupons() {
    const data = await apiInstance.get("/coupons");
    return data.coupons || [];
  },

  /**
   * Get all coupons with analytics (admin only).
   */
  async adminGetCoupons() {
    const data = await apiInstance.get("/admin/coupons");
    return data.coupons || [];
  },

  /**
   * Create a new coupon (admin only).
   */
  async adminCreateCoupon(couponData) {
    const data = await apiInstance.post("/admin/coupons", couponData);
    return data.coupon;
  },

  /**
   * Update an existing coupon (admin only).
   */
  async adminUpdateCoupon(id, couponData) {
    const data = await apiInstance.put(`/admin/coupons/${id}`, couponData);
    return data.coupon;
  },

  /**
   * Delete a coupon by ID (admin only).
   */
  async adminDeleteCoupon(id) {
    const data = await apiInstance.delete(`/admin/coupons/${id}`);
    return data.success;
  },
  
  // Legacy backups
  async createCoupon(couponData) {
    return this.adminCreateCoupon(couponData);
  },
  async deleteCoupon(id) {
    return this.adminDeleteCoupon(id);
  }
};
