import React, { useState, useEffect, useRef } from "react";
import { X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import GoogleAuthButton from "./GoogleAuthButton";
import CompleteProfileModal from "./CompleteProfileModal";

const STEP_AUTH = "auth";
const STEP_COMPLETE_PROFILE = "complete_profile";

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalRedirect,
    loginWithGoogle,
    updateProfile,
    user
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_AUTH);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);

  // Reset modal step and inputs when opened/closed
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(STEP_AUTH);
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen && step !== STEP_COMPLETE_PROFILE) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, step, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSuccess = async (credential) => {
    setErrorMsg("");
    try {
      const res = await loginWithGoogle(credential);
      if (res.requiresMobile || (res.user && !res.user.mobile)) {
        setStep(STEP_COMPLETE_PROFILE);
      } else {
        closeAuthModal();
        if (authModalRedirect) {
          navigate(authModalRedirect);
        } else if (res.user?.role === "admin") {
          navigate("/admin");
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Google authentication failed. Please try again.");
    }
  };

  const handleProfileCompleteSubmit = async ({ mobile }) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const updatedUser = await updateProfile({ mobile });
      closeAuthModal();

      if (authModalRedirect) {
        navigate(authModalRedirect);
      } else if (updatedUser.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close by outside click (only if not completing required profile)
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && step !== STEP_COMPLETE_PROFILE) {
      closeAuthModal();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-[fade-in_0.2s_ease-out]"
    >
      <div
        ref={modalRef}
        className="w-[calc(100%-32px)] max-w-md bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 transform scale-100 animate-[zoom-in_0.2s_ease-out]"
      >
        {/* Close Button */}
        {step !== STEP_COMPLETE_PROFILE && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-all select-none cursor-pointer outline-none"
            aria-label="Close auth dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === STEP_AUTH && (
          <div className="text-center py-2 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
                Welcome to WellMeds
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Sign in or create an account with Google to manage your medicines, orders, and prescriptions.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMsg(err)}
                isLoading={isSubmitting}
              />
            </div>

            <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-normal">
              By continuing, you agree to WellMeds' Terms of Service & Privacy Policy.
            </p>
          </div>
        )}

        {step === STEP_COMPLETE_PROFILE && (
          <CompleteProfileModal
            onSubmit={handleProfileCompleteSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
