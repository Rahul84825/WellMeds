import React, { useState } from "react";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

/**
 * Reusable "Continue with Google" button component.
 * Features a custom WellMeds design with the official Google multi-colored SVG logo.
 */
const GoogleAuthButton = ({ onSuccess, onError, isLoading = false, className = "" }) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleCredentialResponse = async (idToken) => {
    if (!idToken) return;
    setInternalLoading(true);
    try {
      if (onSuccess) {
        await onSuccess(idToken);
      }
    } catch (err) {
      if (onError) {
        onError(err.response?.data?.message || err.message || "Google Authentication failed. Please try again.");
      }
    } finally {
      setInternalLoading(false);
    }
  };

  // Fallback explicit Google login launcher
  const launchGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleCredentialResponse(tokenResponse.access_token);
      }
    },
    onError: () => {
      if (onError) onError("Google Sign-In was cancelled or encountered an error.");
    },
  });

  const busy = isLoading || internalLoading;

  return (
    <div className={`w-full ${className}`}>
      {busy ? (
        <button
          disabled
          className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2.5 text-slate-600 dark:text-zinc-300 text-xs font-bold cursor-not-allowed opacity-80 shadow-xs"
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#157a6d]" />
          <span>Verifying with Google...</span>
        </button>
      ) : (
        <div className="w-full relative group">
          {/* Custom Styled WellMeds Google Button */}
          <button
            type="button"
            onClick={() => launchGoogleLogin()}
            className="w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-slate-50/90 dark:hover:bg-zinc-700/80 border border-slate-200/90 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Official Google Multi-colored G Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Hidden Standard Google OAuth Component for ID token extraction */}
          <div className="hidden-google-login-target hidden">
            <GoogleLogin
              onSuccess={(res) => handleCredentialResponse(res.credential)}
              onError={() => onError && onError("Google Sign-In failed.")}
              useOneTap={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
