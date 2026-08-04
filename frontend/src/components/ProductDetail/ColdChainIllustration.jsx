import React from "react";

const ColdChainIllustration = ({ isMobile = false }) => {
  return (
    <div
      className={`relative select-none flex items-center justify-center overflow-hidden shrink-0 ${
        isMobile ? "w-full h-[190px]" : "w-full sm:w-[320px] h-[220px] sm:h-full p-[30px]"
      }`}
      style={{
        background: "linear-gradient(160deg, #0f3b34, #0a2e28)",
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px),
          linear-gradient(160deg, #0f3b34, #0a2e28)
        `
      }}
    >
      {/* Snowflake Accent */}
      <div
        className="absolute color-[#8fd6c8] font-bold select-none pointer-events-none"
        style={{
          color: "#8fd6c8",
          fontSize: isMobile ? "20px" : "26px",
          top: isMobile ? "12px" : "14px",
          right: "14px"
        }}
      >
        ❄
      </div>

      {/* Cooler Graphic Container */}
      {isMobile ? (
        // Mobile Sized Cooler (180x150px)
        <div className="relative w-[180px] h-[150px]">
          {/* Cooler Box */}
          <div
            className="absolute bottom-0 w-[180px] h-[120px] bg-[#eef2f0] rounded-[10px]"
            style={{ border: "3px solid #c7d0cc" }}
          />

          {/* Cooler Lid */}
          <div
            className="absolute top-0 left-[8px] right-[8px] h-[18px] bg-[#d7ded9]"
            style={{ borderRadius: "6px 6px 0 0" }}
          />

          {/* Slot 1 (Teal) */}
          <div
            className="absolute bottom-[16px] left-[20px] w-[28px] h-[64px] bg-white rounded-[5px_5px_3px_3px]"
            style={{ border: "2px solid #157a6d" }}
          >
            <div
              className="absolute -top-[7px] left-[6px] w-[13px] h-[8px] bg-[#157a6d] rounded-[2px]"
            />
          </div>

          {/* Slot 2 (Mustard) */}
          <div
            className="absolute bottom-[16px] left-[56px] w-[28px] h-[48px] bg-[#fdf6ea] rounded-[5px_5px_3px_3px]"
            style={{ border: "2px solid #b08d3e" }}
          >
            <div
              className="absolute -top-[7px] left-[6px] w-[13px] h-[8px] bg-[#b08d3e] rounded-[2px]"
            />
          </div>

          {/* Slot 3 (Teal) */}
          <div
            className="absolute bottom-[16px] left-[90px] w-[28px] h-[70px] bg-white rounded-[5px_5px_3px_3px]"
            style={{ border: "2px solid #157a6d" }}
          >
            <div
              className="absolute -top-[7px] left-[6px] w-[13px] h-[8px] bg-[#157a6d] rounded-[2px]"
            />
          </div>

          {/* Slot 4 (Mustard) */}
          <div
            className="absolute bottom-[16px] left-[126px] w-[28px] h-[44px] bg-[#fdf6ea] rounded-[5px_5px_3px_3px]"
            style={{ border: "2px solid #b08d3e" }}
          >
            <div
              className="absolute -top-[7px] left-[6px] w-[13px] h-[8px] bg-[#b08d3e] rounded-[2px]"
            />
          </div>
        </div>
      ) : (
        // Desktop Sized Cooler (220x190px)
        <div className="relative w-[220px] h-[190px]">
          {/* Cooler Box */}
          <div
            className="absolute bottom-0 w-[220px] h-[150px] bg-[#eef2f0] rounded-[10px]"
            style={{ border: "3px solid #c7d0cc" }}
          />

          {/* Cooler Lid */}
          <div
            className="absolute top-0 left-[10px] right-[10px] h-[22px] bg-[#d7ded9]"
            style={{ borderRadius: "6px 6px 0 0" }}
          />

          {/* Slot 1 (Teal) */}
          <div
            className="absolute bottom-[20px] left-[26px] w-[34px] h-[80px] bg-white rounded-[6px_6px_3px_3px]"
            style={{ border: "2px solid #157a6d" }}
          >
            <div
              className="absolute -top-[8px] left-[8px] w-[16px] h-[10px] bg-[#157a6d] rounded-[2px]"
            />
          </div>

          {/* Slot 2 (Mustard) */}
          <div
            className="absolute bottom-[20px] left-[70px] w-[34px] h-[60px] bg-[#fdf6ea] rounded-[6px_6px_3px_3px]"
            style={{ border: "2px solid #b08d3e" }}
          >
            <div
              className="absolute -top-[8px] left-[8px] w-[16px] h-[10px] bg-[#b08d3e] rounded-[2px]"
            />
          </div>

          {/* Slot 3 (Teal) */}
          <div
            className="absolute bottom-[20px] left-[112px] w-[34px] h-[90px] bg-white rounded-[6px_6px_3px_3px]"
            style={{ border: "2px solid #157a6d" }}
          >
            <div
              className="absolute -top-[8px] left-[8px] w-[16px] h-[10px] bg-[#157a6d] rounded-[2px]"
            />
          </div>

          {/* Slot 4 (Mustard) */}
          <div
            className="absolute bottom-[20px] left-[156px] w-[34px] h-[55px] bg-[#fdf6ea] rounded-[6px_6px_3px_3px]"
            style={{ border: "2px solid #b08d3e" }}
          >
            <div
              className="absolute -top-[8px] left-[8px] w-[16px] h-[10px] bg-[#b08d3e] rounded-[2px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdChainIllustration;
