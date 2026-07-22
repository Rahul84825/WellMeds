import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const moleculeService = {
  async getMolecules(params = {}) {
    const isDefault = !params || Object.keys(params).length === 0;
    if (isDefault) {
      return fetchWithCache("molecules:all", async () => {
        const data = await apiInstance.get("/molecules");
        return data.molecules || [];
      }, 5 * 60 * 1000);
    }
    const data = await apiInstance.get("/molecules", { params });
    return data.molecules || [];
  },

  async getMolecule(slug) {
    return fetchWithCache(`molecule:${slug}`, async () => {
      const data = await apiInstance.get(`/molecules/${slug}`);
      return data.molecule;
    }, 5 * 60 * 1000);
  },

  async adminGetMolecules(params = {}) {
    const { search, page, limit } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;

    const data = await apiInstance.get("/molecules/admin/all", { params: cleanParams });
    return {
      molecules: data.molecules || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  async createMolecule(moleculeData) {
    const data = await apiInstance.post("/molecules", moleculeData);
    return data.molecule;
  },

  async updateMolecule(id, moleculeData) {
    const data = await apiInstance.put(`/molecules/${id}`, moleculeData);
    return data.molecule;
  },

  async deleteMolecule(id) {
    const data = await apiInstance.delete(`/molecules/${id}`);
    return data.success;
  }
};
