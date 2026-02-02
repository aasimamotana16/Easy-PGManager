import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import HomeBanner from "./homeBanner";   
import HomeSearch from "./homeSearch";   
import HomeFeatures from "./homeFeature"; 

const HomePage = () => {
  const [siteStats, setSiteStats] = useState({
    customersWorldwide: 0,
    dailyUsers: 0,
    worthOfRentManaged: 0
  });
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetching from your API
    fetch('http://localhost:5000/api/home-stats')
      .then(res => res.json())
      .then(data => {
        setSiteStats(data);
        // Turn off loader once data is ready
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error connecting to backend:", err);
        setIsLoading(false); // Stop loading even on error
      });
  }, []);

  // Branded Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-default">
        <div className="flex flex-col items-center animate-pulse">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-100 rounded-full blur-2xl opacity-40 animate-ping"></div>
            <img 
              src="/logos/logo1.png" 
              alt="EasyPG Logo" 
              className="relative h-20 w-20 md:h-32 md:w-32 object-contain"
            />
          </div>
          <h2 className="text-lg md:text-2xl font-black text-gray-900 tracking-widest uppercase">
            EasyPG Manager
          </h2>
          <div className="mt-3 flex gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-default">
      {/* Navbar */}
      <Navbar />

      {/* Main Content with Responsive Spacing */}
      <main className="flex-grow flex flex-col gap-6 md:gap-0">
        {/* Banner: Responsive heights inside component */}
        <HomeBanner />

        {/* Search: Added padding for mobile readability */}
        <div className="px-4 sm:px-6">
          <HomeSearch />
        </div>
        
        {/* Features: Dynamic stats passed through */}
        <div className="px-4 sm:px-6 pb-10 md:pb-20">
          <HomeFeatures stats={siteStats} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;