import React from "react";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6 select-none">
      <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-normal px-2 sm:px-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AuthHeader;
