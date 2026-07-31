import apiInstance from "./api";

export const deliveryRuleService = {
  async calculateDeliveryFee({ subtotal, pincode, state }) {
    try {
      const data = await apiInstance.post("/delivery-rules/calculate", { subtotal, pincode, state });
      return data;
    } catch (err) {
      console.warn("Delivery rule calculation fallback:", err);
      const amount = Number(subtotal) || 0;
      const charge = amount >= 500 ? 0 : 50;
      return {
        success: true,
        charge,
        freeDeliveryThreshold: 500,
        message: charge === 0 ? "Eligible for Free Delivery" : `Standard delivery charge ₹${charge}`,
      };
    }
  },
};
