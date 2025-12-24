import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import FAQItem from "../../components/faqItem";
import { faqs } from "../../config/staticData";

export default function FAQ() {
  const [activeId, setActiveId] = useState(null);

  const handleToggle = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background.DEFAULT">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-secondary text-center mb-12 text-lg sm:text-base">
            Find answers to common questions about EasyPG Manager.
          </p>

          {/* FAQ Accordion */}
          <div className="bg-card rounded-2xl shadow-card divide-y divide-gray-200">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                {...faq}
                isOpen={activeId === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
