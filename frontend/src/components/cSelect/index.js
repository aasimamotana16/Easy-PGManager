import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  name,
  error = false,
  helperText = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find selected option
  const selectedOption = options.find((opt) =>
    (typeof opt === "string" ? opt : opt.value) === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : "Select an option";

  const handleOptionClick = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  // Border classes based on error state
  const borderClasses = error
    ? "border-red-500 focus:border-red-600"
    : "border-gray-300 focus:border-amber-600";

  return (
    <div
      className={`flex flex-col gap-1 mb-4 relative ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <label className={`text-sm font-medium ${error ? "text-red-600" : "text-gray-700"}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-md border-2 ${borderClasses} bg-white text-gray-700 flex justify-between items-center cursor-pointer transition focus:outline-none`}
      >
        <span
          className={`text-body-sm lg:text-body ${
            !value ? "text-gray-400" : "text-gray-800"
          }`}
        >
          {displayLabel}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-600" : "text-gray-400"
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 top-full bg-white border border-gray-300 rounded-md shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Default Option */}
          <div
            className="px-4 py-2 text-sm text-gray-400 hover:bg-primarySoft cursor-pointer border-b border-gray-100"
            onClick={() => handleOptionClick("")}
          >
            Select an option
          </div>

          {/* Scrollable Options */}
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((opt) => {
              const optionValue =
                typeof opt === "string" ? opt : opt.value;
              const optionLabel =
                typeof opt === "string" ? opt : opt.label;
              const isSelected = value === optionValue;

              return (
                <div
                  key={optionValue}
                  onClick={() => handleOptionClick(optionValue)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors
                    ${
                      isSelected
                        ? "bg-amber-50 text-amber-700 font-semibold"
                        : "text-gray-700 hover:bg-primarySoft hover:text-amber-600"
                    }`}
                >
                  {optionLabel}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && helperText && (
        <span className="text-xs text-red-500 font-medium mt-1 ml-1">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CSelect;
