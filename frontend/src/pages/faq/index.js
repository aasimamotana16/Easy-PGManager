import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { faqs } from "../../config/staticData";
import { FaChevronDown } from "react-icons/fa";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General Questions");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-amber-600 mb-4 font-bold">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-2xl text-gray-700">
              Find answers to common questions about EasyPG Manager.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar - Scrollbar Hidden */}
            <div className="lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveQuestionId(null);
                  }}
                  className={`whitespace-nowrap lg:whitespace-normal text-left px-6 py-4 rounded-xl transition-all duration-300 flex-shrink-0 ${
                    activeCategory === category
                      ? "bg-amber-100 text-amber-700 text-lg md:text-xl font-semibold shadow-md transform lg:scale-[1.02]"
                      : "bg-white text-gray-600 hover:bg-amber-50 shadow-sm text-lg md:text-xl"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQs Accordion */}
            <div className="lg:w-2/3 space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    <div
                      onClick={() =>
                        setActiveQuestionId(
                          activeQuestionId === faq.id ? null : faq.id
                        )
                      }
                      className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h3 className={`text-lg md:text-xl font-semibold transition-colors pr-4 ${
                        activeQuestionId === faq.id ? "text-amber-600" : "text-gray-800"
                      }`}>
                        {faq.question}
                      </h3>

                      <FaChevronDown
                        className={`text-amber-500 flex-shrink-0 transition-transform duration-500 ease-in-out ${
                          activeQuestionId === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <div
                      className={`grid transition-all duration-500 ease-in-out ${
                        activeQuestionId === faq.id 
                          ? "grid-rows-[1fr] opacity-100" 
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-5 md:p-6 pt-0 border-t border-gray-50">
                          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
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

      {/* CSS to Hide Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}