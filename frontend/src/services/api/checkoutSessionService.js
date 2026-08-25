import apiInstance from "./api";

export const checkoutSessionService = {
  async initSession() {
    const data = await apiInstance.post("/checkout-session/init");
    return data;
  },

  async getSessionStatus() {
    const data = await apiInstance.get("/checkout-session/status");
    return data;
  },

  async getCheckoutSessionStatus() {
    const data = await apiInstance.get("/checkout-session/status");
    return data;
  },

  async getCartRxStatus() {
    const data = await apiInstance.get("/checkout-session/rx-status");
    return data;
  },

  async modifyCart() {
    const data = await apiInstance.post("/checkout-session/modify-cart");
    return data;
  },

  async releasePaymentLock() {
    const data = await apiInstance.post("/checkout-session/payment-cancelled");
    return data;
  },
};
