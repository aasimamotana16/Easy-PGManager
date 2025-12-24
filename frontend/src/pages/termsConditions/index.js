// src/pages/termsConditions/index.js
import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { termsConditionsData } from "../../config/staticData";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT text-text-secondary">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Terms & Conditions
        </h1>

        {termsConditionsData.map((item, index) => (
          <section key={index} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {item.title}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {item.description}
            </p>
          </section>
        ))}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsConditions;
