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

  const variantClasses = {
    contained:
      "bg-primary text-textLight hover:bg-primaryDark border border-primary",

    outlined:
      "border-2 border-primary text-primary bg-transparent hover:bg-primaryShade hover:text-primary transition-colors",

    text:
      "text-textPrimary hover:text-primary bg-transparent shadow-none hover:shadow-none",
  };

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