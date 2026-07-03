import apiInstance from "./api";

export const moleculeService = {
  async getMolecules(params = {}) {
    const data = await apiInstance.get("/molecules", { params });
    return data.molecules || [];
  },

  async getMolecule(slug) {
    const data = await apiInstance.get(`/molecules/${slug}`);
    return data.molecule;
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
