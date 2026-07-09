import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
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

// Response Interceptor: Auto-refresh access token on 401, with guards and concurrent request queueing
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const refreshSessionToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  const storedRefreshToken = localStorage.getItem("medishop_refresh_token");

  refreshPromise = axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken: storedRefreshToken },
    { withCredentials: true }
  )
    .then((response) => {
      const { token, refreshToken } = response.data;
      if (!token) {
        throw new Error("No token returned from refresh response");
      }
      localStorage.setItem("medishop_token", token);
      if (refreshToken) {
        localStorage.setItem("medishop_refresh_token", refreshToken);
      }
      isRefreshing = false;
      refreshPromise = null;
      processQueue(null, token);
      return token;
    })
    .catch((error) => {
      isRefreshing = false;
      refreshPromise = null;
      processQueue(error, null);

      const isAuthError = error.response && (error.response.status === 401 || error.response.status === 400);
      if (isAuthError) {
        localStorage.removeItem("medishop_token");
        localStorage.removeItem("medishop_refresh_token");
        sessionStorage.removeItem("medishop_user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      throw error;
    });

  return refreshPromise;
};

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

    // Guard 3: Skip refresh/retry for OTP send/verify endpoints
    const isOtpEndpoint = originalRequest.url?.includes("/auth/otp/");
    if (isOtpEndpoint) {
      return Promise.reject(error);
    }

    // Guard 4: Skip refresh if the failing request IS the refresh endpoint itself
    // This prevents infinite retry loops
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");
    if (isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // Guard 5: Only retry once per request
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      console.log(`[AUTH] Queueing concurrent request: ${originalRequest.url}`);
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    try {
      console.log("[AUTH] Access token expired, initiating centralized refresh...");
      const newToken = await refreshSessionToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default apiInstance;
