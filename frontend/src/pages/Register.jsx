import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const Register = () => {
  const { loginWithGoogle, registerUser, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time Password Validation States
  const [strengthChecks, setStrengthChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Automatic redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, navigate]);

  // Track password changes to update strength indicators
  useEffect(() => {
    setStrengthChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    });
  }, [password]);

  // Google Sign-In script dynamic loader
  useEffect(() => {
    const scriptId = "google-jssdk";
    let script = document.getElementById(scriptId);

    const initializeGoogleButton = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1028710325492-mockid.apps.googleusercontent.com",
          callback: handleGoogleCallback,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signup_with",
            shape: "pill",
          }
        );
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleButton();
      };
      document.head.appendChild(script);
    } else {
      if (window.google) {
        initializeGoogleButton();
      } else {
        script.onload = () => {
          initializeGoogleButton();
        };
      }
    }
  }, []); // eslint-disable-line

  const handleGoogleCallback = async (response) => {
    const credential = response.credential;
    if (!credential) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const loggedUser = await loginWithGoogle(credential);
      setSuccessMessage("Registration successful! Redirecting...");
      
      setTimeout(() => {
        if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Google Sign-Up failed. Please check your account and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Domain validation: Gmail only
    if (!/@gmail\.com$/i.test(email.trim())) {
      setError("Registration is restricted. Only @gmail.com email addresses are accepted.");
      return;
    }

    // Password strength check
    const isStrong = Object.values(strengthChecks).every(Boolean);
    if (!isStrong) {
      setError("Password does not meet the minimum security requirements.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await registerUser(name, email, password);
      setSuccessMessage(res.message || "Registration successful! A verification link has been sent to your Gmail.");
      // Clear form inputs
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop bg-surface transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl text-left">
        
        {/* Brand Header */}
        <div className="text-center space-y-sm mb-lg">
          <div className="inline-flex p-sm rounded-full bg-primary/10 text-primary mb-xs">
            <span className="material-symbols-outlined text-[32px]">person_add</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
            Create Account
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Register using Gmail to upload prescriptions and purchase medications.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-start gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px] mt-[2px] flex-shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-primary-container/10 border border-primary/30 text-primary p-md rounded-lg text-body-sm flex items-start gap-xs mb-md">
            <span className="material-symbols-outlined text-[18px] mt-[2px] flex-shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Register Forms */}
        <div className="space-y-md">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-xl gap-sm">
              <Loader size="lg" />
              <p className="text-body-sm text-on-surface-variant font-medium">Creating account...</p>
            </div>
          ) : (
            <>
              {/* Google Sign-Up */}
              <div className="flex justify-center py-xs">
                <div id="google-signup-button" className="min-h-[44px]"></div>
              </div>

              {/* Divider */}
              <div className="relative flex py-xs items-center">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-md text-on-surface-variant font-body-sm text-[11px] font-bold uppercase tracking-wider">
                  or register with email
                </span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              {/* Email Registration Form */}
              <form onSubmit={handleEmailRegister} className="space-y-md">
                {/* Name */}
                <div className="space-y-xs">
                  <label htmlFor="name" className="block font-body-sm text-sm font-bold text-on-surface">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                      person
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email (Gmail only) */}
                <div className="space-y-xs">
                  <label htmlFor="email" className="block font-body-sm text-sm font-bold text-on-surface flex justify-between items-center">
                    <span>Email Address</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-xs py-0.5 rounded">Gmail Only</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                  {email && !/@gmail\.com$/i.test(email) && (
                    <p className="text-[11px] text-error flex items-center gap-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Only accounts ending with @gmail.com are accepted.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-xs">
                  <label htmlFor="password" className="block font-body-sm text-sm font-bold text-on-surface">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-md top-[50%] -translate-y-[50%] material-symbols-outlined text-on-surface-variant text-[20px]">
                      lock
                    </span>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>

                  {/* Real-time Strength Meter */}
                  {password && (
                    <div className="mt-sm bg-surface-container-low border border-outline-variant/40 p-md rounded-lg space-y-xs text-[11px] text-on-surface-variant">
                      <p className="font-bold text-[10px] text-on-surface uppercase tracking-wide">Password Requirements:</p>
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
                  className="w-full py-sm px-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-body-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Sign Up</span>
                </button>
              </form>

              {/* Already have an account */}
              <div className="text-center text-body-sm text-on-surface-variant mt-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-bold">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-xl text-center text-body-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-sm">
          By signing up, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Register;
