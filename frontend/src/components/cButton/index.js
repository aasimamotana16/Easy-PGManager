import React from "react";

const CButton = ({
  text,
  children,
  onClick,
  type = "button",
  variant = "contained", // "contained", "outlined", "text"
  size = "md",           // "sm", "md", "lg"
  fullWidth = false,
  className = "",
}) => {
  // Variant styles (NO HARDCODED COLORS)
  const variantClasses = {
    contained:
      "bg-primary text-black hover:bg-button-hover",
    outlined:
      "border border-primary text-black hover:bg-primary",
    text:
      "text-black hover:text-button-hover bg-transparent",
  };

  const sizeClasses = {
    sm: "px-[35px] py-[5px] text-sm",
    md: "px-[35px] py-[5px] text-base",
    lg: "px-[35px] py-[5px] text-lg",
  };

  const finalClasses = `
    rounded-md font-semibold
    shadow-soft hover:shadow-hover
    transition-all duration-200
    ${variantClasses[variant] || variantClasses.contained}
    ${sizeClasses[size] || sizeClasses.md}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      className={finalClasses}
    >
      {text || children}
    </button>
  );
};

export default CButton;
