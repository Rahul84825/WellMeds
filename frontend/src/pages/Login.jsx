import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Login = ({ isAdminDefault }) => {
  const { login, logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdminMode, setIsAdminMode] = useState(isAdminDefault || false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = location.state?.from || "/";

  // Sync state if prop changes (e.g. navigation between /login and /admin/login)
  useEffect(() => {
    setIsAdminMode(isAdminDefault || false);
    setError("");
  }, [isAdminDefault]);

  // Automatic redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate(redirectUrl);
      }
    }
  }, [user, isAdmin, navigate, redirectUrl]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    setError("");
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "admin") {
        navigate("/admin");
      } else {
        if (isAdminMode) {
          setError("Access Denied: This account does not have administrator privileges.");
          await logout();
        } else {
          navigate(redirectUrl);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-xl px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>
      
      <div className={`relative w-full max-w-md bg-surface-container-lowest border rounded-xl p-lg shadow-xl text-left transition-all duration-300 ${
        isAdminMode ? "border-secondary/40 shadow-secondary/5" : "border-outline-variant"
      }`}>
        
        {/* Toggle between Customer and Admin Login */}
        <div className="flex border-b border-outline-variant mb-lg gap-sm">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setError("");
            }}
            className={`flex-1 pb-sm text-center font-label-md text-label-md transition-all ${
              !isAdminMode
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Customer Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setError("");
            }}
            className={`flex-1 pb-sm text-center font-label-md text-label-md transition-all ${
              isAdminMode
                ? "border-b-2 border-secondary text-secondary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Admin Sign In
          </button>
        </div>

        <div className="text-center space-y-sm mb-lg">
          <h2 className={`font-headline-lg text-headline-lg font-bold transition-colors ${
            isAdminMode ? "text-secondary" : "text-primary"
          }`}>
            {isAdminMode ? "Admin Portal" : "Welcome Back"}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {isAdminMode 
              ? "Secure pharmacist and management interface." 
              : "Sign in to access prescriptions and orders."}
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs mb-md animate-pulse">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-md">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-sm bg-surface-container-low border rounded-lg font-body-sm text-on-surface text-sm focus:ring-1 transition-all ${
                isAdminMode 
                  ? "border-outline-variant focus:ring-secondary focus:border-secondary" 
                  : "border-outline-variant focus:ring-primary focus:border-primary"
              }`}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-xs">
            <div className="flex justify-between items-center">
              <label className="block text-label-sm font-semibold text-on-surface">Password</label>
              {!isAdminMode && (
                <a href="#" className="text-[12px] text-primary hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-sm bg-surface-container-low border rounded-lg font-body-sm text-on-surface text-sm focus:ring-1 transition-all ${
                isAdminMode 
                  ? "border-outline-variant focus:ring-secondary focus:border-secondary" 
                  : "border-outline-variant focus:ring-primary focus:border-primary"
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-on-primary font-bold py-sm rounded-lg font-label-md active:scale-95 transition-all flex items-center justify-center gap-sm disabled:opacity-50 ${
              isAdminMode 
                ? "bg-secondary hover:bg-secondary/90" 
                : "bg-primary hover:bg-primary-container"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" color="white" />
                Signing in...
              </>
            ) : (
              isAdminMode ? "Admin Sign In" : "Sign In"
            )}
          </button>
        </form>

        {/* Info panel based on current portal */}
        {isAdminMode ? (
          <div className="mt-lg bg-surface-container-low p-md rounded-lg border border-outline-variant/50 space-y-sm text-body-sm text-on-surface-variant">
            <p className="font-bold text-on-surface text-xs uppercase tracking-wide">Clinic Administrator Portal:</p>
            <ul className="list-disc pl-md text-[12px] space-y-1">
              <li>Use registered administrative credentials:</li>
              <li>Login: <code className="font-bold text-on-surface">admin@medishop.com</code> / <code className="font-bold text-on-surface">admin123</code></li>
            </ul>
          </div>
        ) : (
          <div className="mt-lg bg-surface-container-low p-md rounded-lg border border-outline-variant/50 space-y-sm text-body-sm text-on-surface-variant">
            <p className="font-bold text-on-surface text-xs uppercase tracking-wide">Developer Credentials:</p>
            <ul className="list-disc pl-md text-[12px] space-y-1">
              <li>Client: <code className="font-bold text-on-surface">any email</code> / <code className="font-bold text-on-surface">any password</code></li>
            </ul>
          </div>
        )}

        <div className="mt-lg text-center text-body-sm text-on-surface-variant flex flex-col gap-sm">
          {!isAdminMode ? (
            <div>
              Are you pharmacy staff?{" "}
              <Link to="/admin/login" className="text-secondary hover:underline font-bold">
                Admin Portal Login
              </Link>
            </div>
          ) : (
            <div>
              Are you a customer?{" "}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Customer Portal Login
              </Link>
            </div>
          )}
          
          {!isAdminMode && (
            <div>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-bold">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
