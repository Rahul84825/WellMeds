import React, { useState } from "react";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

/**
 * Reusable Google authentication button component matching the WellMeds authentication design system.
 */
const GoogleAuthButton = ({
  onSuccess,
  onError,
  isLoading = false,
  className = "",
  buttonText = "Continue with Google",
}) => {
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
        onError(
          err.response?.data?.message ||
          err.message ||
          "Google Authentication failed. Please try again."
        );
      }
    } finally {
      setInternalLoading(false);
    }
  };

  // Explicit Google login launcher
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
          type="button"
          className="w-full py-3 sm:py-3.5 px-4 rounded-[10px] bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] flex items-center justify-center gap-2.5 text-[#3f544d] text-[12.5px] sm:text-[14px] font-semibold cursor-not-allowed opacity-80"
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#157a6d]" />
          <span>Verifying with Google...</span>
        </button>
      ) : (
        <div className="w-full relative group">
          <button
            type="button"
            onClick={() => launchGoogleLogin()}
            className="w-full py-3 sm:py-3.5 px-4 rounded-[10px] bg-white hover:bg-[#f7f8f6] border-[1.5px] border-[#a8c2b6] text-[#172b26] text-[12.5px] sm:text-[14px] font-semibold transition-all duration-150 flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer shadow-xs hover:shadow-sm"
          >
            {/* Google Multi-colored SVG Logo matching design */}
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.3-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.4 0 10.3-2 14-5.4l-6.5-5.5C29.3 35.7 26.8 36.5 24 36.5c-5.4 0-10-3.4-11.6-8.2l-6.6 5.1C9.5 40.5 16.2 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.2 5.4-6 6.9l6.5 5.5c-.5.4 7.2-5.3 7.2-16.4 0-1.2-.1-2.4-.4-3.5z"
              />
            </svg>
            <span>{buttonText}</span>
          </button>

          {/* Hidden Standard Google OAuth Component */}
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
