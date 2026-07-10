import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authService } from "../services/api/authService";
import Loader from "../components/Loader";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const hasTriggered = useRef(false);

  // States
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing from the URL.");
        return;
      }

      // Prevent duplicate execution in React StrictMode
      if (hasTriggered.current) return;
      hasTriggered.current = true;

      try {
        const res = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Your email has been successfully verified! You can now log in.");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(
          err.response?.data?.message || 
          "The verification link is invalid or has expired. Please register again or request a new link."
        );
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl text-center">
        
        {/* Loading State */}
        {status === "loading" && (
          <div className="py-xl space-y-md">
            <Loader size="lg" />
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Verifying Email
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Confirming your email verification credentials with the server. Please wait...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="py-md space-y-md animate-fade-in">
            <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              Email Verified!
            </h2>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {message}
            </p>
            <div className="pt-md">
              <Link
                to="/login"
                className="inline-flex w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 justify-center items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Proceed to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="py-md space-y-md animate-fade-in">
            <div className="inline-flex p-sm rounded-full bg-error/10 text-error mb-xs">
              <span className="material-symbols-outlined text-[48px]">cancel</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-error font-bold">
              Verification Failed
            </h2>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {message}
            </p>
            <div className="pt-md flex gap-sm">
              <Link
                to="/register"
                className="flex-1 py-sm px-md rounded-lg border border-outline text-on-surface text-body-sm font-bold hover:bg-surface-container transition-all duration-200 justify-center items-center flex"
              >
                Register Again
              </Link>
              <Link
                to="/login"
                className="flex-1 py-sm px-md rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:scale-[1.01] transition-all duration-200 justify-center items-center flex"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
