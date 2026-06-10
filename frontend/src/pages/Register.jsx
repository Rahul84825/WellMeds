import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please accept the terms and conditions.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-xl px-margin-desktop bg-surface dark:bg-surface-dim transition-colors duration-300">
      <div className="absolute inset-0 medical-pattern"></div>

      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-xl text-left">
        <div className="text-center space-y-sm mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed-dim font-bold">
            Create Account
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            Register to track prescriptions and manage orders.
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs mb-lg animate-pulse">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-md">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start gap-sm">
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 mt-0.5"
            />
            <label htmlFor="agree-checkbox" className="text-body-sm text-on-surface-variant dark:text-surface-variant cursor-pointer select-none">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold py-sm rounded-lg font-label-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" color="white" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-lg text-center text-body-sm text-on-surface-variant dark:text-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="text-primary dark:text-primary-fixed-dim hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
