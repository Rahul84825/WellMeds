import React from "react";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6 select-none">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium px-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AuthHeader;
