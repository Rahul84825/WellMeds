import React, { useState } from "react";
import { UserCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

/**
 * Profile Completion step for collecting missing mobile number after Google auth.
 * Zero OTP / SMS. Saves mobile directly to customer profile.
 */
const CompleteProfileModal = ({ onSubmit, isLoading = false }) => {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const clean = mobile.replace(/\D/g, "");
    if (!clean) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    onSubmit({ mobile: clean });
  };

  return (
    <div className="text-left space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <UserCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
            Complete Your Profile
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            You're almost done! Please enter your mobile number to complete your WellMeds account setup.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-[shake_0.2s_ease-in-out]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="complete-mobile" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-0 flex items-center pl-4 h-full pointer-events-none">
              <span className="text-slate-500 dark:text-zinc-400 font-mono text-xs font-bold">+91</span>
              <div className="ml-3 w-px h-4 bg-slate-200 dark:bg-zinc-700" />
            </div>
            <input
              id="complete-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoFocus
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              placeholder="9XXXXXXXXX"
              className="w-full pl-16 pr-4 py-3 bg-[#f4f5f7] dark:bg-zinc-800/80 border border-transparent focus:border-[#157a6d] rounded-2xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all tracking-wider"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || mobile.length < 10}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#157a6d] hover:bg-[#0f5c52] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Save & Complete</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfileModal;
