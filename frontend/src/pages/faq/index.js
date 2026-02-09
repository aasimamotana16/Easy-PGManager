import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { faqs } from "../../config/staticData";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations

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
  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  if (pageLoading) return <Loader />;

  return (
    <div className="flex flex-col min-h-screen bg-background text-textSecondary">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* --- PAGE HEADER --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-16 px-4"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-textPrimary tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-textSecondary text-sm md:text-xl max-w-2xl mx-auto">
              Everything you need to know about EasyPG Manager in one place.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* --- CATEGORIES SIDEBAR --- */}
            <div className="lg:w-1/4">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar sticky top-24">
                {categories.map((category, idx) => (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveQuestionId(null);
                    }}
                    className={`whitespace-nowrap lg:whitespace-normal text-left px-5 py-3.5 rounded-xl transition-all duration-200 flex-shrink-0 border ${
                      activeCategory === category
                        ? "bg-primary text-textLight border-primary font-bold shadow-lg shadow-primary/20"
                        : "bg-white text-textSecondary border-border hover:border-primary/50"
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* --- FAQS ACCORDION --- */}
            <motion.div 
              layout // Smoothly animate the container height when items change
              className="lg:w-3/4 space-y-4"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory} // Forces animation when category changes
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={faq.id}
                        className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
                      >
                        <div
                          onClick={() =>
                            setActiveQuestionId(
                              activeQuestionId === faq.id ? null : faq.id
                            )
                          }
                          className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-primarySoft/30 transition-colors"
                        >
                          <h3 className={`text-base md:text-lg font-bold pr-4 transition-colors ${
                            activeQuestionId === faq.id ? "text-primaryDark" : "text-textPrimary"
                          }`}>
                            {faq.question}
                          </h3>

                          <FaChevronDown
                            className={`text-textSecondary flex-shrink-0 transition-transform duration-300 ${
                              activeQuestionId === faq.id ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </div>

                        {/* Accordion Content Animation */}
                        <AnimatePresence>
                          {activeQuestionId === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="p-5 md:p-6 pt-0 border-t border-border/50">
                                <p className="text-textSecondary text-sm md:text-base leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
                      <p className="text-textSecondary">No questions found in this category.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}