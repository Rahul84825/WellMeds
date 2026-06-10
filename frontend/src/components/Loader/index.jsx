import React from "react";

const Loader = ({ size = "md", color = "primary", className = "" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  };

  const colorClasses = {
    primary: "border-primary/20 border-t-primary",
    secondary: "border-secondary/20 border-t-secondary",
    white: "border-white/20 border-t-white"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
