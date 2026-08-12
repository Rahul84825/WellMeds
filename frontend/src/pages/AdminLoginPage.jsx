import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import SEO from "../components/common/SEO";
import { ShieldCheck } from "lucide-react";

/**
 * AdminLoginPage — standalone login page shown during Maintenance Mode.
 * Renders the Google auth card inline (no MainLayout / AuthModal dependency).
 */
const AdminLoginPage = () => {
  const { loginWithGoogle, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as admin, go straight to admin panel
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleGoogleSuccess = async (credential) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await loginWithGoogle(credential);
      if (res.user?.role !== "admin") {
        await logout();
        setErrorMsg("Access restricted. Only administrators can log in to the admin portal.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Google authentication failed.");
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
        <div className="text-center py-2 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
              Admin Portal Sign In
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Authenticate with your authorized Google administrator account.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
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
        </div>
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 12,
          color: "rgba(250,246,236,0.35)",
          textAlign: "center",
        }}
      >
        WellMeds Administrator Portal
      </p>
    </div>
  );
};

export default AdminLoginPage;
