import React from "react";

const CCheckbox = ({ label, checked, onChange, className = "" }) => {
  return (
    /* Changed from <label> to <div> to prevent the text from triggering the checkbox [cite: 2026-02-06] */
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          /* Checkbox remains cursor-pointer and themed [cite: 2026-02-09] */
          className="peer h-5 w-5 rounded border-2 border-border text-primary focus:ring-primarySoft transition-all cursor-pointer accent-primary"
        />
      </div>
      
      {label && (
        /* Label is now just a span, clicking it does nothing to the checkbox */
        <span className="text-body-sm text-textSecondary select-none cursor-default">
          {label}
        </span>
      )}
    </div>
  );
};

export default CCheckbox;