import apiInstance from "./api";

export const cartService = {
  async getCart() {
    const data = await apiInstance.get("/cart");
    return data.items || [];
  },

  async addToCart(productId, quantity) {
    const data = await apiInstance.post("/cart", { productId, quantity });
    return data.items || [];
  },

  async updateCartQuantity(productId, quantity) {
    const data = await apiInstance.put("/cart", { productId, quantity });
    return data.items || [];
  },

  async removeFromCart(productId) {
    const data = await apiInstance.delete(`/cart/${productId}`);
    return data.items || [];
  },

  async clearCart() {
    const data = await apiInstance.delete("/cart");
    return data.items || [];
  }
};
