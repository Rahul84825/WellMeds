import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PhoneLogin from "../components/auth/PhoneLogin";
import OTPVerification from "../components/auth/OTPVerification";
import NewUserDetails from "../components/auth/NewUserDetails";
import { toast } from "sonner";
import SEO from "../components/common/SEO";

const STEP_PHONE = "phone";
const STEP_OTP = "otp";
const STEP_ONBOARDING = "onboarding";

/**
 * AdminLoginPage — standalone login page shown during Maintenance Mode.
 * Renders the full auth flow inline (no MainLayout / AuthModal dependency).
 * Only admin users are granted access after OTP verification.
 */
const AdminLoginPage = () => {
  const { sendOtp, verifyOtp, updateProfile, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_PHONE);
  const [mobile, setMobile] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // If already logged in as admin, go straight to admin panel
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, navigate]);

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
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpVal) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const loggedUser = await verifyOtp(mobile, otpVal);

      // Admin-only enforcement during Maintenance Mode
      if (loggedUser.role !== "admin") {
        // Immediately log out the non-admin user
        await logout();
        setStep(STEP_PHONE);
        setMobile("");
        setDevOtpHint("");
        toast.error("Access restricted. Only administrators can log in during maintenance.");
        return;
      }

      const isNew = !loggedUser.email || loggedUser.name.startsWith("User ");
      if (isNew) {
        setStep(STEP_ONBOARDING);
      } else {
        toast.success(`Welcome back, ${loggedUser.name}!`);
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Incorrect OTP. Please try again."
      );
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

      // Admin-only guard after onboarding too
      if (updatedUser.role !== "admin") {
        await logout();
        setStep(STEP_PHONE);
        toast.error("Access restricted. Only administrators can log in during maintenance.");
        return;
      }

      toast.success(`Account setup complete! Welcome, ${updatedUser.name}.`);
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to complete onboarding."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 15% -10%, rgba(20,160,136,0.18), transparent 60%), radial-gradient(900px 600px at 100% 110%, rgba(224,160,61,0.10), transparent 55%), #0A2E27",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 18px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SEO
        title="Admin Login — WellMeds"
        description="WellMeds administrator login portal."
        noindex
      />

      {/* Logo */}
      <div
        style={{
          fontFamily: "'Zilla Slab', serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#FAF6EC",
          letterSpacing: "-0.5px",
          marginBottom: 32,
        }}
      >
        wm<span style={{ color: "#14A088" }}>.</span>
        <span
          style={{
            display: "block",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 400,
            fontSize: 11,
            color: "rgba(250,246,236,0.5)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Admin Access
        </span>
      </div>

      {/* Auth card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
          padding: "32px 28px",
          position: "relative",
        }}
      >
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
          <NewUserDetails onSubmit={handleOnboardingSubmit} isLoading={isSubmitting} />
        )}
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 12,
          color: "rgba(250,246,236,0.35)",
          textAlign: "center",
        }}
      >
        Site under maintenance · Admin access only
      </p>
    </div>
  );
};

export default AdminLoginPage;
