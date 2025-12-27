// src/pages/Home/index.js
import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import HomeBanner from "./homeBanner";   // points to homeBanner/index.js
import HomeSearch from "./homeSearch";   // points to homeSearch/index.js
import HomeFeatures from "./homeFeature"; // points to homeFeature/index.js

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
