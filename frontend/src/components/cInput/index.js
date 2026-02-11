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
  helperText = "", 
  required = false,
  disabled = false,
}) => {
  // Use theme tokens for colors [cite: 2026-02-09]
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

  return (
    /* We use flex-col and remove 'relative' from here. 
       The error message will now occupy real space, increasing the total height of the component.
    */
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* SELECT */}
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
      </div>

      {/* STATIC POSITIONING: This increases the field size when the error exists.
          The 'mt-1.5' ensures there is a specific gap between the input and the red text.
      */}
      {error && helperText && (
        <span className="text-[10px] text-danger font-medium leading-none mt-1.5 ml-1">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CInput;