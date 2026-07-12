import React, { useState } from "react";
import { User, Mail, Loader2 } from "lucide-react";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

const NewUserDetails = ({ onSubmit, isLoading }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    const emailTrim = email.trim();
    if (!emailTrim) {
      newErrors.email = "Email address is required.";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(emailTrim)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const name = lastName.trim() 
      ? `${firstName.trim()} ${lastName.trim()}`
      : firstName.trim();

    onSubmit({ name, email: emailTrim });
  };

  return (
    <div className="w-full animate-[fade-in_0.3s_ease-out]">
      <AuthHeader
        title="Complete Profile"
        subtitle="Please provide your details to finish setting up your account."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-2 select-none">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-550" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, firstName: "" }));
                  setFirstName(e.target.value);
                }}
                placeholder="John"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border rounded-xl text-sm font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-555 focus:outline-none focus:ring-2 focus:ring-[#038076]/25 transition-all duration-200
                  ${errors.firstName 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-slate-100 dark:border-zinc-800 focus:border-[#038076]"
                  }
                `}
                autoFocus
              />
            </div>
            {errors.firstName && (
              <p className="text-xs font-semibold text-red-500 mt-2 select-none animate-[shake_0.2s_ease-in-out]">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-555 mb-2 select-none">
              Last Name <span className="text-[10px] text-slate-350 dark:text-zinc-600 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-555" />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 focus:border-[#038076] rounded-xl text-sm font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-555 focus:outline-none focus:ring-2 focus:ring-[#038076]/25 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-555 mb-2 select-none">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-555" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setErrors((prev) => ({ ...prev, email: "" }));
                setEmail(e.target.value);
              }}
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border rounded-xl text-sm font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-555 focus:outline-none focus:ring-2 focus:ring-[#038076]/25 transition-all duration-200
                ${errors.email 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-slate-100 dark:border-zinc-800 focus:border-[#038076]"
                }
              `}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-500 mt-2 select-none animate-[shake_0.2s_ease-in-out]">
              {errors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <span>Complete Onboarding</span>
          )}
        </button>
      </form>

      <AuthFooter />
    </div>
  );
};

export default NewUserDetails;
