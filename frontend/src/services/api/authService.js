import apiInstance from "./api";

export const authService = {
  async loginWithGoogle(credential) {
    const data = await apiInstance.post("/auth/google", { credential });
    if (data.success && data.token) {
      localStorage.setItem("medishop_token", data.token);
      sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
    }
    return data.user;
  },

  async registerUser(name, email, password) {
    return await apiInstance.post("/auth/register", { name, email, password });
  },

  async loginUser(email, password) {
    const data = await apiInstance.post("/auth/login", { email, password });
    if (data.success && data.token) {
      localStorage.setItem("medishop_token", data.token);
      sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
    }
    return data.user;
  },

  async verifyEmail(token) {
    return await apiInstance.post("/auth/verify-email", { token });
  },

  async forgotPassword(email) {
    return await apiInstance.post("/auth/forgot-password", { email });
  },

  async resetPassword(token, password) {
    return await apiInstance.post("/auth/reset-password", { token, password });
  },

  async getCurrentUser() {
    try {
      const data = await apiInstance.get("/auth/me");
      if (data.success && data.user) {
        sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      console.warn("Session check failed, clearing local state:", error.message);
      localStorage.removeItem("medishop_token");
      sessionStorage.removeItem("medishop_user");
      return null;
    }
  },

  async logoutUser() {
    try {
      await apiInstance.post("/auth/logout");
    } catch (error) {
      console.warn("Server logout request failed:", error.message);
    } finally {
      localStorage.removeItem("medishop_token");
      sessionStorage.removeItem("medishop_user");
    }
    return true;
  },

  async updateProfile(profileData) {
    const data = await apiInstance.put("/auth/profile", profileData);
    if (data.success && data.user) {
      sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
    }
    return data.user;
  },
};
