import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import HomeBanner from "./homeBanner";   
import HomeSearch from "./homeSearch";   
import HomeFeatures from "./homeFeature"; 

const HomePage = () => {
  // Use camelCase for state names [cite: 2026-01-01]
  const [siteStats, setSiteStats] = useState({
    customersWorldwide: 0,
    dailyUsers: 0,
    worthOfRentManaged: 0
  });

  // Fetching from the new API you added to server.js
  useEffect(() => {
    fetch('http://localhost:5000/api/home-stats')
      .then(res => res.json())
      .then(data => {
        setSiteStats(data);
      })
      .catch(err => console.error("Error connecting to backend:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-default">
      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <HomeBanner />
      <HomeSearch />
      
      {/* Pass the dynamic stats to the features component */}
      <HomeFeatures stats={siteStats} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;