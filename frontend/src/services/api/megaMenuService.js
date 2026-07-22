import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const megaMenuService = {
  async getMegaMenu() {
    return fetchWithCache("megamenu:all", async () => {
      const data = await apiInstance.get("/megamenu");
      return data.data; // Grouped by section: conditions, specialities, sources, quickLinks
    });
  },

  async getAdminMegaMenu() {
    const data = await apiInstance.get("/megamenu/admin");
    return data.data;
  },

  async createMegaMenuItem(itemData) {
    const data = await apiInstance.post("/megamenu/admin", itemData);
    clearCache("megamenu");
    return data.data;
  },

  async updateMegaMenuItem(id, itemData) {
    const data = await apiInstance.put(`/megamenu/admin/${id}`, itemData);
    clearCache("megamenu");
    return data.data;
  },

  async deleteMegaMenuItem(id) {
    const data = await apiInstance.delete(`/megamenu/admin/${id}`);
    clearCache("megamenu");
    return data;
  },

  async reorderMegaMenuItems(ids) {
    const data = await apiInstance.put("/megamenu/admin/reorder", { ids });
    clearCache("megamenu");
    return data;
  }
};
