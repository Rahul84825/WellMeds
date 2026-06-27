import React from "react";

export const FloatingConsultButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-xl right-xl bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
    >
      <span className="material-symbols-outlined text-3xl">chat_bubble</span>
      <span className="absolute right-full mr-sm bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Talk to a Pharmacist
      </span>
    </button>
  );
};

export default FloatingConsultButton;
