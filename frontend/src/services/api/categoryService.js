import apiInstance from "./api";

export const categoryService = {
  async getCategories() {
    const data = await apiInstance.get("/categories");
    return data.categories || [];
  },

  async createCategory(categoryData) {
    // Check if passed legacy name and icon parameters, and convert to object
    const payload = typeof categoryData === "string"
      ? { name: categoryData, icon: arguments[1] || "category" }
      : categoryData;

    const data = await apiInstance.post("/categories", payload);
    return data.category;
  },

  async updateCategory(id, categoryData) {
    const data = await apiInstance.put(`/categories/${id}`, categoryData);
    return data.category;
  },

  async deleteCategory(id) {
    const data = await apiInstance.delete(`/categories/${id}`);
    return data.success;
  }
};
