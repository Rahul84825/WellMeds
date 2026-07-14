import apiInstance from "./api";

export const megaMenuService = {
  async getMegaMenu() {
    const data = await apiInstance.get("/megamenu");
    return data.data; // Grouped by section: conditions, specialities, sources, quickLinks
  },

  async getAdminMegaMenu() {
    const data = await apiInstance.get("/megamenu/admin");
    return data.data; // Grouped by section: conditions, specialities, sources, quickLinks
  },

  async createMegaMenuItem(itemData) {
    const data = await apiInstance.post("/megamenu/admin", itemData);
    return data.data;
  },

  async updateMegaMenuItem(id, itemData) {
    const data = await apiInstance.put(`/megamenu/admin/${id}`, itemData);
    return data.data;
  },

  async deleteMegaMenuItem(id) {
    const data = await apiInstance.delete(`/megamenu/admin/${id}`);
    return data;
  },

  async reorderMegaMenuItems(ids) {
    const data = await apiInstance.put("/megamenu/admin/reorder", { ids });
    return data;
  }
};
