import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import HomeBanner from "./homeBanner";
import HomeSearch from "./homeSearch";
import HomeFeatures from "./homeFeature";
import HomeReviews from "./homeReviews";
import { API_BASE } from "../../config/apiBaseUrl";

const HomePage = () => {
  const [siteStats, setSiteStats] = useState({
    customersWorldwide: 0,
    dailyUsers: 0,
    worthOfRentManaged: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role")?.toLowerCase();
  const showHomeSearch = !isLoggedIn || role !== "owner";

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(`${API_BASE}/home-stats`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setSiteStats(data);
      })
      .catch(err => {
        // Avoid logging noisy abort errors; treat any failure as non-blocking.
        if (err?.name !== "AbortError") {
          console.error("Error connecting to backend:", err);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-default px-6 overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-100 rounded-full blur-2xl opacity-40 animate-ping"></div>
            {/* Responsive logo size for loading screen */}
            <img 
              src="/logos/logo1.png" 
              alt="EasyPG Logo" 
              className="relative h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 object-contain"
            />
          </div>
          <h2 className="text-sm sm:text-base md:text-2xl text-gray-900 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium text-center">
            EasyPG Manager
          </h2>
          <div className="mt-6 flex gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-default">
      <Navbar />

      <main className="flex-grow overflow-x-hidden">
        {/* Banner Section: Full width but content is centered inside HomeBanner */}
        <section className="w-full">
          <HomeBanner />
        </section>

        {/* Search Section: 
          - On mobile (default): mt-0 or small negative margin to stay close to banner.
          - On desktop (md+): -mt-12 to overlay the banner.
        */}
        {showHomeSearch && (
          <section className="relative gap-6 z-10 px-4 sm:px-6 mt-6 max-w-7xl mx-auto">
            <HomeSearch />
          </section>
        )}
        
        {/* Features Section: 
          - py-10 for mobile to keep sections distinct without massive gaps.
          - md:py-20 for desktop.
        */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          <HomeFeatures stats={siteStats} />
        </section>

        {/* Reviews: moved from About → Home; horizontal scroll + static data */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          <HomeReviews />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;