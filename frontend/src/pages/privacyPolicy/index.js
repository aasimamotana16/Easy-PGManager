import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // Import Loader
import { privacyPolicyData } from "../../config/staticData";
import { getPrivacyPolicyData } from "../../api/api";

const PrivacyPolicy = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [policyData, setPolicyData] = useState(privacyPolicyData);

  // Branded Loader Effect
  useEffect(() => {
    getPrivacyPolicyData()
      .then((res) => {
        if (res?.data?.success && res?.data?.data) {
          setPolicyData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Privacy policy API connection failed:", err);
      });

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
          
        <h1 className="text-h1-sm lg:text-h1 font-bold text-black mb-6 text-center">
            {policyData.title}
          </h1>
<div className="max-w-4xl mx-auto bg-card border border-primary rounded-md shadow-card p-6 sm:p-8">
          
          <p className="mb-6 text-sm sm:text-base leading-relaxed">
            {policyData.intro}
          </p>

          {policyData.sections.map((section, index) => (
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
              Last Updated: {policyData.lastUpdated || "February 2026"}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
