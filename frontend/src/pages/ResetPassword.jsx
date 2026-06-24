import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api/authService";
import Loader from "../components/Loader";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  // Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password Strength Checker
  const [strengthChecks, setStrengthChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setStrengthChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Verify strength checks
    const isStrong = Object.values(strengthChecks).every(Boolean);
    if (!isStrong) {
      setError("Password does not meet minimum security strength requirements.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await authService.resetPassword(token, password);
      setSuccessMessage(res.message || "Your password has been reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-xl px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl text-left">
        
        {/* Success Card */}
        {successMessage ? (
          <div className="text-center space-y-md py-md animate-fade-in">
            <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              Password Reset!
            </h2>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-md">
              <Link
                to="/login"
                className="inline-flex w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 justify-center items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Proceed to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="text-center space-y-sm mb-lg">
              <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
                <span className="material-symbols-outlined text-[32px]">lock_open</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                New Password
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Configure a new secure password for your WellMeds patient account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-start gap-xs mb-md">
                <span className="material-symbols-outlined text-[18px] mt-[2px] flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-md">
              {/* New Password */}
              <div className="space-y-xs">
                <label htmlFor="password" className="block font-body-sm text-sm font-bold text-on-surface">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                    lock
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                {/* Password Strength Requirement Indicators */}
                {password && (
                  <div className="mt-sm bg-surface-container-low border border-outline-variant/40 p-md rounded-lg space-y-xs text-[11px] text-on-surface-variant">
                    <p className="font-bold text-[10px] text-on-surface uppercase tracking-wide">Password Strength Requirements:</p>
                    <div className="grid grid-cols-2 gap-x-sm gap-y-1">
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[14px] ${strengthChecks.length ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {strengthChecks.length ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Min. 8 Characters</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[14px] ${strengthChecks.uppercase ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {strengthChecks.uppercase ? 'check_circle' : 'cancel'}
                        </span>
                        <span>1 Uppercase Letter</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[14px] ${strengthChecks.lowercase ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {strengthChecks.lowercase ? 'check_circle' : 'cancel'}
                        </span>
                        <span>1 Lowercase Letter</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[14px] ${strengthChecks.number ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {strengthChecks.number ? 'check_circle' : 'cancel'}
                        </span>
                        <span>1 Number</span>
                      </div>
                      <div className="flex items-center gap-xs col-span-2">
                        <span className={`material-symbols-outlined text-[14px] ${strengthChecks.special ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {strengthChecks.special ? 'check_circle' : 'cancel'}
                        </span>
                        <span>1 Special Character (@$!%*?&#)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-xs">
                <label htmlFor="confirmPassword" className="block font-body-sm text-sm font-bold text-on-surface">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                    lock
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-error flex items-center gap-xs font-medium">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader size="sm" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
