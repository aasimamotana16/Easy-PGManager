// src/components/cFormCard/index.js
import React from "react";

const CFormCard = ({ children, className = "" }) => {
  return (
    <div
      className={`p-8 md:p-20 rounded-xl bg-card text-text-secondary shadow-card hover:shadow-hover transition ${className}`}
    >
      {children}
    </div>
  );
};

export default CFormCard;
