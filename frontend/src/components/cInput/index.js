// src/components/cInput/index.js
import React from "react";

const CInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-1 py-1 border border-border bg-card text-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-button-DEFAULT transition
                    rounded-sm ${className}`}
      />
    </div>
  );
};

export default CInput;
