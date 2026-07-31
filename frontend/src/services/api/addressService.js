import apiInstance from "./api";

export const addressService = {
  async getAddresses() {
    const data = await apiInstance.get("/addresses");
    return data.addresses || [];
  },

  async addAddress(addressData) {
    const data = await apiInstance.post("/addresses", addressData);
    return data.address;
  },

  async updateAddress(id, addressData) {
    const data = await apiInstance.put(`/addresses/${id}`, addressData);
    return data.address;
  },

  async deleteAddress(id) {
    const data = await apiInstance.delete(`/addresses/${id}`);
    return data;
  },

  async setDefaultAddress(id) {
    const data = await apiInstance.patch(`/addresses/${id}/default`);
    return data.address;
  },
};
