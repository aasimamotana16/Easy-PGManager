// src/components/cTextArea/index.js
import React from "react";

const CTextArea = ({
  label,
  value,
  onChange,
  rows = 4,
  placeholder = "",
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-md border border-border bg-card text-text-secondary focus:outline-none focus:ring-2 focus:ring-button-DEFAULT transition"
      />
    </div>
  );
};

export default CTextArea;
