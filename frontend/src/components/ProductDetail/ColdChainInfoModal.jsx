import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ColdChainIllustration from "./ColdChainIllustration";
import ColdChainStep from "./ColdChainStep";

const ColdChainInfoModal = ({ isOpen, onClose, triggerRef }) => {
  const modalContainerRef = useRef(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Responsive View Detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Accessibility: Focus Trapping & ESC Key Listener
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const focusableElements = modalContainerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements?.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);

      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="cold-chain-title"
      className="fixed inset-0 w-screen h-screen bg-black/45 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 select-none animate-[fade-in_0.2s_ease-out]"
      style={{
        fontFamily: "'Liberation Sans', 'DejaVu Sans', Arial, sans-serif"
      }}
    >
      {/* Modal Container */}
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-[16px] overflow-hidden relative text-left shadow-[0_30px_70px_rgba(0,0,0,0.25)] animate-[scale-up_0.2s_ease-out] ${
          isMobileView ? "w-full max-w-[340px]" : "w-full max-w-[800px]"
        }`}
      >
        {/* Desktop View Layout */}
        {!isMobileView && (
          <div className="flex flex-row w-full min-h-[420px]">
            {/* Left: Illustrated Visual */}
            <div className="w-[320px] shrink-0 relative flex items-center justify-center">
              <ColdChainIllustration isMobile={false} />
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 p-[40px_44px] flex flex-col justify-between relative">
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#172b26] font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div>
                <div
                  className="font-bold uppercase mb-[16px]"
                  style={{
                    color: "#157a6d",
                    fontSize: "13px",
                    letterSpacing: "3px"
                  }}
                >
                  QUALITY GUARANTEED
                </div>
                <h2
                  id="cold-chain-title"
                  className="font-semibold text-[#172b26] leading-[1.35] mb-[26px]"
                  style={{
                    fontFamily: "'Liberation Serif', Georgia, serif",
                    fontSize: "24px"
                  }}
                >
                  Guaranteed Temperature-Controlled Handling &amp; Shipping
                </h2>

                {/* Steps */}
                <ColdChainStep
                  stepNumber={1}
                  title="Carefully Packed"
                  subtitle="Every order is packed to maintain the exact temperature your medicine needs."
                  isFirst={true}
                  isMobile={false}
                />
                <ColdChainStep
                  stepNumber={2}
                  title="Verified Storage"
                  subtitle="Our storage facilities are closely monitored and verified around the clock."
                  isFirst={false}
                  isMobile={false}
                />
                <ColdChainStep
                  stepNumber={3}
                  title="Insulated Shipping"
                  subtitle="Insulated containers and temperature monitors keep every shipment safe in transit."
                  isFirst={false}
                  isMobile={false}
                />
              </div>

              {/* Got It Button */}
              <button
                type="button"
                onClick={onClose}
                className="mt-[10px] bg-[#157a6d] hover:bg-[#106257] active:scale-98 text-white text-center font-bold text-[15px] tracking-[1px] p-[16px] rounded-[8px] cursor-pointer transition-all w-full select-none outline-none focus:ring-2 focus:ring-[#157a6d]/50"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}

        {/* Mobile View Layout */}
        {isMobileView && (
          <div className="flex flex-col w-full">
            {/* Top Visual */}
            <div className="relative w-full">
              <ColdChainIllustration isMobile={true} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-[14px] left-[14px] w-[28px] h-[28px] rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-[14px] cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Section */}
            <div className="p-[26px_26px_24px] flex flex-col justify-between">
              <div>
                <div
                  className="font-bold uppercase mb-[12px]"
                  style={{
                    color: "#157a6d",
                    fontSize: "11px",
                    letterSpacing: "2px"
                  }}
                >
                  QUALITY GUARANTEED
                </div>
                <h2
                  id="cold-chain-title"
                  className="font-semibold text-[#172b26] leading-[1.35] mb-[20px]"
                  style={{
                    fontFamily: "'Liberation Serif', Georgia, serif",
                    fontSize: "19px"
                  }}
                >
                  Guaranteed Temperature-Controlled Handling &amp; Shipping
                </h2>

                {/* Steps */}
                <ColdChainStep
                  stepNumber={1}
                  title="Carefully Packed"
                  subtitle="Every order is packed to maintain the exact temperature your medicine needs."
                  isFirst={true}
                  isMobile={true}
                />
                <ColdChainStep
                  stepNumber={2}
                  title="Verified Storage"
                  subtitle="Our storage facilities are closely monitored and verified around the clock."
                  isFirst={false}
                  isMobile={true}
                />
                <ColdChainStep
                  stepNumber={3}
                  title="Insulated Shipping"
                  subtitle="Insulated containers and temperature monitors keep every shipment safe in transit."
                  isFirst={false}
                  isMobile={true}
                />
              </div>

              {/* Got It Button */}
              <button
                type="button"
                onClick={onClose}
                className="mt-[8px] bg-[#157a6d] hover:bg-[#106257] active:scale-98 text-white text-center font-bold text-[14px] tracking-[0.5px] p-[15px] rounded-[8px] cursor-pointer transition-all w-full select-none outline-none focus:ring-2 focus:ring-[#157a6d]/50"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ColdChainInfoModal;
