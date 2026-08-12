import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import CompleteProfileModal from "../components/auth/CompleteProfileModal";
import SEO from "../components/common/SEO";
import { 
  Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, 
  ChevronLeft, ChevronRight, Truck, Award, Pill, Star, MapPin, Building2, CheckCircle2
} from "lucide-react";

/**
 * Showcase slide data for the right visual feature card
 */
const SHOWCASE_SLIDES = [
  {
    badge: "Pan India Delivery",
    stat: "2,000,000+",
    statLabel: "Orders Delivered",
    secondaryStat: "4,000+",
    secondaryLabel: "Cities Covered",
    title: "India's Trusted Super Speciality Pharmacy",
    subtitle: "Cold-chain temperature-monitored delivery for chronic, oncology, and specialty medications across 4,000+ pin codes.",
    tagColor: "bg-[#157a6d] text-white",
  },
  {
    badge: "100% Genuine",
    stat: "100%",
    statLabel: "Verified Sourcing",
    secondaryStat: "ISO 27001",
    secondaryLabel: "Data Privacy Certified",
    title: "Authentic Medicines Directly From Manufacturers",
    subtitle: "Every prescription order is verified by licensed clinical pharmacists with strict temperature integrity checks.",
    tagColor: "bg-[#0f5c52] text-white",
  },
  {
    badge: "Patient Savings",
    stat: "₹50 Cr+",
    statLabel: "Subsidized Aid",
    secondaryStat: "24/7",
    secondaryLabel: "Clinical Assistance",
    title: "Patient Assistance & Specialty Medicine Support",
    subtitle: "Dedicated counseling and subsidized therapy access for critical healthcare needs across India.",
    tagColor: "bg-[#14a088] text-white",
  },
];

/**
 * Login Page — Full-size pharmacy authentication page matching WellMeds clinical design system.
 */
const Login = () => {
  const { login, loginWithGoogle, updateProfile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target calculation
  const searchParams = new URLSearchParams(location.search);
  const redirectFromState = location.state?.from;
  const redirectFromQuery = searchParams.get("redirect") || searchParams.get("from");
  const targetDestination = redirectFromState || redirectFromQuery || "/";

  // Form & UI States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("auth"); // "auth" | "complete_profile"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Slide Carousel State for Right Column
  const [activeSlide, setActiveSlide] = useState(0);
  const slideTimerRef = useRef(null);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, []);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  // Redirect if already authenticated and mobile number exists
  useEffect(() => {
    if (user && user.mobile) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        const destination = targetDestination.startsWith("/login") ? "/" : targetDestination;
        navigate(destination, { replace: true });
      }
    }
  }, [user, isAdmin, navigate, targetDestination]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep("complete_profile");
      } else {
        const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
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
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep("complete_profile");
      } else {
        const dest = targetDestination.startsWith("/login") ? "/" : targetDestination;
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

  const currentSlide = SHOWCASE_SLIDES[activeSlide];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f6f9f8] dark:bg-zinc-950 py-8 md:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-[fade-in_0.25s_ease-out]">
      <SEO
        title="Sign In — WellMeds"
        description="Sign in to your WellMeds account to access medicines, manage prescriptions, and track clinical orders."
      />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* ── Left Column: Auth Card + Google Rating Pill ── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Main Auth Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xl flex-grow flex flex-col justify-between transition-all">
            <div>
              {/* Header Icon Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-2xl bg-[#157a6d]/10 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center border border-[#157a6d]/20 shadow-xs">
                  <Pill className="w-5 h-5 rotate-45" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#157a6d] dark:text-emerald-400 uppercase bg-[#157a6d]/10 px-3 py-1 rounded-full border border-[#157a6d]/15">
                  CLINICAL PORTAL
                </span>
              </div>

              {/* Card Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight text-left">
                {step === "complete_profile" ? "Complete Profile" : "Welcome"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 mb-6 text-left leading-relaxed">
                {step === "complete_profile"
                  ? "Enter your mobile number below to finalize your WellMeds account."
                  : "Enter your credentials below to access your account"}
              </p>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold text-left animate-[shake_0.2s_ease-in-out]">
                  {errorMsg}
                </div>
              )}

              {step === "complete_profile" ? (
                <CompleteProfileModal
                  onSubmit={handleProfileCompleteSubmit}
                  isLoading={isSubmitting}
                />
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
                  {/* Email Input */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-4 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg("");
                        }}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-[#157a6d] rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-[11px] font-bold text-[#157a6d] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-4 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrorMsg("");
                        }}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-[#f8fafc] dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-[#157a6d] rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 p-1 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#157a6d] hover:bg-[#0f5c52] disabled:opacity-60 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>LOGIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === "auth" && (
                <>
                  {/* Divider */}
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                      OR
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                  </div>

                  {/* Google Authentication Button */}
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={(err) => setErrorMsg(err)}
                    isLoading={isSubmitting}
                  />
                </>
              )}
            </div>

            {/* Bottom Register Link */}
            <div className="pt-5 mt-6 text-center border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={location.state}
                className="font-bold text-[#157a6d] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Bottom Google Rating Badge Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#157a6d] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">WM</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">Rx</div>
                <div className="w-7 h-7 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">✓</div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Rated 4.9+</span>
                  <div className="flex text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Verified Patient Support</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#157a6d] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              Google Verified
            </span>
          </div>

        </div>

        {/* ── Right Column: Showcase Card with Interactive Delivery Metrics ── */}
        <div className="lg:col-span-7 hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#f0f7f5] via-[#e5f2ed] to-[#f4f9f7] dark:from-zinc-900 dark:to-zinc-950 border border-[#cee3dc] dark:border-zinc-800 rounded-[28px] p-8 sm:p-10 relative overflow-hidden shadow-xl min-h-[620px]">
          
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#157a6d]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Pill Emblem */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#157a6d] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                wm
              </div>
              <span className="text-xs font-bold text-[#157a6d] dark:text-emerald-400 tracking-wide uppercase font-mono">
                WELLMEDS CLINICAL NETWORK
              </span>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-2xs ${currentSlide.tagColor}`}>
              {currentSlide.badge}
            </span>
          </div>

          {/* Center Visual Mockup Section with Animated Floating Badges */}
          <div className="relative z-10 my-6 flex flex-col items-center justify-center text-center">
            
            {/* Visual Container */}
            <div className="relative w-full max-w-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[#c3dfd7] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-lg transition-all duration-300">
              
              {/* Floating Stat Badge 1 — Pan India Delivery */}
              <div className="absolute -top-4 -left-4 bg-[#157a6d] text-white px-4 py-2 rounded-2xl shadow-lg border border-white/20 flex items-center gap-2 text-xs font-bold animate-[bounce_3s_infinite]">
                <Truck className="w-4 h-4 text-emerald-300" />
                <span>{currentSlide.badge}</span>
              </div>

              {/* Floating Stat Badge 2 — Orders Delivered */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-zinc-900 border border-[#bce0d6] dark:border-zinc-700 text-slate-900 dark:text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#157a6d] animate-ping" />
                <span className="text-[#157a6d] dark:text-emerald-400 font-extrabold">{currentSlide.stat}</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">{currentSlide.statLabel}</span>
              </div>

              {/* Central Illustration Area */}
              <div className="py-8 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#157a6d] to-[#14a088] text-white flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                  <ShieldCheck className="w-10 h-10 text-emerald-100" />
                </div>

                <div className="max-w-sm mx-auto space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {currentSlide.subtitle}
                  </p>
                </div>
              </div>

              {/* Floating Stat Badge 3 — Cities Covered */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-[#bce0d6] dark:border-zinc-700 px-5 py-2 rounded-2xl shadow-lg flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <MapPin className="w-4 h-4 text-[#157a6d] dark:text-emerald-400" />
                  <span className="text-[#157a6d] dark:text-emerald-400 font-extrabold">{currentSlide.secondaryStat}</span>
                  <span>{currentSlide.secondaryLabel}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Controls: Carousel Indicators & Arrows */}
          <div className="relative z-10 pt-4 flex items-center justify-between border-t border-[#d5e7e1] dark:border-zinc-800">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {SHOWCASE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-200 ${idx === activeSlide ? "w-7 bg-[#157a6d]" : "w-2.5 bg-[#a3cebf] dark:bg-zinc-700"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-[#157a6d] hover:text-white dark:hover:bg-[#157a6d] transition-all cursor-pointer shadow-xs"
                aria-label="Previous showcase slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-[#157a6d] hover:text-white dark:hover:bg-[#157a6d] transition-all cursor-pointer shadow-xs"
                aria-label="Next showcase slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
