// src/pages/about/index.js
import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Section from "../../components/aSection";
import {
  aboutIntro,
  aboutWhoWeServe,
  aboutFeatures,
  aboutWhyChooseUs,
  aboutReviews,
} from "../../config/staticData";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT text-text-secondary font-roboto">
      {/* Navbar */}
      <Navbar />

      {/* PAGE CONTENT — STARTS FROM VERY LEFT */}
      <main className="flex-1 px-2 md:px-6 lg:px-8 py-12 mt-6">

        {/* Introduction */}
        <Section>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {aboutIntro.title}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary">
            {aboutIntro.description}
          </p>
        </Section>

        {/* Who We Serve */}
        <Section title="Who We Serve">
          <ul className="list-disc pl-6 space-y-2">
            {aboutWhoWeServe.map((item, i) => (
              <li key={i}>
                <span className="font-semibold">{item.role}:</span>{" "}
                {item.desc}
              </li>
            ))}
          </ul>
        </Section>

        {/* Key Features */}
        <Section title="Our Key Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl shadow-card hover:shadow-hover p-6 transition"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Why Choose Us */}
        <Section title="Why Choose Us">
          <p className="text-text-secondary leading-relaxed">
            {aboutWhyChooseUs}
          </p>
        </Section>

        {/* Reviews */}
        <Section title="What Our Users Say">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutReviews.map((review, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl shadow-card hover:shadow-hover p-6 transition"
              >
                <p className="italic text-text-secondary">{review.text}</p>
                <p className="font-bold text-primary mt-4">
                  – {review.author}
                </p>
              </div>
            ))}
          </div>
        </Section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
