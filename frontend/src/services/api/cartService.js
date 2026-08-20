import apiInstance from "./api";

export const cartService = {
  async getCart() {
    const data = await apiInstance.get("/cart");
    return data.items || [];
  },

  async addToCart(productId, quantity, variantData = {}) {
    const payload = {
      productId,
      quantity,
      variantName: variantData.variantName || "",
      variantId: variantData.variantId || "",
      price: variantData.price,
    };
    const data = await apiInstance.post("/cart", payload);
    return data.items || [];
  },

  async updateCartQuantity(productId, quantity, variantData = {}) {
    const payload = {
      productId,
      quantity,
      variantName: variantData.variantName || "",
      variantId: variantData.variantId || "",
    };
    const data = await apiInstance.put("/cart", payload);
    return data.items || [];
  },

  async removeFromCart(productId, variantName = "") {
    const url = variantName ? `/cart/${productId}?variantName=${encodeURIComponent(variantName)}` : `/cart/${productId}`;
    const data = await apiInstance.delete(url);
    return data.items || [];
  },

  async clearCart() {
    const data = await apiInstance.delete("/cart");
    return data.items || [];
  }
};
