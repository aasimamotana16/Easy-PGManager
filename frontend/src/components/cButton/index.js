import React from "react";

const CButton = ({
  text,
  children,
  onClick,
  type = "button",
  variant = "contained", 
  fullWidth = false,
  className = "",
  disabled = false,
}) => {
  
  // Updated variant styles to use your theme tokens [cite: 2026-02-09]
  const variantClasses = {
    contained:
      "bg-primary text-textLight hover:bg-primaryDark border border-transparent",
    outlined:
      "border-2 border-primary text-textPrimary hover:bg-primarySoft transition-colors",
    text:
      "text-textPrimary hover:text-primary bg-transparent shadow-none hover:shadow-none",
  };

  // Base layout classes focusing on your responsive body font size [cite: 2026-02-06]
  const finalClasses = `
    inline-flex items-center justify-center
    rounded-md font-bold
    text-body-sm lg:text-body
    px-8 py-3 lg:px-10 lg:py-1
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
    ${variantClasses[variant] || variantClasses.contained}
    ${fullWidth ? "w-full" : "w-auto"}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
    >
      {text || children}
    </button>
  );
};

export default CButton;