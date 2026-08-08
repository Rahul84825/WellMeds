import React from "react";
import desktopImg from "../../assets/cold-chains/desktop.png";
import mobileImg from "../../assets/cold-chains/mobile.png";

const ColdChainIllustration = ({ isMobile = false }) => {
  return (
    <div
      className={`relative select-none flex items-center justify-center overflow-hidden shrink-0 w-full h-full bg-white ${
        isMobile ? "h-[220px]" : "w-full sm:w-[320px] h-full"
      }`}
    >
      <img
        src={isMobile ? desktopImg : mobileImg}
        alt="Cold Chain Temperature Control Facility"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ColdChainIllustration;
