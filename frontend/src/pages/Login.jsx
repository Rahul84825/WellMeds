import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const Login = () => {
  const { loginWithGoogle, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
            Use your Google account to securely access prescriptions, order medicines, or access the management dashboard.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-primary-container/10 border border-primary/30 text-primary p-md rounded-lg text-body-sm flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Auth Button Container */}
        <div className="space-y-md">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-md gap-sm">
              <Loader size="lg" />
              <p className="text-body-sm text-on-surface-variant font-medium">Verifying credentials...</p>
            </div>
          ) : (
            <div className="py-md">
              <div id="google-signin-button" className="w-full min-h-[44px]"></div>
            </div>
          )}
        </div>

        {/* Informational Panel */}
        <div className="mt-lg bg-surface-container-low p-md rounded-lg border border-outline-variant/50 space-y-sm text-body-sm text-on-surface-variant">
          <span className="font-bold text-on-surface text-xs uppercase tracking-wide flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Unified Authentication
          </span>
          <p className="text-[12px] leading-relaxed">
            WellMeds uses a single, secure login portal for all accounts.
          </p>
          <ul className="list-disc pl-md text-[12px] space-y-1">
            <li>New users are automatically registered as customers.</li>
            <li>Admins are automatically identified by email and redirected to the pharmacy management panel.</li>
          </ul>
        </div>

        {/* Footer info */}
        <div className="mt-xl text-center text-body-xs text-on-surface-variant leading-relaxed">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;
