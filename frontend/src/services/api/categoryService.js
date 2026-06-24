import apiInstance from "./api";

export const categoryService = {
  async getCategories() {
    const data = await apiInstance.get("/categories");
    return data.categories || [];
  },

  async createCategory(name, icon) {
    const data = await apiInstance.post("/categories", { name, icon });
    return data.category;
  },

  async deleteCategory(id) {
    const data = await apiInstance.delete(`/categories/${id}`);
    return data.success;
  }
};
