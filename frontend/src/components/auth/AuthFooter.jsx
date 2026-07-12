import React from "react";

const AuthFooter = () => {
  return (
    <div className="text-center mt-6 select-none border-t border-slate-100 dark:border-zinc-800/80 pt-4">
      <p className="text-[11px] leading-relaxed text-slate-400 dark:text-zinc-500 font-medium px-4">
        By continuing, you agree to WellMeds'{" "}
        <a href="/terms" className="text-[#038076] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#038076] hover:underline">
          Privacy Policy
        </a>.
      </p>
    </div>
  );
};

export default AuthFooter;
