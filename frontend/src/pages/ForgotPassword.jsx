import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/api/authService";
import Loader from "../components/Loader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Gmail validation
    if (!/@gmail\.com$/i.test(email.trim())) {
      setError("Only Gmail addresses are supported for recovery.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.message || "A password recovery link has been sent to your Gmail account.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "An error occurred while dispatching the recovery email. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-xl px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl text-left">
        
        {/* Success Card */}
        {successMessage ? (
          <div className="text-center space-y-md py-md animate-fade-in">
            <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
              <span className="material-symbols-outlined text-[48px]">mail_lock</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              Check Your Inbox
            </h2>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {successMessage}
            </p>
            <p className="text-[11px] text-on-surface-variant/70 italic">
              (Note: For development setups without SMTP, the verification link is also printed in the backend terminal logs.)
            </p>
            <div className="pt-md">
              <Link
                to="/login"
                className="inline-flex w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 justify-center items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="text-center space-y-sm mb-lg">
              <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
                <span className="material-symbols-outlined text-[32px]">lock_reset</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                Reset Password
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter your Gmail address below, and we'll send you a secure link to reset your account credentials.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-start gap-xs mb-md animate-pulse">
                <span className="material-symbols-outlined text-[18px] mt-[2px] flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Recovery Form */}
            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label htmlFor="email" className="block font-body-sm text-sm font-bold text-on-surface">
                  Gmail Address
                </label>
                <div className="relative">
                  <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader size="sm" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Send Recovery Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-body-sm text-on-surface-variant mt-md pt-sm border-t border-outline-variant/20">
              Never mind, take me{" "}
              <Link to="/login" className="text-primary hover:underline font-bold">
                back to Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
