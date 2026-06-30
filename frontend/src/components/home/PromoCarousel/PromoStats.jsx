import React from "react";

const PromoStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-md w-full">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white/10 dark:bg-black/25 backdrop-blur-md border border-white/15 dark:border-zinc-800/80 p-lg rounded-2xl shadow-lg flex flex-col justify-center items-center text-center space-y-xs hover:bg-white/15 transition-all duration-300"
        >
          <span className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {stat.value}
          </span>
          <span className="text-xs font-bold text-white/90">
            {stat.label}
          </span>
          <span className="text-[10px] text-white/65 font-medium">
            {stat.desc}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PromoStats;
