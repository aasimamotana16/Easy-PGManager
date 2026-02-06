// src/components/cCheckbox/index.js
import React from "react";

const CCheckbox = ({ label, checked, onChange, className = "" }) => {
  return (
    // Changed cursor-pointer to cursor-default here
    <label className={`flex items-center gap-2 cursor-default ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        // Added cursor-pointer specifically to the checkbox input
        className="h-3 w-4 rounded border border-border text-button-DEFAULT focus:ring-button-DEFAULT cursor-pointer"
      />
      {label && <span className="text-text-secondary text-sm">{label}</span>}
    </label>
  );
};

export default CCheckbox;