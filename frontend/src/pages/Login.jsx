import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ─── Constants ─────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60;    // 5 min — for display countdown
const RESEND_COOLDOWN_SECONDS = 60;   // 60 sec before resend is enabled

const STEP_MOBILE = "mobile";
const STEP_DETAILS = "details";
const STEP_OTP = "otp";
const STEP_WELCOME = "welcome";

// ─── Error sanitiser — never expose internal backend details ──────────────
const sanitiseError = (err) => {
  const raw = (err?.response?.data?.message || err?.message || "").toLowerCase();

  if (!raw) return "Something went wrong. Please try again.";

  // Suppress internal/technical messages
  const suppress = [
    /refresh token/i, /not authorized/i, /token.*missing/i,
    /token verification/i, /jwt/i, /session expired/i,
    /user does not exist/i, /phone.*not found/i, /invalid account/i,
    /user not found/i, /account not found/i,
  ];
  if (suppress.some((p) => p.test(raw))) return "Something went wrong. Please try again.";

  // Friendly mappings
  if (/too many.*otp|rate limit|too many request/i.test(raw)) return err?.response?.data?.message || "Too many OTP requests. Please try again after some time.";
  if (/expired/i.test(raw)) return "OTP has expired. Please request a new one.";
  if (/incorrect.*otp|wrong.*otp|invalid.*otp/i.test(raw)) {
    const remaining = err?.response?.data?.remainingAttempts;
    if (remaining !== undefined) return `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;
    return "Incorrect OTP. Please try again.";
  }
  if (/maximum.*attempt|too many.*attempt/i.test(raw)) return "Too many incorrect attempts. Please request a new OTP.";
  if (/invalid.*mobile|valid.*mobile|valid.*number/i.test(raw)) return err?.response?.data?.message || "Please enter a valid 10-digit mobile number.";
  if (/network error/i.test(err?.message) || err?.code === "ERR_NETWORK") return "Unable to connect. Please check your internet connection.";

  // Catch duplicate key / conflict errors — never show raw Mongo messages to user
  const httpStatus = err?.response?.status;
  if (httpStatus === 409 || /duplicate|conflict|already exist|e11000/i.test(raw)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[LOGIN] Duplicate key error from backend:", err?.response?.data);
    }
    return "We couldn't complete sign in. Please try again.";
  }

  // Use backend message only if it looks safe (no internal DB/tech leakage)
  const safe = err?.response?.data?.message || "";
  if (safe && safe.length < 120 && !/duplicate|mongo|e11000|keypattern|keyvalue/i.test(safe.toLowerCase())) {
    return safe;
  }

  return "Something went wrong. Please try again.";
};

// ─── OTP Countdown hook ───────────────────────────────────────────────────
const useCountdown = (initial) => {
  const [count, setCount] = useState(initial);
  const timerRef = useRef(null);

  const start = useCallback((from = initial) => {
    setCount(from);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [initial]);

  const stop = useCallback(() => clearInterval(timerRef.current), []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { count, start, stop, fmt };
};

// ─── Component ──────────────────────────────────────────────────────────────
const Login = () => {
  const { sendOtp, verifyOtp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = location.state?.from || "/";

  // ── Flow state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_MOBILE);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);

  // ── OTP state ─────────────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const lastVerifiedOtpRef = useRef("");

  // ── Timers ────────────────────────────────────────────────────────────────
  const resend = useCountdown(RESEND_COOLDOWN_SECONDS);      // 60s cooldown
  const expiry = useCountdown(OTP_EXPIRY_SECONDS);           // 5m expiry display

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [welcomeName, setWelcomeName] = useState("");

  // ── Redirect if already logged in ─────────────────────────────────────────
  useEffect(() => {
    if (user) navigate(isAdmin ? "/admin" : redirectUrl, { replace: true });
  }, [user, isAdmin, navigate, redirectUrl]);

  // ── Handle client-side OTP expiration ─────────────────────────────────────
  useEffect(() => {
    if (step === STEP_OTP && expiry.count === 0) {
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      lastVerifiedOtpRef.current = "";
      setError("OTP has expired. Please request a new OTP.");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [expiry.count, step]);

  // ── Step 1: Mobile validation ─────────────────────────────────────────────
  const handleMobileSubmit = (e) => {
    e.preventDefault();
    setError("");
    const cleaned = mobile.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    setStep(STEP_DETAILS);
  };

  // ── Step 2 → 3: Send OTP ─────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!isExistingUser && !name.trim()) { setError("Please enter your full name."); return; }

    setIsSubmitting(true);
    try {
      const result = await sendOtp(mobile.trim(), name.trim(), email.trim());
      setIsExistingUser(!!result.isExistingUser);
      if (result.devOtp) setDevOtpHint(result.devOtp);

      setOtpDigits(Array(OTP_LENGTH).fill(""));
      lastVerifiedOtpRef.current = "";
      setStep(STEP_OTP);

      // Start both timers
      resend.start(RESEND_COOLDOWN_SECONDS);
      expiry.start(OTP_EXPIRY_SECONDS);

      setSuccess(`OTP sent to +91 ${mobile.trim()}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(sanitiseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── OTP digit input handlers ──────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Reset verify trigger on user edit so they can try verifying the same value again if desired
    lastVerifiedOtpRef.current = "";

    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when last digit filled
    if (digit && index === OTP_LENGTH - 1) {
      const full = [...next.slice(0, OTP_LENGTH - 1), digit].join("");
      if (full.length === OTP_LENGTH && !isVerifying) handleVerifyOtp(full);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      lastVerifiedOtpRef.current = "";
      if (otpDigits[index]) {
        const next = [...otpDigits]; next[index] = ""; setOtpDigits(next);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    lastVerifiedOtpRef.current = "";
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted.length) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < OTP_LENGTH; i++) next[i] = pasted[i] || "";
    setOtpDigits(next);
    const nextIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextIdx]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerifyOtp(pasted);
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (otpOverride) => {
    if (isVerifying) return;

    const otpValue = otpOverride || otpDigits.join("");
    if (otpValue.length < OTP_LENGTH) { setError(`Please enter all ${OTP_LENGTH} digits.`); return; }

    // Auto verification only happens once until OTP changes
    if (otpValue === lastVerifiedOtpRef.current) return;
    lastVerifiedOtpRef.current = otpValue;

    console.log("[VERIFY] Started");
    setIsVerifying(true);
    setError("");
    setSuccess("Verifying…");

    try {
      const loggedUser = await verifyOtp(mobile.trim(), otpValue, name.trim(), email.trim());
      console.log("[VERIFY] Success");

      // Stop timers
      resend.stop();
      expiry.stop();

      // Show welcome screen
      setWelcomeName(loggedUser?.name || "there");
      setStep(STEP_WELCOME);

      setTimeout(() => {
        navigate(loggedUser?.role === "admin" ? "/admin" : redirectUrl, { replace: true });
      }, 1500);
    } catch (err) {
      console.log("[VERIFY] Failed");
      setError(sanitiseError(err));
      setSuccess("");
      // Clear OTP on failure
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      lastVerifiedOtpRef.current = "";
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resend.count > 0) return;
    setError(""); setSuccess(""); setDevOtpHint("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setIsSubmitting(true);
    try {
      const result = await sendOtp(mobile.trim(), name.trim(), email.trim());
      if (result.devOtp) setDevOtpHint(result.devOtp);
      resend.start(RESEND_COOLDOWN_SECONDS);
      expiry.start(OTP_EXPIRY_SECONDS);
      setSuccess("New OTP sent!");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(sanitiseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step progress index ───────────────────────────────────────────────────
  const steps = [STEP_MOBILE, STEP_DETAILS, STEP_OTP];
  const stepIdx = steps.indexOf(step);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop bg-surface transition-colors duration-300 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 medical-pattern pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* ══════════════════════════════════════════════════════════════════
            WELCOME SCREEN
        ══════════════════════════════════════════════════════════════════ */}
        {step === STEP_WELCOME && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl text-center animate-in fade-in zoom-in-95 duration-400">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-lg mx-auto">
              <span className="material-symbols-outlined text-[48px]">waving_hand</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-xs">
              Welcome, {welcomeName.split(" ")[0]}! 👋
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-lg">Signing you in securely…</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MAIN AUTH CARD
        ══════════════════════════════════════════════════════════════════ */}
        {step !== STEP_WELCOME && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-2xl text-left animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Brand Header */}
            <div className="text-center space-y-xs mb-lg">
              <div className="inline-flex p-sm rounded-2xl bg-primary/10 text-primary mb-xs">
                <span className="material-symbols-outlined text-[36px]">local_hospital</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                {step === STEP_OTP ? "Verify Your Number" : "Welcome to WellMeds"}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {step === STEP_MOBILE && "Enter your mobile number to get started"}
                {step === STEP_DETAILS && "A few more details and you're in"}
                {step === STEP_OTP && `Code sent to +91 ${mobile}`}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-sm mb-lg" role="progressbar" aria-label="Step progress" aria-valuenow={stepIdx + 1} aria-valuemax={3}>
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      step === s
                        ? "w-6 h-2 bg-primary"
                        : i < stepIdx
                        ? "w-2 h-2 bg-primary/60"
                        : "w-2 h-2 bg-outline-variant"
                    }`}
                  />
                  {i < 2 && <div className="w-6 h-px bg-outline-variant/50" />}
                </React.Fragment>
              ))}
            </div>

            {/* Status messages */}
            {error && (
              <div role="alert" aria-live="assertive" className="bg-error-container/20 border border-error/30 text-error p-sm rounded-xl text-body-sm flex items-start gap-xs mb-md animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px] mt-[1px] flex-shrink-0" aria-hidden="true">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && !error && (
              <div role="status" aria-live="polite" className="bg-primary-container/10 border border-primary/20 text-primary p-sm rounded-xl text-body-sm flex items-center gap-xs mb-md animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0" aria-hidden="true">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            {/* Dev OTP hint */}
            {devOtpHint && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-sm rounded-xl text-body-sm flex items-center gap-xs mb-md" role="status">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0" aria-hidden="true">bug_report</span>
                <span>Dev OTP: <strong className="font-mono tracking-[0.2em]">{devOtpHint}</strong></span>
              </div>
            )}

            {/* ── STEP 1: Mobile ──────────────────────────────────────────────── */}
            {step === STEP_MOBILE && (
              <form onSubmit={handleMobileSubmit} className="space-y-md" noValidate>
                <div className="space-y-xs">
                  <label htmlFor="mobile-input" className="block font-body-sm text-sm font-semibold text-on-surface">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 flex items-center pl-md h-full pointer-events-none">
                      <span className="text-on-surface-variant font-mono text-sm">+91</span>
                      <div className="ml-sm w-px h-5 bg-outline-variant" />
                    </div>
                    <input
                      id="mobile-input"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      autoFocus
                      autoComplete="tel-national"
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                      placeholder="9XXXXXXXXX"
                      aria-label="10-digit mobile number"
                      aria-describedby="mobile-hint"
                      className="w-full pl-[72px] pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 tracking-widest font-mono"
                    />
                  </div>
                  <p id="mobile-hint" className="text-body-xs text-on-surface-variant/70">
                    We'll send a 6-digit verification code to this number.
                  </p>
                </div>

                <button
                  id="btn-continue-mobile"
                  type="submit"
                  disabled={mobile.length < 10}
                  className="w-full py-sm px-lg rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                </button>
              </form>
            )}

            {/* ── STEP 2: Details ─────────────────────────────────────────────── */}
            {step === STEP_DETAILS && (
              <form onSubmit={handleSendOtp} className="space-y-md" noValidate>
                {/* Confirmed mobile */}
                <div className="flex items-center gap-xs text-body-sm text-on-surface-variant bg-surface-container rounded-xl px-md py-sm border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">phone_iphone</span>
                  <span className="font-mono tracking-wider text-on-surface">+91 {mobile}</span>
                  <button
                    type="button"
                    onClick={() => { setStep(STEP_MOBILE); setError(""); setSuccess(""); }}
                    className="ml-auto text-primary text-body-xs font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
                    aria-label="Change mobile number"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-xs">
                  <label htmlFor="name-input" className="block font-body-sm text-sm font-semibold text-on-surface">
                    Full Name <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]" aria-hidden="true">person</span>
                    <input
                      id="name-input"
                      type="text"
                      autoFocus
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      placeholder="Your full name"
                      aria-required="true"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label htmlFor="email-input" className="block font-body-sm text-sm font-semibold text-on-surface">
                    Email Address{" "}
                    <span className="text-on-surface-variant/60 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]" aria-hidden="true">mail</span>
                    <input
                      id="email-input"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-sm px-lg rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" aria-hidden="true" />
                      <span>Sending OTP…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">sms</span>
                      <span>Send OTP</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 3: OTP Entry ───────────────────────────────────────────── */}
            {step === STEP_OTP && (
              <div className="space-y-lg">
                {/* Confirmed mobile */}
                <div className="flex items-center gap-xs text-body-sm text-on-surface-variant bg-surface-container rounded-xl px-md py-sm border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">phone_iphone</span>
                  <span className="font-mono tracking-wider text-on-surface">+91 {mobile}</span>
                </div>

                {/* 6-digit OTP grid */}
                <fieldset>
                  <legend className="text-body-sm font-semibold text-on-surface mb-md text-center block">
                    Enter the {OTP_LENGTH}-digit verification code
                  </legend>
                  <div
                    className="flex gap-xs justify-center"
                    onPaste={handleOtpPaste}
                    role="group"
                    aria-label="OTP entry"
                  >
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-digit-${i + 1}`}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isVerifying}
                        aria-label={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
                        className={`w-11 h-14 text-center text-xl font-bold font-mono rounded-xl border-2 bg-surface-container text-on-surface transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          digit
                            ? "border-primary bg-primary/5 focus:ring-primary/30"
                            : "border-outline-variant focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                    ))}
                  </div>
                </fieldset>

                {/* Verify button */}
                {!isVerifying && (
                  <button
                    id="btn-verify-otp"
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={otpDigits.join("").length < OTP_LENGTH || isVerifying}
                    className="w-full py-sm px-lg rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">verified</span>
                    <span>Verify OTP</span>
                  </button>
                )}

                {/* Verifying spinner */}
                {isVerifying && (
                  <div className="flex flex-col items-center justify-center gap-sm py-xs" role="status" aria-live="polite">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
                    <p className="text-body-sm text-on-surface-variant font-medium">Verifying…</p>
                  </div>
                )}

                {/* Resend + OTP expiry timers */}
                <div className="space-y-xs text-center">
                  {resend.count > 0 ? (
                    <div className="flex items-center justify-center gap-xs text-body-sm text-on-surface-variant" aria-live="polite">
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">timer</span>
                      <span>Resend OTP in <strong className="font-mono text-on-surface">{resend.fmt(resend.count)}</strong></span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="btn-resend-otp"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="text-primary text-body-sm font-bold hover:underline disabled:opacity-50 flex items-center gap-xs mx-auto focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">refresh</span>
                      {isSubmitting ? "Sending…" : "Resend OTP"}
                    </button>
                  )}

                  {/* OTP validity remaining */}
                  {expiry.count > 0 && (
                    <p className="text-body-xs text-on-surface-variant/60" aria-live="off">
                      OTP valid for <span className="font-mono">{expiry.fmt(expiry.count)}</span>
                    </p>
                  )}
                  {expiry.count === 0 && (
                    <p className="text-body-xs text-error" role="alert">OTP has expired. Please request a new one.</p>
                  )}

                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => { setStep(STEP_DETAILS); setError(""); setSuccess(""); setDevOtpHint(""); resend.stop(); expiry.stop(); }}
                    className="text-on-surface-variant text-body-xs hover:text-on-surface hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-xs"
                  >
                    ← Change details
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-lg pt-md border-t border-outline-variant/20 text-center text-body-xs text-on-surface-variant leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary/30 rounded">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary/30 rounded">Privacy Policy</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
