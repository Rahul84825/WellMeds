import apiInstance from "./api";

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
      sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
    }
    return data.user;
  },

  async getCurrentUser() {
    try {
      const hasToken = !!localStorage.getItem("medishop_token");
      const data = await apiInstance.get("/auth/me", {
        skipAuthRetry: !hasToken,
      });
      if (data.success && data.user) {
        sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("medishop_token");
        localStorage.removeItem("medishop_refresh_token");
        sessionStorage.removeItem("medishop_user");
        return null;
      }
      console.warn("Session check failed (network/server error):", error.message);
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
      localStorage.removeItem("medishop_refresh_token");
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
