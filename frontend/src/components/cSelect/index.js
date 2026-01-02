import React from "react";

const CSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  name,
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-sm border border-border bg-card text-text-secondary focus:outline-none focus:ring-2 focus:ring-amber transition"
      >
        <option value="">-- Select --</option>

        {options.map((opt) => {
          const optionValue =
            typeof opt === "string" ? opt : opt.value;
          const optionLabel =
            typeof opt === "string" ? opt : opt.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default CSelect;
