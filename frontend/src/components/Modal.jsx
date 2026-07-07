import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md", showCloseButton = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 w-screen h-screen bg-[#0f172a]/45 backdrop-blur-[8px] -webkit-backdrop-blur-[8px] z-[9999] flex items-center justify-center p-md cursor-zoom-out select-none animate-fade-in"
    >
      {/* Modal Box */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-surface-container-lowest dark:bg-zinc-900 w-full ${maxWidth} rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-lg z-10 flex flex-col max-h-[90vh] cursor-default select-none animate-modal-zoom-in`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-md mb-md">
          <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-650 cursor-pointer active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
