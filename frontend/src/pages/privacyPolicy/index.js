import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // Import Loader
import { privacyPolicyData } from "../../config/staticData";

const PrivacyPolicy = () => {
  const [pageLoading, setPageLoading] = useState(true);

  // Branded Loader Effect
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

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-card p-6 sm:p-8">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
            {privacyPolicyData.title}
          </h1>

          <p className="mb-6 text-sm sm:text-base leading-relaxed">
            {privacyPolicyData.intro}
          </p>

          {privacyPolicyData.sections.map((section, index) => (
            <section key={index} className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                {index + 1}. {section.heading}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                {section.content}
              </p>
            </section>
          ))}
          
          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
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

export default PrivacyPolicy;