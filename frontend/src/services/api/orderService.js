import apiInstance from "./api";

export const orderService = {
  /**
   * Admin: Get all orders
   */
  async getOrders() {
    const data = await apiInstance.get("/orders/all");
    return data.orders || [];
  },

  /**
   * Patient: Get logged-in user's orders (JWT identifies the user)
   */
  async getUserOrders() {
    const data = await apiInstance.get("/orders");
    return data.orders || [];
  },

  /**
   * Place a new order
   */
  async placeOrder(orderData) {
    const data = await apiInstance.post("/orders", orderData);
    return data.order;
  },

  /**
   * Create Razorpay order session
   */
  async createRazorpayOrder(orderSessionData) {
    const data = await apiInstance.post("/orders/razorpay", orderSessionData);
    return data;
  },

  /**
   * Check order payment status (polling)
   */
  async getOrderStatus(razorpayOrderId) {
    const data = await apiInstance.get(`/orders/status/${razorpayOrderId}`);
    return data;
  },

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(id, status) {
    const data = await apiInstance.put(`/orders/${id}/status`, { status });
    return data.order;
  },

  /**
   * Cancel an order (patient or admin)
   */
  async cancelOrder(id) {
    const data = await apiInstance.put(`/orders/${id}/cancel`);
    return data.order;
  },
};
