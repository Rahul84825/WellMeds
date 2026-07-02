import { authService } from "./authService";
import { productService } from "./productService";
import { categoryService } from "./categoryService";
import { orderService } from "./orderService";
import { prescriptionService } from "./prescriptionService";
import { cartService } from "./cartService";
import { couponService } from "./couponService";
import { specialityService } from "./specialityService";

// Wishlist service (inline)
import apiInstance from "./api";
const wishlistService = {
  async getWishlist() {
    const data = await apiInstance.get("/wishlist");
    return data.products || [];
  },
  async toggleWishlist(productId) {
    const data = await apiInstance.post("/wishlist/toggle", { productId });
    return data.products || [];
  },
};

// Admin service (inline) — maps to /api/admin/* routes
const adminService = {
  async getDashboardStats() {
    const data = await apiInstance.get("/admin/stats");
    return data; // { success, stats, recentOrders }
  },
  async getUsers() {
    const data = await apiInstance.get("/admin/users");
    return data.users || [];
  },
  async updateUserRole(id, role) {
    const data = await apiInstance.put(`/admin/users/${id}/role`, { role });
    return data.user;
  },
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const data = await apiInstance.post("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.url;
  }
};

export const api = {
  ...authService,
  ...productService,
  ...categoryService,
  ...orderService,
  ...prescriptionService,
  ...cartService,
  ...couponService,
  ...wishlistService,
  ...adminService,
  ...specialityService,
};
export default api;
