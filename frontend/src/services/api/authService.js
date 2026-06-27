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
      // skipAuthRetry: true — tells the interceptor NOT to call /auth/refresh
      // if this request returns 401. A guest user with no session is completely
      // normal; we simply return null without triggering the refresh chain.
      const data = await apiInstance.get("/auth/me", {
        skipAuthRetry: true,
      });
      if (data.success && data.user) {
        sessionStorage.setItem("medishop_user", JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      // 401 = no session (expected for guests) — clear any stale local state
      if (error.response?.status === 401) {
        localStorage.removeItem("medishop_token");
        sessionStorage.removeItem("medishop_user");
        return null;
      }
      // Network or server error — log for debugging but don't surface to user
      console.warn("Session check failed:", error.message);
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
