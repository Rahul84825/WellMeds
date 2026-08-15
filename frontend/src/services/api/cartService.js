import apiInstance from "./api";

export const cartService = {
  async getCart() {
    const data = await apiInstance.get("/cart");
    return data.items || [];
  },

  async addToCart(productId, quantity, variant) {
    const data = await apiInstance.post("/cart", { productId, quantity, variant });
    return data.items || [];
  },

  async updateCartQuantity(productId, quantity, variant) {
    const data = await apiInstance.put("/cart", {
      productId,
      quantity,
      variant,
      variantOption: variant?.option,
    });
    return data.items || [];
  },

  async removeFromCart(productId, variantOption) {
    const query = variantOption ? `?variantOption=${encodeURIComponent(variantOption)}` : "";
    const data = await apiInstance.delete(`/cart/${productId}${query}`);
    return data.items || [];
  },

  async clearCart() {
    const data = await apiInstance.delete("/cart");
    return data.items || [];
  }
};
