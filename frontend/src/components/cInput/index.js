import React from "react";

const CInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  rows = 3,
  name,
  options = [],
  error = false, // New prop: boolean to trigger error state
  required = false, // New prop: to show the red asterisk
  disabled = false,
}) => {
  // Common classes for dynamic states
  const baseInputClasses = `w-full px-3 py-2 text-sm border rounded-md transition focus:outline-none focus:ring-0
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-card"}
    ${
      error
        ? "border-red-600 focus:border-red-600 text-red-600 placeholder-red-300"
        : "border-border focus:border-primary text-text-secondary"
    }`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          className={`text-xs font-medium transition-colors ${
            error ? "text-red-600" : "text-text-secondary"
          }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* SELECT */}
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClasses} h-12`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" || type === "multiline" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseInputClasses}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputClasses} h-10`}
        />
      )}
    </div>
  );
};

export default CInput;