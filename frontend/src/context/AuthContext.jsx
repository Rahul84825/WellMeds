import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cart sync callbacks
  const [onLoginCallbacks] = useState([]);
  const [onLogoutCallbacks] = useState([]);

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

  // Session check on mount — silently handles guest state
  useEffect(() => {
    const checkUserSession = async () => {
      try {
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
    checkUserSession();
  }, []); // eslint-disable-line

  /**
   * Step 1 of OTP flow — request OTP send.
   * Returns { success, isExistingUser, devOtp? }
   */
  const sendOtp = async (mobile, name = "", email = "") => {
    return await api.sendOtp(mobile, name, email);
  };

  /**
   * Step 2 of OTP flow — verify OTP and auto-login.
   * Sets user in context on success.
   * Returns the user object.
   */
  const verifyOtp = async (mobile, otp, name = "", email = "") => {
    setLoading(true);
    try {
      const loggedUser = await api.verifyOtp(mobile, otp, name, email);
      setUser(loggedUser);
      onLoginCallbacks.forEach((fn) => fn().catch(() => {}));
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logoutUser();
      onLogoutCallbacks.forEach((fn) => fn());
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await api.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

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
