import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SEO from "../components/common/SEO";
import { ShieldCheck, Phone, ArrowRight, Loader2, LogOut, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Atmospheric background stars configuration matching WellMeds auth pages
 */
const STARS = [
  { left: "2%", top: "11%", width: "1.6px", height: "1.6px", opacity: 0.32 },
  { left: "14%", top: "11%", width: "1.4px", height: "1.4px", opacity: 0.34 },
  { left: "15%", top: "74%", width: "2.1px", height: "2.1px", opacity: 0.18 },
  { left: "54%", top: "45%", width: "1.7px", height: "1.7px", opacity: 0.40 },
  { left: "9%", top: "2%", width: "2.5px", height: "2.5px", opacity: 0.25 },
  { left: "20%", top: "33%", width: "1.6px", height: "1.6px", opacity: 0.39 },
  { left: "21%", top: "22%", width: "1.9px", height: "1.9px", opacity: 0.29 },
  { left: "95%", top: "84%", width: "1.6px", height: "1.6px", opacity: 0.20 },
  { left: "84%", top: "98%", width: "1.0px", height: "1.0px", opacity: 0.33 },
  { left: "87%", top: "65%", width: "1.3px", height: "1.3px", opacity: 0.35 },
  { left: "73%", top: "19%", width: "2.0px", height: "2.0px", opacity: 0.20 },
  { left: "4%", top: "34%", width: "1.5px", height: "1.5px", opacity: 0.25 },
  { left: "65%", top: "84%", width: "2.5px", height: "2.5px", opacity: 0.39 },
  { left: "99%", top: "79%", width: "1.5px", height: "1.5px", opacity: 0.19 },
  { left: "62%", top: "55%", width: "2.1px", height: "2.1px", opacity: 0.17 },
  { left: "19%", top: "92%", width: "2.0px", height: "2.0px", opacity: 0.32 },
  { left: "10%", top: "40%", width: "2.5px", height: "2.5px", opacity: 0.31 },
  { left: "99%", top: "20%", width: "1.7px", height: "1.7px", opacity: 0.35 },
  { left: "45%", top: "79%", width: "1.9px", height: "1.9px", opacity: 0.18 },
  { left: "10%", top: "98%", width: "1.2px", height: "1.2px", opacity: 0.20 },
  { left: "34%", top: "71%", width: "2.4px", height: "2.4px", opacity: 0.27 },
  { left: "50%", top: "79%", width: "1.4px", height: "1.4px", opacity: 0.24 },
  { left: "61%", top: "64%", width: "1.1px", height: "1.1px", opacity: 0.18 },
  { left: "14%", top: "73%", width: "2.1px", height: "2.1px", opacity: 0.39 },
  { left: "77%", top: "26%", width: "2.2px", height: "2.2px", opacity: 0.40 },
  { left: "35%", top: "1%", width: "1.6px", height: "1.6px", opacity: 0.22 },
  { left: "18%", top: "5%", width: "1.2px", height: "1.2px", opacity: 0.37 },
  { left: "5%", top: "61%", width: "1.3px", height: "1.3px", opacity: 0.20 },
  { left: "82%", top: "30%", width: "1.3px", height: "1.3px", opacity: 0.26 },
  { left: "70%", top: "52%", width: "2.4px", height: "2.4px", opacity: 0.25 },
];

/**
 * Sanitize destination paths to prevent open-redirect vulnerabilities.
 */
const sanitizeReturnTo = (target) => {
  if (!target || typeof target !== "string") return "/";
  const trimmed = target.trim();
  // Must start with a single slash and not '//' or contain protocol schemes
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes("://") ||
    trimmed.startsWith("/login") ||
    trimmed.startsWith("/register") ||
    trimmed.startsWith("/complete-profile")
  ) {
    return "/";
  }
  return trimmed;
};

const CompleteProfilePage = () => {
  const { user, loading, updateProfile, logout, isAdmin, profileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobile, setMobile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Calculate sanitized return destination
  const searchParams = new URLSearchParams(location.search);
  const rawReturnTo = searchParams.get("returnTo") || searchParams.get("from") || searchParams.get("redirect");
  const targetDestination = sanitizeReturnTo(rawReturnTo);

  // If user is not authenticated or is already complete, redirect appropriately
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    if (profileComplete) {
      navigate(targetDestination, { replace: true });
    }
  }, [user, loading, profileComplete, isAdmin, navigate, targetDestination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const clean = mobile.replace(/\D/g, "");
    if (!clean) {
      setErrorMsg("Please enter your mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(clean)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({ mobile: clean });
      // On success, redirect to intended destination
      navigate(targetDestination, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Unable to update your profile. Please check your mobile number and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#157a6d]" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 sm:p-6"
      style={{
        background: `
          repeating-linear-gradient(0deg, rgba(15,59,52,0.05) 0px, rgba(15,59,52,0.05) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(15,59,52,0.05) 0px, rgba(15,59,52,0.05) 1px, transparent 1px, transparent 40px),
          radial-gradient(ellipse at 50% 0%, #eef5f0 0%, #dfebe3 85%)
        `,
        fontFamily: "'Liberation Sans', 'DejaVu Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
      }}
    >
      <SEO
        title="Complete Profile — Wellmeds"
        description="Enter your mobile number to complete your Wellmeds customer account and start ordering."
        noindex={true}
      />

      {/* Atmospheric Star Points */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {STARS.map((star, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-[#157a6d]"
            style={{
              left: star.left,
              top: star.top,
              width: star.width,
              height: star.height,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Central Soft Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[580px] sm:h-[580px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(21,122,109,0.14) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white border border-[#a8c2b6] rounded-[22px] p-6 sm:p-8 shadow-[0_20px_45px_rgba(23,43,38,0.13)]">
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#157a6d] border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Phone className="w-7 h-7" />
          </div>

          {/* Titles */}
          <h1 className="text-[22px] sm:text-[24px] text-[#172b26] font-bold text-center mb-1 tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-[12.5px] text-[#3f544d] text-center mb-5 leading-relaxed">
            Please provide your 10-digit mobile number to activate clinical ordering and prescription delivery.
          </p>

          {/* User Account Info Pill */}
          {user && (
            <div className="flex items-center justify-between gap-3 bg-[#f7f9f8] border border-[#d6e2dc] rounded-xl px-3.5 py-2.5 mb-5 text-left text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#157a6d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#172b26] truncate leading-tight">{user.name || "Customer"}</p>
                  <p className="text-[11px] text-[#6f847c] truncate leading-tight">{user.email || ""}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-[11px] font-bold text-[#157a6d] hover:text-red-600 hover:underline shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Sign in with a different account"
              >
                {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                <span>Switch</span>
              </button>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 text-left animate-[shake_0.2s_ease-in-out]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="text-left">
              <label
                htmlFor="complete-profile-mobile"
                className="block text-[11px] text-[#172b26] font-bold uppercase tracking-wider mb-1.5"
              >
                MOBILE NUMBER <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[12px] px-3.5 py-3 transition-all duration-150">
                <div className="flex items-center gap-2 border-r border-[#cfded6] pr-3 mr-3 select-none shrink-0">
                  <span className="text-[10.5px] font-bold text-[#157a6d] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded leading-none">
                    IN
                  </span>
                  <span className="text-[14px] font-bold text-[#172b26] font-mono whitespace-nowrap leading-none">
                    +91
                  </span>
                </div>
                <input
                  id="complete-profile-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                  required
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setErrorMsg("");
                  }}
                  placeholder="98765 43210"
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] text-[#172b26] placeholder:text-[#8ea39b] font-mono font-semibold tracking-wider"
                />
              </div>
              <p className="text-[10.5px] text-[#6f847c] mt-1.5 leading-normal">
                Used strictly for delivery coordination and clinical pharmacist consultations.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mobile.replace(/\D/g, "").length !== 10}
              className="w-full bg-[#157a6d] hover:bg-[#0e5c52] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] tracking-[0.5px] py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(21,122,109,0.25)] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SAVING PROFILE...</span>
                </>
              ) : (
                <>
                  <span>SAVE & CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Verification Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#6f847c]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#157a6d]" />
              <span>256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#157a6d]" />
              <span>Licensed Clinical Pharmacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
