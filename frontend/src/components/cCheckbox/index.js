import React from "react";

const CCheckbox = ({ label, checked, onChange, className = "", error = false, helperText = "" }) => {
  return (
    /* Added relative and pb-4 to reserve space for the absolute error message */
    <div className={`flex flex-col relative ${helperText ? "pb-4" : ""} ${className}`}>
      <div className={`flex items-center gap-3 group`}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            /* Themed border changes to danger color if there is an error [cite: 2026-02-09] */
            className={`peer h-5 w-5 rounded border-2 transition-all cursor-pointer accent-primary 
              ${error ? "border-danger" : "border-border"} 
              text-primary focus:ring-primarySoft`}
          />
        </div>
        
        {label && (
          <span className="text-body-sm text-textSecondary select-none cursor-default">
            {label}
          </span>
        )}
      </div>

      {/* Absolute error message aligned under the text, not the checkbox icon */}
      {error && helperText && (
        <span className="absolute bottom-0 left-8 text-[10px] text-danger font-medium leading-none">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CCheckbox;