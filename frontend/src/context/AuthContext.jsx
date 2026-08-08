/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("medishop_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("medishop_token");
  });

  // Cart sync callbacks — arrays are stable refs, no re-render on push/pop
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

  // ── Session Bootstrap on App Mount ───────────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const existingToken = localStorage.getItem("medishop_token");
        if (existingToken) {
          // Fetch current user profile. If access token is expired, 
          // Axios response interceptor will automatically perform single-flight refresh.
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          if (currentUser) {
            onLoginCallbacks.forEach((fn) => fn(false).catch(() => {}));
          }
        }
      } catch (err) {
        console.debug("Auth session bootstrap completed (no active session):", err?.message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []); // eslint-disable-line

  // ── Synchronize Auth State Across Tabs ────────────────────────────────────
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === "medishop_token") {
        if (!e.newValue) {
          setUser(null);
        } else {
          try {
            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
          } catch {
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async (mobile, name = "", email = "") => {
    return await api.sendOtp(mobile, name, email);
  }, []);

  const [showWelcomeToast, setShowWelcomeToast] = useState(false);

  const triggerWelcomeToast = useCallback(() => {
    setShowWelcomeToast(true);
    setTimeout(() => {
      setShowWelcomeToast(false);
    }, 3500);
  }, []);

  // ── Verify OTP and auto-login ─────────────────────────────────────────────
  const verifyOtp = useCallback(async (mobile, otp, name = "", email = "") => {
    setLoading(true);
    try {
      const loggedUser = await api.verifyOtp(mobile, otp, name, email);
      setUser(loggedUser);
      triggerWelcomeToast();

      // Fire post-login callbacks (cart merge for initial login)
      onLoginCallbacks.forEach((fn) => fn(true).catch(() => {}));
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, [onLoginCallbacks, triggerWelcomeToast]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logoutUser();
      onLogoutCallbacks.forEach((fn) => fn());
      setUser(null);
      localStorage.removeItem("medishop_token");
      localStorage.removeItem("medishop_refresh_token");
      localStorage.removeItem("medishop_user");
      localStorage.removeItem("medishop_cart");
      localStorage.removeItem("medishop_guest_cart");
      localStorage.removeItem("wellmeds_cart_lock_sync");
      localStorage.setItem("wellmeds_auth_logout", Date.now().toString());
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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirect, setAuthModalRedirect] = useState(null);

  const openLoginModal = useCallback((redirectPath = null) => {
    setAuthModalRedirect(redirectPath);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalRedirect(null);
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
        isAuthModalOpen,
        openLoginModal,
        closeAuthModal,
        authModalRedirect,
        triggerWelcomeToast,
      }}
    >
      {/* Floating Welcome Toast */}
      {showWelcomeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] pointer-events-none animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 select-none">
            <div className="w-6 h-6 rounded-full bg-[#39b54a] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
              ✓
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100 tracking-tight">
              Welcome Back!
            </span>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
