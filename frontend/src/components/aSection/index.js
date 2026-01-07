// src/components/aSection/index.js
import React from "react";

const Section = ({ title, children, className = "" }) => {
  return (
    <section className={`mb-12 ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

// ✅ Default export is required for all About sections to work
export default Section;
