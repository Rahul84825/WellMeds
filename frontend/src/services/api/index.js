import { authService } from "./authService";
import { productService } from "./productService";
import { categoryService } from "./categoryService";
import { orderService } from "./orderService";
import { prescriptionService } from "./prescriptionService";
import { cartService } from "./cartService";
import { couponService } from "./couponService";
import { specialityService } from "./specialityService";
import { moleculeService } from "./moleculeService";
import { surgicalCategoryService } from "./surgicalCategoryService";
import { searchService } from "./searchService";
import { megaMenuService } from "./megaMenuService";

import apiInstance from "./api";

// Public Contact Service
const contactService = {
  async submitContactForm({ name, email, subject, message }) {
    const data = await apiInstance.post("/contact", { name, email, subject, message });
    return data;
  },
};

// Admin service (inline) — maps to /api/admin/* routes
const adminService = {
  async getDashboardStats() {
    const data = await apiInstance.get("/admin/stats");
    return data; // { success, stats, recentOrders }
  },
  async downloadSalesReport() {
    const token = localStorage.getItem("medishop_token");
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/admin/reports/sales`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to download sales report");
    return res.blob();
  },
  async downloadCustomersReport() {
    const token = localStorage.getItem("medishop_token");
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/admin/reports/customers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to download customer report");
    return res.blob();
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
  },

  // Waitlist Subscribers Management
  async getSubscribers({ page = 1, limit = 20, search = "", notified = "" } = {}) {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (notified) params.append("notified", notified);

    const data = await apiInstance.get(`/admin/subscribers?${params.toString()}`);
    return data;
  },

  async markSubscriberNotified(id) {
    const data = await apiInstance.put(`/admin/subscribers/${id}/notified`);
    return data;
  },

  async deleteSubscriber(id) {
    const data = await apiInstance.delete(`/admin/subscribers/${id}`);
    return data;
  },

  async bulkNotifySubscribers({ ids, subject, message }) {
    const data = await apiInstance.post("/admin/subscribers/bulk-notify", { ids, subject, message });
    return data;
  },

  async bulkDeleteSubscribers(ids) {
    const data = await apiInstance.post("/admin/subscribers/bulk-delete", { ids });
    return data;
  },

  async exportSubscribersCSV() {
    const token = localStorage.getItem("medishop_token");
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/admin/subscribers/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to export subscribers CSV");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wellmeds-subscribers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
  ...adminService,
  ...specialityService,
  ...moleculeService,
  ...surgicalCategoryService,
  ...searchService,
  ...megaMenuService,
  ...contactService,
};
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_MB = 10;

export default api;
