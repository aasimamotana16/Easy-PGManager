import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import FAQItem from "../../components/faqItem";
import { faqs } from "../../config/staticData";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General Questions");
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Dynamically get categories
  const categories = [...new Set(faqs.map((faq) => faq.category))];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveQuestionId(null); // Close open question when switching category
  };

  const handleToggleQuestion = (id) => {
    setActiveQuestionId(activeQuestionId === id ? null : id);
  };

  // Filter FAQs by selected category
  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600 text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 text-center mb-12">
            Find answers to common questions about EasyPG Manager.
          </p>

          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Left Column: Categories */}
            <div className="md:w-1/4 flex flex-col space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`text-left p-4 rounded-xl transition 
                    ${
                      activeCategory === category
                        ? "bg-amber-100 text-amber-700 font-semibold shadow-lg"
                        : "bg-white text-gray-700 hover:bg-amber-50 shadow-md"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right Column: FAQ Cards */}
            <div className="md:w-2/3 flex flex-col space-y-4">
              {filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  {...faq}
                  isOpen={activeQuestionId === faq.id}
                  onToggle={() => handleToggleQuestion(faq.id)}
                  questionClass="text-lg sm:text-xl font-semibold text-amber-600"
                  answerClass="text-base sm:text-lg text-gray-700 mt-3"
                  containerClass="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
