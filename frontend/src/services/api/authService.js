import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const authService = {
  /**
   * Send OTP to the given mobile number.
   * For new users, name and email are passed along (optional).
   * Returns { success, isExistingUser, devOtp? }
   */
  async sendOtp(mobile, name = "", email = "") {
    const data = await apiInstance.post("/auth/otp/send", { mobile, name, email });
    return data;
  },

  /**
   * Verify the OTP submitted by the user.
   * On success, stores JWT and user session.
   * Returns the user object.
   */
  async verifyOtp(mobile, otp, name = "", email = "") {
    const data = await apiInstance.post("/auth/otp/verify", { mobile, otp, name, email });
    if (data.success && data.token) {
      localStorage.setItem("medishop_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("medishop_refresh_token", data.refreshToken);
      }
      localStorage.setItem("medishop_user", JSON.stringify(data.user));
      clearCache("auth");
    }
    return data.user;
  },

  async getCurrentUser() {
    const hasToken = !!localStorage.getItem("medishop_token");
    if (!hasToken) {
      return null;
    }

    return fetchWithCache("auth:me", async () => {
      try {
        const data = await apiInstance.get("/auth/me");
        if (data.success && data.user) {
          localStorage.setItem("medishop_user", JSON.stringify(data.user));
          return data.user;
        }
        return null;
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("medishop_token");
          localStorage.removeItem("medishop_refresh_token");
          localStorage.removeItem("medishop_user");
          clearCache("auth");
          return null;
        }
        console.warn("Session check failed (network/server error):", error.message);
        return null;
      }
    }, 15 * 1000);
  },

  async logoutUser() {
    try {
      await apiInstance.post("/auth/logout");
    } catch (error) {
      console.warn("Server logout request failed:", error.message);
    } finally {
      localStorage.removeItem("medishop_token");
      localStorage.removeItem("medishop_refresh_token");
      localStorage.removeItem("medishop_user");
      clearCache("auth");
    }
  },

  async updateProfile(profileData) {
    const data = await apiInstance.put("/auth/profile", profileData);
    if (data.success && data.user) {
      localStorage.setItem("medishop_user", JSON.stringify(data.user));
    }
    return data.user;
  },

  async getSearchHistory() {
    const data = await apiInstance.get("/auth/search-history");
    return data.history || [];
  },

  async addSearchHistory(term) {
    const data = await apiInstance.post("/auth/search-history", { term });
    return data.history || [];
  },

  async clearSearchHistory() {
    const data = await apiInstance.delete("/auth/search-history");
    return data.history || [];
  },
};
