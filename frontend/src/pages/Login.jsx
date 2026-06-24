import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const Login = () => {
  const { loginWithGoogle, loginUser, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const redirectUrl = location.state?.from || "/";

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

  // Google Sign-In script dynamic loader and initializer
  useEffect(() => {
    const scriptId = "google-jssdk";
    let script = document.getElementById(scriptId);

    const initializeGoogleButton = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1028710325492-mockid.apps.googleusercontent.com",
          callback: handleGoogleCallback,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill",
          }
        );
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleButton();
      };
      document.head.appendChild(script);
    } else {
      if (window.google) {
        initializeGoogleButton();
      } else {
        script.onload = () => {
          initializeGoogleButton();
        };
      }
    }
  }, []); // eslint-disable-line

  const handleGoogleCallback = async (response) => {
    const credential = response.credential;
    if (!credential) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const loggedUser = await loginWithGoogle(credential);
      setSuccessMessage("Sign-in successful! Redirecting...");
      
      setTimeout(() => {
        if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectUrl);
        }
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Google Authentication failed. Please check your account and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const loggedUser = await loginUser(email, password);
      setSuccessMessage("Sign-in successful! Redirecting...");
      
      setTimeout(() => {
        if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectUrl);
        }
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Authentication failed. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-xl px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>
      
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl text-left">
        
        {/* Brand Header */}
        <div className="text-center space-y-sm mb-lg">
          <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
            <span className="material-symbols-outlined text-[32px]">local_hospital</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
            Sign In to WellMeds
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Access your patient profile, prescriptions, and pharmacy dashboard.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-start gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px] mt-[2px] flex-shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-primary-container/10 border border-primary/30 text-primary p-md rounded-lg text-body-sm flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Forms */}
        <div className="space-y-md">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-xl gap-sm">
              <Loader size="lg" />
              <p className="text-body-sm text-on-surface-variant font-medium">Verifying credentials...</p>
            </div>
          ) : (
            <>
              {/* Google Sign-In */}
              <div className="flex justify-center py-xs">
                <div id="google-signin-button" className="min-h-[44px]"></div>
              </div>

              {/* Divider */}
              <div className="relative flex py-xs items-center">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-md text-on-surface-variant font-body-sm text-[11px] font-bold uppercase tracking-wider">
                  or continue with email
                </span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-md">
                <div className="space-y-xs">
                  <label htmlFor="email" className="block font-body-sm text-sm font-bold text-on-surface">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block font-body-sm text-sm font-bold text-on-surface">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="font-body-sm text-xs font-bold text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                      lock
                    </span>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign In</span>
                </button>
              </form>

              {/* Create Account Link */}
              <div className="text-center text-body-sm text-on-surface-variant mt-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-bold">
                  Create Account
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Developer Sandbox Section */}
        {import.meta.env.DEV && (
          <div className="mt-md pt-md border-t border-outline-variant/40 space-y-sm">
            <div className="flex items-center gap-xs text-body-xs font-bold text-primary uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              Developer Sandbox Access
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Use these quick-connect buttons to bypass Google OAuth and test roles in the development environment.
            </p>
            <div className="flex flex-wrap gap-xs">
              <button
                type="button"
                onClick={() => handleGoogleCallback({ credential: "mock_admin_token" })}
                className="flex-1 min-w-[120px] py-sm px-md rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-body-xs font-bold transition-all duration-200 border border-primary/20 flex items-center justify-center gap-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                Admin Bypass
              </button>
              <button
                type="button"
                onClick={() => handleGoogleCallback({ credential: "mock_customer_token" })}
                className="flex-1 min-w-[120px] py-sm px-md rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-body-xs font-bold transition-all duration-200 border border-secondary/20 flex items-center justify-center gap-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[14px]">person</span>
                Customer Bypass
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-xl text-center text-body-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-sm">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;
