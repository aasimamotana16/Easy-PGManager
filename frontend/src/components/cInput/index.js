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
  error = false,
  required = false,
  disabled = false,
}) => {
  // Use theme tokens for colors and responsive text sizes [cite: 2026-02-09]
  const baseInputClasses = `
    w-full px-4 py-3 rounded-md border transition-all duration-200 focus:outline-none
    text-body-sm lg:text-body
    ${disabled ? "bg-border/30 cursor-not-allowed opacity-70" : "bg-background"}
    ${
      error
        ? "border-danger focus:border-danger text-danger placeholder:text-danger/50"
        : "border-border focus:border-primary text-textPrimary"
    }
  `;

  const labelClasses = `
    font-semibold text-body-sm lg:text-body transition-colors
    ${error ? "text-danger" : "text-textSecondary"}
  `;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* SELECT */}
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClasses} h-12 lg:h-14 cursor-pointer`}
        >
          {/* Added a default placeholder-like option if no value */}
          {!value && <option value="">Select an option</option>}
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
          className={`${baseInputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputClasses} h-12 lg:h-10`}
        />
      )}
      
      {/* Optional: Error Message placeholder 
      {error && (
        <span className="text-xs lg:text-sm text-danger font-medium">
          This field is required or invalid.
        </span>
      )}*/}
    </div>
  );
};

export default CInput;