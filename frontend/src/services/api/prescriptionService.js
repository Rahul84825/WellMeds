import apiInstance from "./api";

export const prescriptionService = {
  /**
   * Upload a new prescription file (supports single File or array of Files).
   */
  async uploadPrescription(files, patientNotes = "", cartSnapshot = null) {
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

    const data = await apiInstance.post("/prescriptions/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
   * Delete a prescription by ID.
   */
  async deletePrescription(id) {
    const data = await apiInstance.delete(`/prescriptions/${id}`);
    return data.success;
  },

  // ── Admin ────────────────────────────────────────────

  /**
   * Get all prescriptions (admin). Optional filters: status, search.
   */
  async getAllPrescriptions(params = {}) {
    const data = await apiInstance.get("/prescriptions/all", { params });
    return data.prescriptions || [];
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
