// src/components/cSelect/index.js
import React from "react";

const CSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-xl border border-border bg-card text-text-secondary focus:outline-none focus:ring-2 focus:ring-button-DEFAULT transition"
      >
        <option value="">-- Select --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CSelect;
