import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/api/authService";
import SEO from "../components/common/SEO";
import { Mail, ShieldCheck, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

/**
 * ForgotPassword Page — Password recovery request page for WellMeds.
 * Uses email-based recovery without OTP / SMS.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessMessage(
        res.message || "If an account with that email address exists, a password reset link has been dispatched."
      );
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-[fade-in_0.25s_ease-out]">
      <SEO
        title="Forgot Password — WellMeds"
        description="Reset your WellMeds account password safely via email."
      />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[32px] shadow-2xl p-6 sm:p-10 text-left">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Enter your registered email address below to receive password recovery instructions.
          </p>
        </div>

        {/* Success Card */}
        {successMessage ? (
          <div className="text-center space-y-4 py-4 animate-[fade-in_0.2s_ease-out]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              Check Your Email
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#157a6d] hover:bg-[#0f5c52] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-4 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-[#157a6d] rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#157a6d] hover:bg-[#0f5c52] disabled:opacity-60 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Link
                to="/login"
                className="text-xs font-bold text-[#157a6d] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
