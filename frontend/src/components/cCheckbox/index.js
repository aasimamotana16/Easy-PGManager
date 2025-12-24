// src/components/cCheckbox/index.js
import React from "react";

const CCheckbox = ({ label, checked, onChange, className = "" }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border border-border text-button-DEFAULT focus:ring-button-DEFAULT"
      />
      <span className="text-text-secondary text-sm">{label}</span>
    </label>
  );
};

export default CCheckbox;
