import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // Import Loader
import { termsConditionsData } from "../../config/staticData";

const TermsConditions = () => {
  const [pageLoading, setPageLoading] = useState(true);

  // Standardized Branded Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT text-text-secondary">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 py-10 max-w-5xl mx-auto">
        {/* Page Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Terms & Conditions
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm p-6 sm:p-10">
          {termsConditionsData.map((item, index) => (
            <section key={index} className="mb-8 last:mb-0">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-start gap-3">
                <span className="text-primary">{index + 1}.</span>
                {item.title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-gray-600 ml-0 sm:ml-7">
                {item.description}
              </p>
            </section>
          ))}

          {/* Policy Footer */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Last Updated: February 2026
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;