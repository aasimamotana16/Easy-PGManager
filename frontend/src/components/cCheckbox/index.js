import React from "react";

const CCheckbox = ({ label, checked, onChange, className = "", error = false, helperText = "" }) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      <div className={`flex items-center gap-2 group`}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={`peer h-4 w-4 rounded border-2 transition-all cursor-pointer accent-amber-600 
              ${error ? "border-red-500" : "border-gray-300"} 
              text-amber-600 focus:ring-2 focus:ring-amber-200 focus:outline-none`}
          />
        </div>
        
        {label && (
          <span className={`text-sm select-none cursor-default ${error ? "text-black" : "text-gray-700"}`}>
            {label}
          </span>
        )}
      </div>

      {/* Error message below checkbox */}
      {error && helperText && (
        <span className="text-xs text-red-500 font-medium mt-1 ml-6">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CCheckbox;
