import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // Import Loader
import { faqs } from "../../config/staticData";
import { FaChevronDown } from "react-icons/fa";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General Questions");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Standard Branded Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const categories = [...new Set(faqs.map((faq) => faq.category))];

  const filteredFaqs = faqs.filter(
    (faq) => faq.category === activeCategory
  );

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl  text-amber-600 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-2xl text-gray-700">
              Find answers to common questions about EasyPG Manager.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="md:w-1/3 space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveQuestionId(null);
                  }}
                  className={`w-full text-left text-2xl p-4 rounded-md transition-all duration-200 ${
                    activeCategory === category
                      ? "bg-amber-100 text-primary text-2xl  shadow-md transform scale-[1.02]"
                      : "bg-white text-gray-700 hover:bg-amber-50 shadow-sm"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQs Accordion */}
            <div className="md:w-3/4 space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* Question */}
                    <div
                      onClick={() =>
                        setActiveQuestionId(
                          activeQuestionId === faq.id ? null : faq.id
                        )
                      }
                      className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h3 className={`md:text-lg sm:text-3xl font-semibold transition-colors ${
                        activeQuestionId === faq.id ? "text-amber-600" : "text-gray-800"
                      }`}>
                        {faq.question}
                      </h3>

                      <FaChevronDown
                        className={`text-amber-500 transition-transform duration-300 ${
                          activeQuestionId === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Answer Area */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        activeQuestionId === faq.id 
                          ? "max-h-[500px] opacity-100" 
                          : "max-h-0 opacity-0"
                      } overflow-hidden`}
                    >
                      <div className="p-6 pt-0 border-t border-transparent">
                        <p className="text-gray-700 text-xl leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No questions found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}