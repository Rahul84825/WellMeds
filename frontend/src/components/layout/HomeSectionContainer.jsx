import React from "react";

const HomeSectionContainer = ({ children, className = "" }) => {
  return (
    <div className={`home-section-container ${className}`}>
      {children}
    </div>
  );
};

export default HomeSectionContainer;
