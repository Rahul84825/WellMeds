import React, { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

const PhoneLogin = ({ onSubmit, isLoading, initialMobile = "" }) => {
  const [mobile, setMobile] = useState(initialMobile);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    const inputVal = e.target.value;
    
    // Sanitize immediately: remove any non-digits, limit length to 10
    const sanitized = inputVal.replace(/\D/g, "").slice(0, 10);
    setMobile(sanitized);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text") || "";
    
    // Sanitize pasted content: keep only digits and slice to max 10
    const sanitized = pastedText.replace(/\D/g, "").slice(0, 10);
    setMobile(sanitized);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }

    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    onSubmit(mobile);
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="Welcome to WellMeds"
        subtitle="Continue to access your account, prescriptions, and order updates via Mobile OTP."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-2 select-none">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-sm font-bold text-slate-400 dark:text-zinc-550 select-none pr-1">
                +91
              </span>
              <Phone className="w-4 h-4 text-slate-400 dark:text-zinc-550 pl-1" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
              maxLength={10}
              value={mobile}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder="Enter 10-digit number"
              className={`w-full pl-16 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border rounded-xl text-sm font-semibold tracking-wide text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-550 focus:outline-none focus:ring-2 focus:ring-[#038076]/25 transition-all duration-200
                ${error 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-slate-100 dark:border-zinc-800 focus:border-[#038076]"
                }
              `}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-xs font-semibold text-red-500 mt-2 select-none animate-[shake_0.2s_ease-in-out]">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || mobile.length !== 10}
          className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Send One-Time Passcode</span>
          )}
        </button>
      </form>

      <AuthFooter />
    </div>
  );
};

export default PhoneLogin;
