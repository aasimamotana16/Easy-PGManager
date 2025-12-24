// src/pages/home/index.js
import React from "react";
import Navbar from "../../components/navbar";      // ✅ fixed path
import Footer from "../../components/footer";      // ✅ fixed path
import HomeBanner from "./homeBanner";
import HomeSearch from "./homeSearch";
import HomeFeatures from "./homeFeature";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-default">
      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <HomeBanner />
      <HomeSearch />
      <HomeFeatures />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;