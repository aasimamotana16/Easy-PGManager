// src/components/cFormCard/index.js
import React from "react";

const CFormCard = ({ children, className = "" }) => {
  return (
    <div
      className={`
        bg-card
        text-text-primary
        border border-border
        rounded-2xl
        p-6 md:p-10
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default CFormCard;
