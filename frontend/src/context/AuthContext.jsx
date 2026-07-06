import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";
import apiInstance from "../services/api/api";

export const AuthContext = createContext();

// ─── Decode JWT payload without verifying signature ───────────────────────────
const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ─── Check if token expires within the next N seconds ─────────────────────────
const isTokenExpiringSoon = (token, withinSeconds = 3600) => {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  const expiresInMs = decoded.exp * 1000 - Date.now();
  return expiresInMs < withinSeconds * 1000;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cart sync callbacks — arrays are stable refs, no re-render on push/pop
  const [onLoginCallbacks] = useState([]);
  const [onLogoutCallbacks] = useState([]);

  // Proactive refresh timer ref
  const refreshTimerRef = useRef(null);

  const registerLoginCallback = useCallback((fn) => {
    onLoginCallbacks.push(fn);
    return () => {
      const idx = onLoginCallbacks.indexOf(fn);
      if (idx > -1) onLoginCallbacks.splice(idx, 1);
    };
  }, [onLoginCallbacks]);

  const registerLogoutCallback = useCallback((fn) => {
    onLogoutCallbacks.push(fn);
    return () => {
      const idx = onLogoutCallbacks.indexOf(fn);
      if (idx > -1) onLogoutCallbacks.splice(idx, 1);
    };
  }, [onLogoutCallbacks]);

  // ── Schedule proactive token refresh ─────────────────────────────────────
  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (!token) return;

    const decoded = decodeJwt(token);
    if (!decoded?.exp) return;

    // Refresh 5 minutes before the access token expires
    const expiresInMs = decoded.exp * 1000 - Date.now();
    const refreshInMs = Math.max(expiresInMs - 5 * 60 * 1000, 10 * 1000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const response = await apiInstance.post("/auth/refresh", {});
        const newToken = response.token;
        if (newToken) {
          localStorage.setItem("medishop_token", newToken);
          scheduleTokenRefresh(newToken); // reschedule for the next cycle
        }
      } catch {
        // Silent — if refresh fails the 401 interceptor will handle it
      }
    }, refreshInMs);
  }, []);

  // ── Session bootstrap on mount ────────────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const existingToken = localStorage.getItem("medishop_token");

        // Proactive refresh: if token exists but expires within 1 hour, refresh first
        if (existingToken && isTokenExpiringSoon(existingToken, 3600)) {
          try {
            const refreshResponse = await apiInstance.post("/auth/refresh", {});
            const freshToken = refreshResponse.token;
            if (freshToken) {
              localStorage.setItem("medishop_token", freshToken);
              scheduleTokenRefresh(freshToken);
            }
          } catch {
            // Refresh failed — token might be usable as-is, let /me handle it
          }
        } else if (existingToken) {
          scheduleTokenRefresh(existingToken);
        }

        // Fetch current user profile
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          onLoginCallbacks.forEach((fn) => fn().catch(() => {}));
        }
      } catch (err) {
        console.debug("Auth session bootstrap completed (no session):", err?.message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async (mobile, name = "", email = "") => {
    return await api.sendOtp(mobile, name, email);
  }, []);

  // ── Verify OTP and auto-login ─────────────────────────────────────────────
  const verifyOtp = useCallback(async (mobile, otp, name = "", email = "") => {
    setLoading(true);
    try {
      const loggedUser = await api.verifyOtp(mobile, otp, name, email);
      setUser(loggedUser);

      // Schedule proactive token refresh for the new session
      const token = localStorage.getItem("medishop_token");
      if (token) scheduleTokenRefresh(token);

      // Fire post-login callbacks (cart merge)
      onLoginCallbacks.forEach((fn) => fn().catch(() => {}));
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, [onLoginCallbacks, scheduleTokenRefresh]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setLoading(true);
    try {
      await api.logoutUser();
      onLogoutCallbacks.forEach((fn) => fn());
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [onLogoutCallbacks]);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    const updatedUser = await api.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...updatedUser }));
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        isAdmin: user?.role === "admin",
        registerLoginCallback,
        registerLogoutCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
