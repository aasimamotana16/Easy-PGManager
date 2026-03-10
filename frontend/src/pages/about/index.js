import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { getAboutPageData } from "../../api/api";

import AboutIntro from "./aboutIntro";
import AboutWhoWeServe from "./aboutWhoWeServe";
import AboutFeatures from "./aboutFeatures";
import AboutWhyChooseUs from "./aboutWhyChooseUs";

const About = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page loading (same UX as Home)
  useEffect(() => {
    // Trigger backend connection for About page without changing current UI/data rendering.
    getAboutPageData().catch((err) => {
      console.error("About API connection failed:", err);
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // short branded loader

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT text-text-secondary">
      <Navbar />

      <main className="flex-1 space-y-10">
        <AboutIntro />
        <AboutWhoWeServe />
        <AboutFeatures />
        <AboutWhyChooseUs />
      </main>

      <Footer />
    </div>
  );
};

export default About;
