import React, { forwardRef, useState } from "react";

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
  const [isFocused, setIsFocused] = useState(false);

  // Determine if we should show the floating label
  // Show label when: input is focused, OR there's a value, OR there's an error
  const showFloatingLabel = isFocused || value?.length > 0 || error;

  // Base input classes - NO shadow, clean border
  const baseInputClasses = `
    w-full px-4 py-3 rounded-md border-2 transition-all duration-200 focus:outline-none
    text-body-sm lg:text-body
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white"}
    ${
      error
        ? "border-red-500 focus:border-red-600 text-gray-800 placeholder-gray-400"
        : "border-gray-300 focus:border-amber-600 text-gray-800 placeholder-gray-400"
    }
  `;

  // Floating label classes - solid white background, no shadow, proper padding
  const floatingLabelClasses = `
    absolute left-2 transition-all duration-200 pointer-events-none
    ${showFloatingLabel 
      ? "top-[-10px] text-xs bg-white px-1" 
      : "top-1/2 -translate-y-1/2 text-sm text-gray-500"
    }
    ${error ? "text-red-600 font-semibold" : isFocused ? "text-amber-600 font-semibold" : "text-gray-500"}
  `;

  const handleWheel = (e) => {
    if (document.activeElement.type === "number") {
      e.preventDefault();
    }
  };

  // For select, textarea - use traditional label display
  if (type === "select") {
    return (
      <div className={`flex flex-col ${className} mb-4`}>
        {label && (
          <label className={`font-medium text-sm text-gray-700 mb-1 ${error ? "text-red-600" : ""}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClasses} h-12 cursor-pointer`}
        >
          {!value && <option value="">Select an option</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-red-500 font-medium mt-1 pl-4 block text-left">
  {error ? helperText : ""}
</span>
      </div>
    );
  }

  if (type === "textarea" || type === "multiline") {
    return (
      <div className={`flex flex-col ${className} mb-4`}>
        {label && (
          <label className={`font-medium text-sm text-gray-700 mb-1 ${error ? "text-red-600" : ""}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
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
        <span className="text-xs text-red-500 font-medium mt-1 pl-4 block text-left ">
  {error ? helperText : ""}
</span>
      </div>
    );
  }

  // For regular inputs - use floating label pattern
  return (
    <div className={`flex flex-col ${className} mb-3`}>
      <div className="relative">
        {/* Floating Label */}
        {label && (
          <label
            className={floatingLabelClasses}
            style={showFloatingLabel ? { zIndex: 10 } : {}}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={showFloatingLabel ? "" : placeholder}
          disabled={disabled}
          onWheel={handleWheel}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${baseInputClasses} h-12 ${showFloatingLabel ? "pt-3" : ""}`}
        />
      </div>

      {/* Error message below input */}
      <span className="text-xs text-red-500 font-medium mt-1  pl-2 block text-left ">
  {error ? helperText : ""}
</span>
    </div>
  );
});

CInput.displayName = "CInput";

export default CInput;
