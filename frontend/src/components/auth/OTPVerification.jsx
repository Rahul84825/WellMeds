import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

const OTPVerification = ({
  mobile,
  onVerify,
  onResend,
  onBack,
  isLoading,
  isResending,
  devOtpHint,
  errorMsg
}) => {
  const otpLength = 6;
  const [digits, setDigits] = useState(Array(otpLength).fill(""));
  const [error, setError] = useState(errorMsg || "");
  
  // Timer states
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(300);
  
  const inputRefs = useRef([]);

  // Sync parent errorMsg
  useEffect(() => {
    if (errorMsg) setError(errorMsg);
  }, [errorMsg]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Expiry timer
  useEffect(() => {
    if (expiryTimer <= 0) {
      setError("OTP has expired. Please request a new OTP.");
      return;
    }
    const interval = setInterval(() => {
      setExpiryTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTimer]);

  const handleInputChange = (index, value) => {
    setError("");
    const char = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-focus next input
    if (char && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger auto-submit when all fields are populated
    const combined = nextDigits.join("");
    if (combined.length === otpLength) {
      onVerify(combined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      setDigits(nextDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpLength);
    if (!pastedData) return;

    const nextDigits = Array(otpLength).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      nextDigits[i] = pastedData[i];
    }
    setDigits(nextDigits);

    const focusIndex = Math.min(pastedData.length, otpLength - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === otpLength) {
      onVerify(pastedData);
    }
  };

  const handleResendClick = async () => {
    if (resendTimer > 0) return;
    setError("");
    setDigits(Array(otpLength).fill(""));
    const success = await onResend();
    if (success) {
      setResendTimer(60);
      setExpiryTimer(300);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-clinical-mono text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-[#157a6d] transition-all mb-4 select-none cursor-pointer outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change Number</span>
      </button>

      <AuthHeader
        title="Enter Passcode"
        subtitle={`We've sent a 6-digit verification code to +91 ${mobile}.`}
      />

      <div className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border border-slate-200 dark:border-zinc-800 bg-[#f4f9f7] dark:bg-zinc-800/60 rounded-2xl text-[#172b26] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#157a6d]/20 focus:border-[#157a6d] transition-all duration-200"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Development Helper hint */}
        {devOtpHint && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold py-2.5 px-4 rounded-2xl text-center select-none tracking-wide max-w-sm mx-auto">
            🛠️ Dev OTP Hint: <span className="underline decoration-2">{devOtpHint}</span>
          </div>
        )}

        {/* Inline error feedback */}
        {error && (
          <p className="text-xs font-semibold text-red-500 text-center select-none animate-[shake_0.2s_ease-in-out]">
            {error}
          </p>
        )}

        {/* Timer countdown and resend options */}
        <div className="flex flex-col items-center gap-2 select-none">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            <span>Code expires in:</span>
            <span className="text-[#157a6d] dark:text-emerald-400 font-bold font-clinical-mono">
              {formatTime(expiryTimer)}
            </span>
          </div>

          <button
            onClick={handleResendClick}
            disabled={resendTimer > 0 || isResending}
            className={`text-xs font-bold transition-all duration-200 outline-none
              ${resendTimer > 0 
                ? "text-slate-400 dark:text-zinc-600 cursor-not-allowed" 
                : "text-[#157a6d] hover:text-[#0f5c52] cursor-pointer hover:underline"
              }
            `}
          >
            {isResending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 animate-spin" />
                Resending...
              </span>
            ) : resendTimer > 0 ? (
              `Resend code in ${resendTimer}s`
            ) : (
              "Resend verification code"
            )}
          </button>
        </div>

        <button
          onClick={() => onVerify(digits.join(""))}
          disabled={isLoading || digits.some((d) => !d) || expiryTimer <= 0}
          className="w-full bg-[#157a6d] hover:bg-[#0f5c52] text-white py-3 px-4 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify & Log In</span>
          )}
        </button>
      </div>

      <AuthFooter />
    </div>
  );
};

export default OTPVerification;
