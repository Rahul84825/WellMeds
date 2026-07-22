import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const specialityService = {
  async getSpecialities() {
    return fetchWithCache("specialities:all", async () => {
      const data = await apiInstance.get("/specialities");
      return data.specialities || [];
    });
  },

  async getSpeciality(slug) {
    return fetchWithCache(`speciality:${slug}`, async () => {
      const data = await apiInstance.get(`/specialities/${slug}`);
      return data.speciality;
    });
  },

  async adminGetSpecialities(params = {}) {
    const { search, page, limit } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;

    const data = await apiInstance.get("/specialities/admin/all", { params: cleanParams });
    return {
      specialities: data.specialities || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  async createSpeciality(specialityData) {
    const data = await apiInstance.post("/specialities", specialityData);
    clearCache("spec");
    return data.speciality;
  },

  async updateSpeciality(id, specialityData) {
    const data = await apiInstance.put(`/specialities/${id}`, specialityData);
    clearCache("spec");
    return data.speciality;
  },

  async deleteSpeciality(id) {
    const data = await apiInstance.delete(`/specialities/${id}`);
    clearCache("spec");
    return data.success;
  }
};
