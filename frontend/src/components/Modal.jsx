import React, { useEffect } from "react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Box */}
      <div className={`relative bg-surface-container-lowest dark:bg-inverse-surface w-full ${maxWidth} rounded-xl shadow-2xl border border-outline-variant dark:border-outline p-lg z-10 animate-[slide-up_0.3s_ease-out] flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
