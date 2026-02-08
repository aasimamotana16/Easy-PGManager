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
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-700">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* --- PAGE HEADER (Matched to Filter Section) --- */}
          <div className="text-center mb-10 md:mb-16 px-4">
            <h1 className="text-3xl  sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 text-sm md:text-xl max-w-2xl mx-auto">
              Everything you need to know about EasyPG Manager in one place.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* --- CATEGORIES SIDEBAR --- */}
            <div className="lg:w-1/4">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar sticky top-24">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveQuestionId(null);
                    }}
                    className={`whitespace-nowrap lg:whitespace-normal text-left px-5 py-3.5 rounded-xl transition-all duration-200 flex-shrink-0 border ${
                      activeCategory === category
                        ? "bg-primary text-white border-primary font-bold shadow-lg shadow-primary/20"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* --- FAQS ACCORDION --- */}
            <div className="lg:w-3/4 space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <div
                      onClick={() =>
                        setActiveQuestionId(
                          activeQuestionId === faq.id ? null : faq.id
                        )
                      }
                      className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-gray-50/50"
                    >
                      <h3 className={`text-base md:text-lg font-bold pr-4 transition-colors ${
                        activeQuestionId === faq.id ? "text-primary" : "text-gray-800"
                      }`}>
                        {faq.question}
                      </h3>

                      <FaChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                          activeQuestionId === faq.id ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeQuestionId === faq.id 
                          ? "grid-rows-[1fr] opacity-100" 
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-5 md:p-6 pt-0 border-t border-gray-100">
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-400">No questions found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* CSS to Hide Scrollbar for category buttons on mobile */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}