import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { faqs } from "../../config/staticData";
import { FaChevronDown } from "react-icons/fa";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General Questions");
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  const categories = [...new Set(faqs.map((faq) => faq.category))];

  const filteredFaqs = faqs.filter(
    (faq) => faq.category === activeCategory
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600 text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-700 text-center mb-12">
            Find answers to common questions about EasyPG Manager.
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Categories */}
            <div className="md:w-1/4 space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveQuestionId(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition
                    ${
                      activeCategory === category
                        ? "bg-amber-100 text-amber-700 font-semibold shadow"
                        : "bg-white text-gray-700 hover:bg-amber-50 shadow-sm"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQs */}
            <div className="md:w-3/4 space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm"
                >
                  {/* Question */}
                  <div
                    onClick={() =>
                      setActiveQuestionId(
                        activeQuestionId === faq.id ? null : faq.id
                      )
                    }
                    className="flex items-center justify-between p-6 cursor-pointer"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-amber-600">
                      {faq.question}
                    </h3>

                    <FaChevronDown
                      className={`text-amber-500 transition-transform duration-300 ${
                        activeQuestionId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Answer (SAME CARD - Line Removed) */}
                  {activeQuestionId === faq.id && (
                    <div className="p-6 pt-0"> {/* Reduced pt-4 to pt-0 since line is gone */}
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}