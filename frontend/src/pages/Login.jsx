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
const LOGIN_STARS = [
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
  { left: "52%", top: "72%", width: "1.7px", height: "1.7px", opacity: 0.33 },
  { left: "47%", top: "13%", width: "1.2px", height: "1.2px", opacity: 0.35 },
  { left: "75%", top: "94%", width: "2.1px", height: "2.1px", opacity: 0.29 },
  { left: "17%", top: "85%", width: "1.2px", height: "1.2px", opacity: 0.26 },
  { left: "14%", top: "38%", width: "1.5px", height: "1.5px", opacity: 0.26 },
  { left: "71%", top: "54%", width: "1.4px", height: "1.4px", opacity: 0.34 },
  { left: "74%", top: "83%", width: "1.1px", height: "1.1px", opacity: 0.30 },
  { left: "90%", top: "26%", width: "1.3px", height: "1.3px", opacity: 0.35 },
  { left: "36%", top: "40%", width: "2.3px", height: "2.3px", opacity: 0.25 },
  { left: "20%", top: "21%", width: "1.6px", height: "1.6px", opacity: 0.32 },
  { left: "37%", top: "77%", width: "1.1px", height: "1.1px", opacity: 0.21 },
  { left: "63%", top: "48%", width: "1.8px", height: "1.8px", opacity: 0.38 },
  { left: "28%", top: "18%", width: "1.1px", height: "1.1px", opacity: 0.27 },
  { left: "30%", top: "47%", width: "1.0px", height: "1.0px", opacity: 0.15 },
  { left: "38%", top: "76%", width: "1.5px", height: "1.5px", opacity: 0.38 },
  { left: "58%", top: "40%", width: "2.2px", height: "2.2px", opacity: 0.21 },
  { left: "61%", top: "85%", width: "1.9px", height: "1.9px", opacity: 0.23 },
  { left: "10%", top: "57%", width: "1.3px", height: "1.3px", opacity: 0.24 },
  { left: "54%", top: "94%", width: "2.1px", height: "2.1px", opacity: 0.28 },
  { left: "86%", top: "31%", width: "1.6px", height: "1.6px", opacity: 0.32 },
];

/**
 * Login Page — Modern WellMeds authentication interface converted from custom UI design.
 */
const Login = () => {
  const { login, loginWithGoogle, updateProfile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect calculation
  const searchParams = new URLSearchParams(location.search);
  const redirectFromState = location.state?.from;
  const redirectFromQuery = searchParams.get("redirect") || searchParams.get("from");
  const targetDestination = redirectFromState || redirectFromQuery || "/";

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("auth"); // "auth" | "complete_profile"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const cleanMobile = user.mobile ? String(user.mobile).trim() : "";
      const isComplete = isAdmin || (cleanMobile && /^[6-9]\d{9}$/.test(cleanMobile) && user.isProfileCompleted);
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isComplete) {
        const destination = targetDestination.startsWith("/login") ? "/" : targetDestination;
        navigate(destination, { replace: true });
      } else {
        const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
        navigate(`/complete-profile?returnTo=${encodeURIComponent(dest)}`, { replace: true });
      }
    }
  }, [user, isAdmin, navigate, targetDestination]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.trim()) {
      setErrorMsg("Please enter your email or mobile number.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
      if (res.requiresMobile || (res.user && !res.user.mobile) || !res.profileComplete) {
        navigate(`/complete-profile?returnTo=${encodeURIComponent(dest)}`, { replace: true });
      } else {
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
        "Invalid email or password. Please verify your details."
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
      const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
      if (res.requiresMobile || (res.user && !res.user.mobile) || !res.profileComplete) {
        navigate(`/complete-profile?returnTo=${encodeURIComponent(dest)}`, { replace: true });
      } else {
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
      const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
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
        title="Log In — Wellmeds"
        description="Log in to your Wellmeds account to access medicines, manage prescriptions, and track clinical orders."
      />

      {/* Atmospheric Star Points */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {LOGIN_STARS.map((star, idx) => (
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[580px] sm:h-[580px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(21,122,109,0.14) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Card Wrapper */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div
          className="w-full max-w-[340px] sm:max-w-[440px] bg-white border border-[#a8c2b6] rounded-[18px] p-5 sm:py-7 sm:px-8 shadow-[0_20px_45px_rgba(23,43,38,0.13)] relative transition-all duration-200"
        >
          {step === "complete_profile" ? (
            <div>
              <div className="text-[20px] sm:text-[24px] text-[#172b26] font-bold text-center mb-1.5">
                Complete Profile
              </div>
              <div className="text-[11.5px] sm:text-[12.5px] text-[#3f544d] text-center mb-4.5">
                Enter your mobile number to finalize your Wellmeds account
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
              <h1 className="text-[21px] sm:text-[25px] text-[#172b26] font-bold text-center mb-0.5 tracking-tight">
                Welcome back.
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#3f544d] text-center mb-3.5 sm:mb-4.5">
                Log in to your Wellmeds account
              </p>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 mb-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
                  {errorMsg}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleEmailLogin} noValidate>
                {/* Email / Mobile Field */}
                <div className="mb-3 sm:mb-3.5 text-left">
                  <label
                    htmlFor="login-email-input"
                    className="block text-[10.5px] sm:text-[11.5px] text-[#172b26] font-bold uppercase tracking-wider mb-1.5"
                  >
                    EMAIL OR MOBILE NUMBER
                  </label>
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[10px] px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors">
                    {/* User Outline SVG Icon */}
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
                      id="login-email-input"
                      type="text"
                      required
                      autoFocus
                      autoComplete="username"
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
                <div className="mb-3.5 sm:mb-4 text-left">
                  <label
                    htmlFor="login-password-input"
                    className="block text-[10.5px] sm:text-[11.5px] text-[#172b26] font-bold uppercase tracking-wider mb-1.5"
                  >
                    PASSWORD
                  </label>
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] focus-within:border-[#157a6d] focus-within:bg-white rounded-[10px] px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors">
                    {/* Lock Outline SVG Icon */}
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
                      id="login-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
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

                {/* Forgot Password Link */}
                <div className="flex justify-end mb-3.5 sm:mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] sm:text-[12px] text-[#157a6d] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Log In Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#157a6d] hover:bg-[#0e5c52] active:scale-[0.99] disabled:opacity-70 text-white font-bold text-[13px] sm:text-[14px] tracking-[0.5px] py-3 sm:py-3.5 rounded-[10px] shadow-[0_8px_18px_rgba(21,122,109,0.25)] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>LOGGING IN...</span>
                    </>
                  ) : (
                    <span>LOG IN</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2.5 sm:gap-3 my-3 sm:my-3.5">
                <div className="flex-1 h-[1px] bg-[#a8c2b6]" />
                <span className="text-[9.5px] sm:text-[10.5px] text-[#6f847c] tracking-[1px] font-bold uppercase">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-[#a8c2b6]" />
              </div>

              {/* Google Authentication Button */}
              <GoogleAuthButton
                buttonText="Continue with Google"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMsg(err)}
                isLoading={isSubmitting}
              />

              {/* Footer Switcher Line */}
              <div className="text-center text-[11px] sm:text-[12px] text-[#3f544d] mt-3 sm:mt-3.5">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  state={location.state}
                  className="font-bold text-[#157a6d] hover:underline cursor-pointer"
                >
                  Register
                </Link>
              </div>

              {/* Google Rating Row */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-3 sm:mt-3.5 border border-[#a8c2b6] rounded-[12px] px-4 py-2 sm:px-4.5 sm:py-2.5 bg-[#f7f8f6] w-fit mx-auto shadow-2xs">
                <div className="flex shrink-0">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[1.5px] border-white flex items-center justify-center text-[9px] sm:text-[11px] font-bold text-[#172b26] shadow-xs shrink-0"
                    style={{ background: "#cfe6e1" }}
                  >
                    A
                  </div>
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[1.5px] border-white flex items-center justify-center text-[9px] sm:text-[11px] font-bold text-[#172b26] -ml-2 shadow-xs shrink-0"
                    style={{ background: "#e6d4a8" }}
                  >
                    S
                  </div>
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[1.5px] border-white flex items-center justify-center text-[9px] sm:text-[11px] font-bold text-[#172b26] -ml-2 shadow-xs shrink-0"
                    style={{ background: "#e8c3ac" }}
                  >
                    P
                  </div>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[11px] sm:text-[12px] font-bold text-[#172b26] flex items-center gap-1">
                    <span>Rated <b>4.9</b> on Google</span>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 -mt-0.5" viewBox="0 0 24 24" fill="#b08d3e">
                      <path d="M12 2 L14.6 9.2 L22 9.9 L16.5 14.9 L18.2 22 L12 18.1 L5.8 22 L7.5 14.9 L2 9.9 L9.4 9.2 Z" />
                    </svg>
                  </div>
                  <a
                    href="https://www.google.com/search?q=wellmeds&oq=wellmeds&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDwyBggCEEUYPDIGCAMQRRg8MgYIBBBFGDzSAQg1MTQyajBqNKgCALACAQ&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x3bc2bffd675bf687:0x866871240c185cd7,1,,,,"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9.5px] sm:text-[10.5px] text-[#157a6d] font-semibold hover:underline block cursor-pointer"
                  >
                    Read Reviews
                  </a>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-3.5 text-[9px] sm:text-[10px] text-[#6f847c]">
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

export default Login;
