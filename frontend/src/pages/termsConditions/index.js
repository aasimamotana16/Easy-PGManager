import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { getTerms } from "../../api/api";

const TermsConditions = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [termsData, setTermsData] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 400);

    // fetch terms from backend
    const fetchTerms = async () => {
      try {
        const resp = await getTerms();
        if (resp && resp.data && resp.data.data) {
          setTermsData(resp.data.data);
        }
      } catch (err) {
        // keep fallback empty — frontend will render nothing
        console.error('Failed to load terms', err);
      } finally {
        setLoadingTerms(false);
      }
    };

    fetchTerms();

    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <Loader />;
  }

  return (
    // Background using your 'background default: #ffffff'
    <div className="min-h-screen flex flex-col bg-[#ffffff] font-sans">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 py-12 max-w-4xl mx-auto">
        {/* Page Heading - Using your text primary: #1C1C1C */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
            Terms & <span className="text-[#D97706]">Conditions</span>
          </h1>
          <p className="text-[#4B4B4B] mt-3 text-sm md:text-base">
            Please read these rules carefully to understand how EasyPG Manager works.
          </p>
          <div className="w-16 h-1 bg-[#D97706] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content Container - Using border: #E5E0D9 */}
        <div className="bg-white border border-[#E5E0D9] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10">
            {(loadingTerms ? [] : termsData).map((item, index) => (
              <section 
                key={index} 
                className="mb-10 last:mb-0 group"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h2 className="text-xl font-bold text-[#1C1C1C] group-hover:text-[#D97706] transition-colors">
                    {item.title}
                  </h2>
                </div>

                {/* Description - Using text secondary: #4B4B4B */}
                  <div className="ml-0 sm:ml-12">
                  <p className="text-base leading-relaxed text-[#4B4B4B]">
                    {item.content || item.description}
                  </p>
                </div>
                
                {/* Separator */}
                {index !== ((loadingTerms ? [] : termsData).length - 1) && (
                  <div className="ml-0 sm:ml-12 mt-8 border-b border-[#E5E0D9]"></div>
                )}
              </section>
            ))}

            {/* Policy Footer */}
            <div className="mt-16 pt-8 border-t border-[#E5E0D9] text-center">
              <p className="text-xs font-semibold text-[#4B4B4B] uppercase tracking-widest">
                Last Updated: February 2026
              </p>
              <p className="text-[10px] text-gray-400 mt-2">
                © EasyPG Manager - Your Smart PG Partner
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;