import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PhoneLogin from "./PhoneLogin";
import OTPVerification from "./OTPVerification";
import NewUserDetails from "./NewUserDetails";
import { toast } from "sonner";

const STEP_PHONE = "phone";
const STEP_OTP = "otp";
const STEP_ONBOARDING = "onboarding";

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalRedirect,
    sendOtp,
    verifyOtp,
    updateProfile,
    user
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_PHONE);
  const [mobile, setMobile] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const modalRef = useRef(null);

  // Reset modal step and inputs when opened/closed
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(STEP_PHONE);
      setMobile("");
      setDevOtpHint("");
      setErrorMsg("");
      setIsSubmitting(false);
      setIsResending(false);
    }
  }, [isAuthModalOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen && step !== STEP_ONBOARDING) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, step, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = async (phoneVal) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await sendOtp(phoneVal);
      setMobile(phoneVal);
      if (result.devOtp) setDevOtpHint(result.devOtp);
      setStep(STEP_OTP);
      toast.success(`OTP sent to +91 ${phoneVal}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpVal) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const loggedUser = await verifyOtp(mobile, otpVal);
      
      // Look up if user needs onboarding (placeholder name and empty email)
      // Check isNewUser returned from API or local user checks
      const isNew = !loggedUser.email || loggedUser.name.startsWith("User ");

      if (isNew) {
        setStep(STEP_ONBOARDING);
      } else {
        toast.success(`Welcome back, ${loggedUser.name}!`);
        closeAuthModal();
        
        // Redirect logic
        if (authModalRedirect) {
          navigate(authModalRedirect);
        } else if (loggedUser.role === "admin") {
          navigate("/admin");
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Incorrect OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMsg("");
    try {
      const result = await sendOtp(mobile);
      if (result.devOtp) setDevOtpHint(result.devOtp);
      toast.success("OTP resent successfully!");
      return true;
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to resend OTP.");
      return false;
    } finally {
      setIsResending(false);
    }
  };

  const handleOnboardingSubmit = async ({ name, email }) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await updateProfile({ name, email });
      toast.success(`Account setup complete! Welcome, ${updatedUser.name}.`);
      closeAuthModal();

      // Redirect logic
      if (authModalRedirect) {
        navigate(authModalRedirect);
      } else if (updatedUser.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to complete onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close by outside click (only if not onboarding)
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && step !== STEP_ONBOARDING) {
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
        {/* Close Button - hidden during onboarding to prevent partial signup */}
        {step !== STEP_ONBOARDING && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-all select-none cursor-pointer outline-none"
            aria-label="Close auth dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal content transitions */}
        {step === STEP_PHONE && (
          <PhoneLogin
            onSubmit={handlePhoneSubmit}
            isLoading={isSubmitting}
            initialMobile={mobile}
          />
        )}

        {step === STEP_OTP && (
          <OTPVerification
            mobile={mobile}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={() => setStep(STEP_PHONE)}
            isLoading={isSubmitting}
            isResending={isResending}
            devOtpHint={devOtpHint}
            errorMsg={errorMsg}
          />
        )}

        {step === STEP_ONBOARDING && (
          <NewUserDetails
            onSubmit={handleOnboardingSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
