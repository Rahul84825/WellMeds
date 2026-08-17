import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import CompleteProfileModal from "../components/auth/CompleteProfileModal";
import SEO from "../components/common/SEO";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Atmospheric background stars configuration
 */
const REGISTER_STARS = [
  { left: "98%", top: "6%", width: "2.2px", height: "2.2px", opacity: 0.27 },
  { left: "94%", top: "45%", width: "2.5px", height: "2.5px", opacity: 0.19 },
  { left: "99%", top: "45%", width: "1.3px", height: "1.3px", opacity: 0.24 },
  { left: "63%", top: "4%", width: "1.6px", height: "1.6px", opacity: 0.15 },
  { left: "7%", top: "19%", width: "1.4px", height: "1.4px", opacity: 0.22 },
  { left: "78%", top: "46%", width: "2.4px", height: "2.4px", opacity: 0.37 },
  { left: "90%", top: "95%", width: "1.9px", height: "1.9px", opacity: 0.32 },
  { left: "88%", top: "60%", width: "1.2px", height: "1.2px", opacity: 0.28 },
  { left: "53%", top: "20%", width: "1.1px", height: "1.1px", opacity: 0.20 },
  { left: "70%", top: "89%", width: "2.1px", height: "2.1px", opacity: 0.26 },
  { left: "3%", top: "1%", width: "2.0px", height: "2.0px", opacity: 0.28 },
  { left: "46%", top: "19%", width: "1.2px", height: "1.2px", opacity: 0.20 },
  { left: "13%", top: "66%", width: "1.5px", height: "1.5px", opacity: 0.29 },
  { left: "43%", top: "60%", width: "2.2px", height: "2.2px", opacity: 0.35 },
  { left: "15%", top: "96%", width: "2.4px", height: "2.4px", opacity: 0.35 },
  { left: "45%", top: "95%", width: "2.3px", height: "2.3px", opacity: 0.21 },
  { left: "69%", top: "93%", width: "2.2px", height: "2.2px", opacity: 0.37 },
  { left: "53%", top: "74%", width: "1.1px", height: "1.1px", opacity: 0.32 },
  { left: "15%", top: "80%", width: "2.4px", height: "2.4px", opacity: 0.24 },
  { left: "7%", top: "5%", width: "1.8px", height: "1.8px", opacity: 0.19 },
  { left: "74%", top: "67%", width: "1.8px", height: "1.8px", opacity: 0.32 },
  { left: "15%", top: "50%", width: "1.1px", height: "1.1px", opacity: 0.29 },
  { left: "79%", top: "17%", width: "2.1px", height: "2.1px", opacity: 0.40 },
  { left: "32%", top: "23%", width: "1.4px", height: "1.4px", opacity: 0.36 },
  { left: "8%", top: "85%", width: "1.4px", height: "1.4px", opacity: 0.34 },
  { left: "89%", top: "93%", width: "1.3px", height: "1.3px", opacity: 0.29 },
  { left: "32%", top: "96%", width: "1.5px", height: "1.5px", opacity: 0.19 },
  { left: "41%", top: "10%", width: "1.4px", height: "1.4px", opacity: 0.33 },
  { left: "33%", top: "20%", width: "2.5px", height: "2.5px", opacity: 0.22 },
  { left: "80%", top: "75%", width: "1.9px", height: "1.9px", opacity: 0.31 },
  { left: "58%", top: "93%", width: "2.1px", height: "2.1px", opacity: 0.22 },
  { left: "66%", top: "56%", width: "2.5px", height: "2.5px", opacity: 0.18 },
  { left: "45%", top: "96%", width: "1.1px", height: "1.1px", opacity: 0.33 },
  { left: "90%", top: "67%", width: "1.1px", height: "1.1px", opacity: 0.34 },
  { left: "26%", top: "57%", width: "2.3px", height: "2.3px", opacity: 0.23 },
  { left: "24%", top: "13%", width: "1.5px", height: "1.5px", opacity: 0.18 },
  { left: "70%", top: "91%", width: "1.1px", height: "1.1px", opacity: 0.28 },
  { left: "79%", top: "86%", width: "1.4px", height: "1.4px", opacity: 0.28 },
  { left: "68%", top: "57%", width: "2.6px", height: "2.6px", opacity: 0.38 },
  { left: "97%", top: "14%", width: "1.0px", height: "1.0px", opacity: 0.30 },
  { left: "58%", top: "29%", width: "1.4px", height: "1.4px", opacity: 0.35 },
  { left: "80%", top: "2%", width: "1.2px", height: "1.2px", opacity: 0.33 },
  { left: "42%", top: "17%", width: "2.5px", height: "2.5px", opacity: 0.23 },
  { left: "8%", top: "45%", width: "1.6px", height: "1.6px", opacity: 0.31 },
  { left: "77%", top: "9%", width: "1.8px", height: "1.8px", opacity: 0.38 },
  { left: "49%", top: "98%", width: "2.4px", height: "2.4px", opacity: 0.35 },
  { left: "65%", top: "12%", width: "2.6px", height: "2.6px", opacity: 0.23 },
  { left: "31%", top: "55%", width: "1.9px", height: "1.9px", opacity: 0.34 },
  { left: "54%", top: "99%", width: "2.3px", height: "2.3px", opacity: 0.31 },
  { left: "28%", top: "70%", width: "1.8px", height: "1.8px", opacity: 0.34 },
];

/**
 * Register Page — Modern WellMeds registration interface converted from custom UI design.
 */
const Register = () => {
  const { register, loginWithGoogle, updateProfile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect calculation
  const searchParams = new URLSearchParams(location.search);
  const redirectFromState = location.state?.from;
  const redirectFromQuery = searchParams.get("redirect") || searchParams.get("from");
  const targetDestination = redirectFromState || redirectFromQuery || "/";

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [step, setStep] = useState("auth"); // "auth" | "complete_profile"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.mobile) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        const destination = targetDestination.startsWith("/register") ? "/" : targetDestination;
        navigate(destination, { replace: true });
      }
    }
  }, [user, isAdmin, navigate, targetDestination]);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email || !email.trim()) {
      setErrorMsg("Please enter your email or mobile number.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please agree to the Terms and Conditions to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep("complete_profile");
      } else {
        const dest = targetDestination.startsWith("/register") ? "/" : targetDestination;
        if (res.user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(dest, { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await loginWithGoogle(credential);
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep("complete_profile");
      } else {
        const dest = targetDestination.startsWith("/register") ? "/" : targetDestination;
        if (res.user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(dest, { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Google authentication failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileCompleteSubmit = async ({ mobile }) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const updatedUser = await updateProfile({ mobile });
      const dest = targetDestination.startsWith("/register") ? "/" : targetDestination;
      if (updatedUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative h-screen max-h-screen w-full overflow-hidden flex items-center justify-center p-3 sm:p-4"
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
        title="Create Account — Wellmeds"
        description="Join Wellmeds for genuine, verified medicine delivery and digital healthcare prescriptions."
      />

      {/* Atmospheric Star Points */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {REGISTER_STARS.map((star, idx) => (
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[580px] sm:h-[580px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(21,122,109,0.14) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Card Wrapper */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div
          className="w-full max-w-[350px] sm:max-w-[440px] bg-white border border-[#a8c2b6] rounded-[18px] p-5 sm:py-6 sm:px-8 shadow-[0_20px_45px_rgba(23,43,38,0.13)] relative transition-all duration-200"
        >
          {step === "complete_profile" ? (
            <div>
              <div className="text-[20px] sm:text-[24px] text-[#172b26] font-bold text-center mb-1.5">
                Complete Profile
              </div>
              <div className="text-[11.5px] sm:text-[12.5px] text-[#3f544d] text-center mb-4.5">
                Enter your mobile number to complete registration
              </div>

              {errorMsg && (
                <div className="p-3 mb-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
                  {errorMsg}
                </div>
              )}

              <CompleteProfileModal
                onSubmit={handleProfileCompleteSubmit}
                isLoading={isSubmitting}
              />
            </div>
          ) : (
            <div>
              {/* Header Title & Subtitle */}
              <h1 className="text-[20px] sm:text-[24px] text-[#172b26] font-bold text-center mb-0.5 tracking-tight">
                Create your account.
              </h1>
              <p className="text-[11.5px] sm:text-[12.5px] text-[#3f544d] text-center mb-3 sm:mb-3.5 leading-relaxed">
                Join Wellmeds for genuine medicine delivery
              </p>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-2.5 mb-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
                  {errorMsg}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleEmailRegister} noValidate>
                {/* Full Name Field */}
                <div className="mb-2 sm:mb-2.5 text-left">
                  <label
                    htmlFor="register-name-input"
                    className="block text-[10.5px] sm:text-[11.5px] text-[#172b26] font-bold uppercase tracking-wider mb-1"
                  >
                    FULL NAME
                  </label>
                  <div className="flex items-center gap-2 sm:gap-2.5 bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[10px] px-3.5 py-2 sm:px-3.5 sm:py-2.5 transition-colors">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6f847c] shrink-0"
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                    >
                      <circle cx="50" cy="34" r="18" />
                      <path d="M20 88 C20 62 33 50 50 50 C67 50 80 62 80 88" />
                    </svg>
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      autoFocus
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="Your full name"
                      style={{ outline: "none", boxShadow: "none" }}
                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[12.5px] sm:text-[13.5px] text-[#172b26] placeholder:text-[#6f847c] font-medium shadow-none"
                    />
                  </div>
                </div>

                {/* Email / Mobile Field */}
                <div className="mb-2 sm:mb-2.5 text-left">
                  <label
                    htmlFor="register-email-input"
                    className="block text-[10.5px] sm:text-[11.5px] text-[#172b26] font-bold uppercase tracking-wider mb-1"
                  >
                    EMAIL OR MOBILE NUMBER
                  </label>
                  <div className="flex items-center gap-2 sm:gap-2.5 bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[10px] px-3.5 py-2 sm:px-3.5 sm:py-2.5 transition-colors">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6f847c] shrink-0"
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                    >
                      <rect x="10" y="22" width="80" height="56" rx="6" />
                      <path d="M14 26 L50 55 L86 26" />
                    </svg>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="name@example.com"
                      style={{ outline: "none", boxShadow: "none" }}
                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[12.5px] sm:text-[13.5px] text-[#172b26] placeholder:text-[#6f847c] font-medium shadow-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-0.5 text-left">
                  <label
                    htmlFor="register-password-input"
                    className="block text-[10.5px] sm:text-[11.5px] text-[#172b26] font-bold uppercase tracking-wider mb-1"
                  >
                    PASSWORD
                  </label>
                  <div className="flex items-center gap-2 sm:gap-2.5 bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[10px] px-3.5 py-2 sm:px-3.5 sm:py-2.5 transition-colors">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6f847c] shrink-0"
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                    >
                      <rect x="22" y="42" width="56" height="46" rx="6" />
                      <path d="M32 42 L32 28 C32 15 40 8 50 8 C60 8 68 15 68 28 L68 42" />
                    </svg>
                    <input
                      id="register-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="••••••••"
                      style={{ outline: "none", boxShadow: "none" }}
                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[12.5px] sm:text-[13.5px] text-[#172b26] placeholder:text-[#6f847c] font-medium shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#6f847c] hover:text-[#172b26] transition-colors p-0.5 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Hint */}
                <div className="text-[9.5px] sm:text-[10px] text-[#6f847c] text-left mb-2 mt-0.5">
                  Use 8+ characters with a number &amp; symbol
                </div>

                {/* Terms & Privacy Policy Checkbox Row */}
                <div className="flex items-start gap-2 mb-2.5 sm:mb-3 text-left">
                  <label className="flex items-start gap-2 text-[10.5px] sm:text-[11.5px] text-[#3f544d] cursor-pointer select-none leading-normal">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        agreeTerms
                          ? "bg-[#157a6d] border-[1.5px] border-[#157a6d] shadow-[0_2px_5px_rgba(21,122,109,0.3)]"
                          : "bg-white border-[1.5px] border-[#a8c2b6]"
                      }`}
                    >
                      {agreeTerms && (
                        <svg
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 12 L9.5 17.5 L20 6" />
                        </svg>
                      )}
                    </div>
                    <span>
                      I agree to the&nbsp;
                      <Link
                        to="/terms-and-conditions"
                        className="text-[#157a6d] font-bold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms
                      </Link>
                      &nbsp;&amp;&nbsp;
                      <Link
                        to="/privacy-policy"
                        className="text-[#157a6d] font-bold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Create Account Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#157a6d] hover:bg-[#0e5c52] active:scale-[0.99] disabled:opacity-70 text-white font-bold text-[12.5px] sm:text-[13.5px] tracking-[0.5px] py-2.5 sm:py-3 rounded-[10px] shadow-[0_8px_18px_rgba(21,122,109,0.25)] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : (
                    <span>CREATE ACCOUNT</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2.5 sm:gap-3 my-2 sm:my-2.5">
                <div className="flex-1 h-[1px] bg-[#a8c2b6]" />
                <span className="text-[9.5px] sm:text-[10.5px] text-[#6f847c] tracking-[1px] font-bold uppercase">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-[#a8c2b6]" />
              </div>

              {/* Google Authentication Button */}
              <GoogleAuthButton
                buttonText="Sign up with Google"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMsg(err)}
                isLoading={isSubmitting}
              />

              {/* Footer Switcher Line */}
              <div className="text-center text-[11px] sm:text-[12px] text-[#3f544d] mt-2.5 sm:mt-3">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={location.state}
                  className="font-bold text-[#157a6d] hover:underline cursor-pointer"
                >
                  Log In
                </Link>
              </div>

              {/* Google Rating Row */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-2.5 sm:mt-3 border border-[#a8c2b6] rounded-[11px] px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#f7f8f6] w-fit mx-auto shadow-2xs">
                <div className="flex shrink-0">
                  <div
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-white flex items-center justify-center text-[8.5px] sm:text-[10px] font-bold text-[#172b26] shadow-xs shrink-0"
                    style={{ background: "#cfe6e1" }}
                  >
                    A
                  </div>
                  <div
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-white flex items-center justify-center text-[8.5px] sm:text-[10px] font-bold text-[#172b26] -ml-1.5 shadow-xs shrink-0"
                    style={{ background: "#e6d4a8" }}
                  >
                    S
                  </div>
                  <div
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-white flex items-center justify-center text-[8.5px] sm:text-[10px] font-bold text-[#172b26] -ml-1.5 shadow-xs shrink-0"
                    style={{ background: "#e8c3ac" }}
                  >
                    P
                  </div>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10.5px] sm:text-[11.5px] font-bold text-[#172b26] flex items-center gap-1">
                    <span>Rated <b>4.9</b> on Google</span>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 -mt-0.5" viewBox="0 0 24 24" fill="#b08d3e">
                      <path d="M12 2 L14.6 9.2 L22 9.9 L16.5 14.9 L18.2 22 L12 18.1 L5.8 22 L7.5 14.9 L2 9.9 L9.4 9.2 Z" />
                    </svg>
                  </div>
                  <a
                    href="https://www.google.com/search?q=wellmeds&oq=wellmeds&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDwyBggCEEUYPDIGCAMQRRg8MgYIBBBFGDzSAQg1MTQyajBqNKgCALACAQ&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x3bc2bffd675bf687:0x866871240c185cd7,1,,,,"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] sm:text-[10px] text-[#157a6d] font-semibold hover:underline block cursor-pointer"
                  >
                    Read Reviews
                  </a>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 text-[9px] sm:text-[10px] text-[#6f847c]">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#157a6d]"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                >
                  <path d="M50 8 L86 22 L86 46 C86 72 70 88 50 95 C30 88 14 72 14 46 L14 22 Z" />
                </svg>
                <span>Licensed Pharmacy · Data Encrypted</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
