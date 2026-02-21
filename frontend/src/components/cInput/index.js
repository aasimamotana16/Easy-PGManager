import React, { forwardRef } from "react";

const CInput = forwardRef(({
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
  helperText = "", 
  required = false,
  disabled = false,
}, ref) => {
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
    font-semibold text-body-sm lg:text-body transition-colors mb-1.5
    ${error ? "text-danger" : "text-textSecondary"}
  `;

  const handleWheel = (e) => {
    if (document.activeElement.type === "number") {
      e.preventDefault();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputClasses} h-12 lg:h-14 cursor-pointer`}
          >
            {!value && <option value="">Select an option</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" || type === "multiline" ? (
          <textarea
            ref={ref}
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
            ref={ref}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            onWheel={handleWheel}
            className={`${baseInputClasses} h-12 lg:h-10`}
          />
        )}
      </div>

      {error && helperText && (
        <span className="text-[10px] text-danger font-medium leading-none mt-1.5 ml-1">
          {helperText}
        </span>
      )}
    </div>
  );
});

CInput.displayName = "CInput";

export default CInput;
