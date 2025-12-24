import React, { useState, useEffect } from "react";
import { bannerText } from "../../config/staticData";
import CButton from "../../components/cButton";

const images = [
  "/images/homeImages/img5.jpg",
  "/images/homeImages/img6.jpg",
  "/images/homeImages/img7.jpg",
];

const HomeBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(slider);
  }, []);

  return (
    <section className="bg-background.DEFAULT">
      {/* SAME WRAPPER AS NAVBAR */}
      <div className="px-2 md:px-6 lg:px-8 py-14 md:py-18 lg:py-20">
        <div className="flex flex-col md:flex-row items-center">

          {/* LEFT CONTENT */}
          <div className="md:w-1/2 space-y-6 text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight">
              {bannerText.heading}
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-xl">
              {bannerText.subheading}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <CButton
                text={bannerText.cta}
                variant="contained"
                size="lg"
                onClick={() => (window.location.href = "/signup")}
              />

              <CButton
                variant="text"
                size="md"
                onClick={() => (window.location.href = "/about")}
                className="font-medium"
              >
                Learn more →
              </CButton>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-end">
            <div className="relative w-full max-w-[520px] h-[300px] sm:h-[360px] md:h-[420px] rounded-3xl overflow-hidden shadow-card">
              {images.map((img, index) => (
                <img
                  key={img}
                  src={img}
                  alt="PG Accommodation"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
