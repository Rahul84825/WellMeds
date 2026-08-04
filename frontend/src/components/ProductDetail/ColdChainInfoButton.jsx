import React, { useState, useRef, lazy, Suspense } from "react";

// Performance Optimization: Lazy load modal bundle on user demand
const ColdChainInfoModal = lazy(() => import("./ColdChainInfoModal"));

const ColdChainInfoButton = ({ isColdChain }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef(null);

  if (!isColdChain) return null;

  const handleOpen = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Circular Info Button (i) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        aria-label="Learn more about Cold Chain Storage"
        title="Cold Chain Storage Info"
        className="inline-flex items-center justify-center w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full border border-[#157a6d] text-[#157a6d] bg-white hover:bg-[#157a6d] hover:text-white transition-all duration-200 cursor-pointer shadow-xs hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#157a6d]/50 shrink-0 select-none ml-1.5"
      >
        <span className="font-serif italic text-[11px] sm:text-[12px] font-bold leading-none select-none">
          i
        </span>
      </button>

      {/* Lazy Loaded Modal */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <ColdChainInfoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            triggerRef={buttonRef}
          />
        </Suspense>
      )}
    </>
  );
};

export default ColdChainInfoButton;
