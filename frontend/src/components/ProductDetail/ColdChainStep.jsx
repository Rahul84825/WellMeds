import React from "react";

const ColdChainStep = ({ stepNumber, title, subtitle, isFirst = false, isMobile = false }) => {
  return (
    <div
      className={`flex font-sans text-left ${
        isMobile ? "gap-[12px] py-[14px]" : "gap-[16px] py-[16px]"
      } ${isFirst ? "pt-0 border-t-0" : "border-t border-dashed border-[#e7dfc9]"}`}
    >
      {/* Number Circle */}
      <div
        className="rounded-full flex items-center justify-center shrink-0 font-bold select-none"
        style={{
          width: isMobile ? "22px" : "26px",
          height: isMobile ? "22px" : "26px",
          background: "rgba(21, 122, 109, 0.1)",
          border: "1.5px solid #157a6d",
          color: "#157a6d",
          fontSize: isMobile ? "11px" : "13px"
        }}
      >
        {stepNumber}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div
          className="font-bold text-[#172b26] leading-snug"
          style={{
            fontSize: isMobile ? "14px" : "15px",
            marginBottom: isMobile ? "3px" : "4px"
          }}
        >
          {title}
        </div>
        <div
          className="text-[#3f544d] leading-[1.5]"
          style={{
            fontSize: isMobile ? "12.5px" : "13px"
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default ColdChainStep;
