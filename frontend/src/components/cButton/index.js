// src/components/cButton/index.js
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
  // Variant styles
  const variantClasses = {
    contained:
      "bg-primary text-text-primary hover:bg-button-hover hover:text-text-primary",
    outlined:
      "border border-button-DEFAULT text-button-DEFAULT hover:bg-button-hover hover:text-text-light",
    text:
      "text-button-DEFAULT hover:text-button-hover bg-transparent",
  };

  const sizeClasses = {
    sm: "px-[35px] py-[5px] text-sm",
    md: "px-[35px] py-[5px] text-base",
    lg: "px-[35px] py-[5px] text-lg",
  };

  const finalClasses = `
    rounded-md font-semibold shadow-soft hover:shadow-hover transition
    ${variantClasses[variant] || variantClasses.contained}
    ${sizeClasses[size] || sizeClasses.md}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button type={type} onClick={onClick} className={finalClasses}>
      {text || children}
    </button>
  );
};

export default CButton;
