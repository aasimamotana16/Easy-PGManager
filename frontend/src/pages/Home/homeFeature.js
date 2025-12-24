import React from "react";
import { useNavigate } from "react-router-dom";
import { features } from "../../config/staticData";
import { homeBannerStats } from "../../config/staticData";
import CFormCard from "../../components/cFormCard";
import CButton from "../../components/cButton";

const HomeFeatures = () => {
  const navigate = useNavigate(); // Added for navigation

  return (
    <>
      {/* ================= FEATURES SECTION ================= */}
      <section className="bg-background.DEFAULT px-6 py-14 md:py-16">

        {/* SECTION HEADING */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
            Everything You Need to Manage Your PG
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Powerful features designed to simplify daily operations for PG and hostel owners.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <CFormCard
              key={index}
              className="bg-card border border-border rounded-2xl p-6 md:p-7 shadow-card hover:shadow-hover transition"
            >
              <h3 className="text-lg md:text-xl font-semibold text-primary mb-3">
                {feature.title}
              </h3>

              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </CFormCard>
          ))}
        </div>

      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-white px-6 py-20 mt-24 mb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-tight">
              <span className="text-primary">Get Started!</span>{" "}
              Onboard your university in just 10 minutes.
            </h2>

            <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-xl">
              Manage PGs, hostels, bookings, payments, and tenants from a single
              dashboard designed for scale.
            </p>

            {/* ================= DEMO BUTTON ================= */}
            <div className="mt-8">
              <CButton
                text="Schedule a Free Demo"
                onClick={() => navigate("/demoBooking")} // Navigate to demo page
              />
            </div>

            {/* STATS */}
            <div className="mt-12 flex flex-wrap gap-10">
              {homeBannerStats.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {item.value}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="relative flex justify-center">
            <div className="absolute w-[380px] h-[400px]"></div>

            <img
              src="/images/homeimages/image11.png"
              alt="PG Management Dashboard"
              className="relative z-20 w-[380px] sm:w-[320px] md:w-[700px]"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeFeatures;
