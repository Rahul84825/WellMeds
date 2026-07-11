import apiInstance from "./api";

export const prescriptionService = {
  /**
   * Upload a new prescription file.
   * @param {File} file - the prescription file (PDF/JPG/PNG)
   */
  async uploadPrescription(file, cartSnapshot) {
    const formData = new FormData();
    formData.append("prescription", file);
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
   * Get a single prescription by ID (patient access).
   */
  async getPrescription(id) {
    const data = await apiInstance.get(`/prescriptions/${id}`);
    return data.prescription;
  },

  /**
   * Delete a prescription by ID (patient access, non-approved only).
   */
  async deletePrescription(id) {
    const data = await apiInstance.delete(`/prescriptions/${id}`);
    return data.success;
  },

  // ── Admin ────────────────────────────────────────────

  /**
   * Get all prescriptions (admin). Optional filters: status, search.
   * Routes to /prescriptions/all to avoid conflict with patient /:id
   */
  async getAllPrescriptions(params = {}) {
    const data = await apiInstance.get("/prescriptions/all", { params });
    return data.prescriptions || [];
  },

  /**
   * Approve a prescription (admin).
   */
  async approvePrescription(id, adminNotes = "") {
    const data = await apiInstance.put(`/prescriptions/${id}/approve`, { adminNotes });
    return data.prescription;
  },

  /**
   * Reject a prescription (admin).
   */
  async rejectPrescription(id, adminNotes = "") {
    const data = await apiInstance.put(`/prescriptions/${id}/reject`, { adminNotes });
    return data.prescription;
  },

  /**
   * Update prescription status generically (admin).
   */
  async updatePrescriptionStatus(id, status, adminNotes = "") {
    const data = await apiInstance.put(`/prescriptions/${id}/status`, { status, adminNotes });
    return data.prescription;
  },
};
