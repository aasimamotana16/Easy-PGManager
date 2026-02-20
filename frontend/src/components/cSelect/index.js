import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  name,
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
    : "-- Select --";

  const handleOptionClick = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div
      className={`flex flex-col gap-1 mb-4 relative ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <label className="text-body-sm lg:text-body font-medium text-textSecondary">
          {label}
        </label>
      )}

      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-md border border-border bg-background text-textSecondary flex justify-between items-center cursor-pointer hover:border-primary transition focus-within:ring-2 focus-within:ring-primary"
      >
        <span
          className={`text-body-sm lg:text-body ${
            !value ? "opacity-50" : ""
          }`}
        >
          {displayLabel}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 top-full bg-background border border-border shadow-lg rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Default Option */}
          <div
            className="px-4 py-2 text-body-sm lg:text-body text-textSecondary opacity-50 hover:bg-primarySoft cursor-pointer border-b border-border/50"
            onClick={() => handleOptionClick("")}
          >
            -- Select --
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
                  className={`px-4 py-2 text-body-sm lg:text-body cursor-pointer transition-colors
                    ${
                      isSelected
                        ? "bg-orange-50 text-primary font-semibold"
                        : "text-textSecondary hover:bg-primarySoft hover:text-primary"
                    }`}
                >
                  {optionLabel}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSelect;