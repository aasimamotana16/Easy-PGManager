// src/components/cInput/index.js
import React from "react";

const CInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  rows = 3, // for textarea
  name,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 border border-border bg-card text-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-amber transition
                    rounded-sm ${className}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-border bg-card text-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-amber transition
                    rounded-sm ${className}`}
        />
      )}
    </div>
  );
};

export default CInput;
