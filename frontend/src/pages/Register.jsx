import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const Register = () => {
  const { loginWithGoogle, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Automatic redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, navigate]);

  // Google Sign-Up script dynamic loader
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
          document.getElementById("google-signup-button"),
          {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signup_with",
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
      setSuccessMessage("Registration successful! Redirecting...");
      
      setTimeout(() => {
        if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Google Sign-Up failed. Please check your account and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-xl px-margin-desktop bg-surface dark:bg-surface-dim transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-xl text-left">
        
        {/* Brand Header */}
        <div className="text-center space-y-sm mb-xl">
          <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
            <span className="material-symbols-outlined text-[32px]">person_add</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed-dim font-bold">
            Create Account
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            Register instantly using your Google account to track prescriptions, manage orders, and check out faster.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs mb-lg animate-pulse">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-primary-container/10 border border-primary/30 text-primary p-md rounded-lg text-body-sm flex items-center gap-xs mb-lg">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Sign Up Button */}
        <div className="space-y-md">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-md gap-sm">
              <Loader size="lg" />
              <p className="text-body-sm text-on-surface-variant font-medium">Creating account...</p>
            </div>
          ) : (
            <div className="py-md">
              <div id="google-signup-button" className="w-full min-h-[44px]"></div>
            </div>
          )}
        </div>

        {/* Informational Warning */}
        <div className="mt-lg bg-surface-container-low p-md rounded-lg border border-outline-variant/50 text-body-xs text-on-surface-variant leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>. Accounts are automatically initialized with the Customer role.
        </div>

        <div className="mt-lg text-center text-body-sm text-on-surface-variant dark:text-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="text-primary dark:text-primary-fixed-dim hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
