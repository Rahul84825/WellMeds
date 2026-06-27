import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach bearer token from localStorage
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("medishop_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh access token on 401, with guards
apiInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Guard 1: Only attempt refresh on 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Guard 2: Skip refresh if the caller opted out (e.g. initial session bootstrap)
    // This prevents guest users from triggering a pointless /auth/refresh call
    if (originalRequest.skipAuthRetry) {
      return Promise.reject(error);
    }

    // Guard 3: Skip refresh if the failing request IS the refresh endpoint itself
    // This prevents infinite retry loops
    const isRefreshEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/me");
    if (isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // Guard 4: Only retry once per request
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Attempt to get a new access token using the HttpOnly refresh cookie
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const { token } = response.data;

      // Persist new access token and retry the original request
      localStorage.setItem("medishop_token", token);
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return apiInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear local session state
      localStorage.removeItem("medishop_token");
      sessionStorage.removeItem("medishop_user");

      // Only redirect to login if not already there
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default apiInstance;
