import React, { useState, useRef } from "react";
import ColdChainInfoModal from "./ColdChainInfoModal";

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
        className="inline-flex items-center justify-center w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full border border-[#157a6d] text-[#157a6d] bg-white hover:bg-[#157a6d] hover:text-white cursor-pointer shrink-0 select-none ml-1.5"
      >
        <span className="font-serif italic text-[11px] sm:text-[12px] font-bold leading-none select-none">
          i
        </span>
      </button>

      {/* Instant Modal */}
      {isModalOpen && (
        <ColdChainInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          triggerRef={buttonRef}
        />
      )}
    </>
  );
};

export default ColdChainInfoButton;
