import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const categoryService = {
  async getCategories() {
    return fetchWithCache("categories:all", async () => {
      const data = await apiInstance.get("/categories");
      return data.categories || [];
    });
  },

  async getCategory(slugOrId) {
    return fetchWithCache(`category:${slugOrId}`, async () => {
      const data = await apiInstance.get(`/categories/${encodeURIComponent(slugOrId)}`);
      return data.category || null;
    });
  },

  async createCategory(categoryData) {
    const payload = typeof categoryData === "string"
      ? { name: categoryData, icon: arguments[1] || "category" }
      : categoryData;

    const data = await apiInstance.post("/categories", payload);
    clearCache("cat");
    return data.category;
  },

  async updateCategory(id, categoryData) {
    const data = await apiInstance.put(`/categories/${id}`, categoryData);
    clearCache("cat");
    return data.category;
  },

  async deleteCategory(id) {
    const data = await apiInstance.delete(`/categories/${id}`);
    clearCache("cat");
    return data.success;
  }
};
