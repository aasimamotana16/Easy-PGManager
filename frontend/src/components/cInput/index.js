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
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}

      {/* SELECT */}
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full h-12 px-3 py-2 text-sm
            border border-border bg-card text-text-secondary
            rounded-md
            focus:outline-none focus:ring-0 focus:border-primary
            transition ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 text-sm
            border border-border bg-card text-text-secondary
            rounded-md
            focus:outline-none focus:ring-0 focus:border-primary
            transition ${className}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-10 px-12 py-2  text-sm
            border border-border bg-card text-text-secondary
            rounded-md
            focus:outline-none focus:ring-0 focus:border-primary
            transition ${className}`}
        />
      )}
    </div>
  );
};

export default CInput;
