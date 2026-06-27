import React, { useState } from "react";

const FloatingWhatsApp = () => {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.open("https://wa.me/919511289914", "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="fixed z-[9990] flex items-center gap-3
                 right-4 bottom-4
                 md:right-5 md:bottom-5
                 lg:right-6 lg:bottom-6"
    >
      {/* Desktop hover tooltip — hidden on mobile */}
      <div
        role="tooltip"
        className={`
          hidden lg:flex items-center whitespace-nowrap
          bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100
          border border-slate-200 dark:border-zinc-700
          px-4 py-2 rounded-xl shadow-lg
          text-sm font-semibold tracking-wide
          transition-all duration-300 origin-right
          ${hovered
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-2 pointer-events-none"}
        `}
        style={hovered ? { animation: "wa-tooltip-in 0.2s ease-out both" } : {}}
      >
        <span className="mr-1">💬</span>
        <span>+91 95112 89914</span>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Chat with WellMeds on WhatsApp"
        className="
          w-14 h-14
          rounded-full
          bg-[#25D366] hover:bg-[#1ebe5d]
          text-white
          flex items-center justify-center
          shadow-[0_4px_15px_rgba(37,211,102,0.45)]
          hover:shadow-[0_6px_24px_rgba(37,211,102,0.65)]
          transition-all duration-300
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 focus:ring-offset-2
          select-none cursor-pointer
        "
        style={{ animation: "pulse-glow 3.5s ease-in-out infinite" }}
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 fill-white"
          aria-hidden="true"
        >
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.479 1.332 5.006L2 22l5.176-1.358a9.941 9.941 0 004.836 1.234c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.791 14.195c-.244.686-1.427 1.348-1.959 1.41-.497.058-1.144.116-3.327-.78-2.784-1.147-4.577-3.99-4.717-4.178-.14-.188-1.127-1.498-1.127-2.859 0-1.361.713-2.029.967-2.302.254-.272.553-.34.737-.34.184 0 .368.002.528.01.168.008.396-.064.62.484.23.564.787 1.92.855 2.058.068.138.113.3.02.487-.092.188-.138.305-.276.467-.138.162-.292.361-.418.484-.138.136-.282.285-.12.563.162.278.718 1.184 1.542 1.916.824.732 1.52.959 1.737 1.05.217.091.344.077.472-.069.128-.146.553-.64.701-.858.148-.218.296-.184.498-.109.202.075 1.282.605 1.503.716.221.111.369.166.423.259.054.093.054.54-.19 1.226z" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
