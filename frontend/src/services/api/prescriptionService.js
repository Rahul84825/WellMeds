import apiInstance from "./api";

export const prescriptionService = {
  /**
   * Upload a new prescription file (supports single File or array of Files).
   * @param {File|File[]} files
   * @param {string} patientNotes
   * @param {object|null} cartSnapshot
   * @param {string} source "DIRECT_UPLOAD" | "CHECKOUT_UPLOAD"
   */
  async uploadPrescription(files, patientNotes = "", cartSnapshot = null, source = "DIRECT_UPLOAD") {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : [files];
    
    fileList.forEach((file) => {
      formData.append("prescription", file);
    });

    if (patientNotes) {
      formData.append("patientNotes", patientNotes);
    }

    if (cartSnapshot) {
      formData.append("cartSnapshot", JSON.stringify(cartSnapshot));
    }

    if (source) {
      formData.append("source", source);
    }

    const data = await apiInstance.post("/prescriptions/upload", formData);
    return data;
  },

  /**
   * Get the logged-in user's prescriptions.
   */
  async getMyPrescriptions() {
    const data = await apiInstance.get("/prescriptions/my");
    return data.prescriptions || [];
  },

  /**
   * Get a single prescription by ID.
   */
  async getPrescription(id) {
    const data = await apiInstance.get(`/prescriptions/${id}`);
    return data.prescription;
  },

  /**
   * Checkout an approved prescription (populates cart with prescribed items).
   */
  async checkoutPrescription(id) {
    const data = await apiInstance.post(`/prescriptions/${id}/checkout`);
    return data;
  },

  /**
   * Select a matching approved prescription for current cart checkout.
   */
  async selectPrescriptionForCart(id) {
    const data = await apiInstance.post(`/prescriptions/${id}/select`);
    return data;
  },

  /**
   * Delete a prescription by ID.
   */
  async deletePrescription(id) {
    const data = await apiInstance.delete(`/prescriptions/${id}`);
    return data.success;
  },

  // ── Admin ────────────────────────────────────────────

  /**
   * Get all prescriptions (admin). Optional filters: status, search, source.
   */
  async getAllPrescriptions(params = {}) {
    const data = await apiInstance.get("/prescriptions/all", { params });
    return data.prescriptions || [];
  },

  /**
   * Create a locked prescription cart for Direct Upload RX (admin pharmacist Workflow A).
   */
  async createCartForPrescription(id, payload = {}) {
    const data = await apiInstance.post(`/prescriptions/${id}/create-cart`, payload);
    return data;
  },

  /**
   * Update prescribed items & notes on a prescription (admin pharmacist).
   */
  async updatePrescriptionItems(id, payload = {}) {
    const data = await apiInstance.put(`/prescriptions/${id}/items`, payload);
    return data.prescription;
  },

  /**
   * Approve a prescription (admin).
   */
  async approvePrescription(id, payload = {}) {
    const body = typeof payload === "string" ? { adminNotes: payload } : payload;
    const data = await apiInstance.put(`/prescriptions/${id}/approve`, body);
    return data.prescription;
  },

  /**
   * Reject a prescription (admin).
   */
  async rejectPrescription(id, payload = {}) {
    const body = typeof payload === "string" ? { adminNotes: payload } : payload;
    const data = await apiInstance.put(`/prescriptions/${id}/reject`, body);
    return data.prescription;
  },

  /**
   * Update prescription status generically (admin).
   */
  async updatePrescriptionStatus(id, status, adminNotes = "", extra = {}) {
    const data = await apiInstance.put(`/prescriptions/${id}/status`, { status, adminNotes, ...extra });
    return data.prescription;
  },
};
