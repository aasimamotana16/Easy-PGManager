import React from "react";

const CInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "", // This will now control the wrapper width
  rows = 3,
  name,
  options = [],
}) => {
  return (
    /* Apply className here so flex-1 or w-full works on the whole component */
    <div className={`flex flex-col gap-1 ${className}`}>
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
            transition`} // Removed className from here
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
            transition`} // Removed className from here
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          /* w-full ensures the input fills the div width defined by className */
          className={`w-full h-10 px-3 py-2 text-sm
            border border-border bg-card text-text-secondary
            rounded-md
            focus:outline-none focus:ring-0 focus:border-primary
            transition`} 
        />
      )}
    </div>
  );
};

export default CInput;