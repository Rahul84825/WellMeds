// Deprecated Map Location Service — Pan-India Delivery Active
export const locationService = {
  async getStoreLocation() {
    return {
      name: "WellMeds Pharmacy",
      address: "Baner Main Road, High Street, Baner, Pune 411045",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411045",
      phone: "+91-800-WELLMEDS",
      email: "info@wellmeds.in",
      panIndiaDelivery: true,
    };
  },
  async validateDelivery() {
    return {
      isEligible: true,
      message: "Pan-India Express Delivery Available",
    };
  },
};
