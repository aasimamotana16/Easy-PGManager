// src/components/Section.js
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

export default Section;
