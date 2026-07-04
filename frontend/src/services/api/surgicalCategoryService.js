import apiInstance from "./api";

export const surgicalCategoryService = {
  async getSurgicalCategories() {
    const data = await apiInstance.get("/surgical-categories");
    return data.categories || [];
  },

  async getSurgicalCategory(slug) {
    const data = await apiInstance.get(`/surgical-categories/${slug}`);
    return data.category;
  },

  async adminGetSurgicalCategories(params = {}) {
    const { search, page, limit } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;

    const data = await apiInstance.get("/surgical-categories/admin/all", { params: cleanParams });
    return {
      categories: data.categories || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  async createSurgicalCategory(categoryData) {
    const data = await apiInstance.post("/surgical-categories", categoryData);
    return data.category;
  },

  async updateSurgicalCategory(id, categoryData) {
    const data = await apiInstance.put(`/surgical-categories/${id}`, categoryData);
    return data.category;
  },

  async deleteSurgicalCategory(id) {
    const data = await apiInstance.delete(`/surgical-categories/${id}`);
    return data.success;
  },

  async reorderSurgicalCategories(orders) {
    const data = await apiInstance.put("/surgical-categories/reorder", { orders });
    return data.success;
  }
};
