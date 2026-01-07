import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import AboutIntro from "./aboutIntro";
import AboutWhoWeServe from "./aboutWhoWeServe";
import AboutFeatures from "./aboutFeatures";
import AboutWhyChooseUs from "./aboutWhyChooseUs";
import AboutReviews from "./aboutReviews";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT text-text-secondary font-roboto">
      <Navbar />

      <main className="flex-1 px-2 md:px-6 lg:px-8 py-12  space-y-16">
        <AboutIntro />
        <AboutWhoWeServe />
        <AboutFeatures />
        <AboutWhyChooseUs />
        <AboutReviews />
      </main>

      <Footer />
    </div>
  );
};

export default About;
