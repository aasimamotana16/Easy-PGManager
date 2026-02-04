import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import CButton from "../../components/cButton";
import Loader from "../../components/loader"; // Using your component
import { services } from "../../config/staticData";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Syncing with today's date for any future date-based logic
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Matching the 800ms duration from your About page

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />; // Using your specific Loader component
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">

          {/* PAGE TITLE */}
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-center mb-4 sm:mb-6">
            Our Services
          </h1>

          <p className="text-sm md:text-2xl lg:text-xl text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20 text-gray-600">
            EasyPG Manager provides verified PGs, smart booking, and
            seamless property management.
          </p>

          {/* SERVICE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 md:mb-20 lg:mb-24">
            {services.map((service, idx) => (
              <ServiceCard key={idx} {...service} />
            ))}
          </div>

          {/* FIND YOUR PG SECTION */}
          <div className="max-w-4xl mx-auto bg-white rounded-md shadow-xl p-5 sm:p-8 lg:p-10 text-center">
            <img
              src={`${process.env.PUBLIC_URL}/images/serviceImage/mapimage.png`}
              alt="Map View"
              className="w-full h-44 sm:h-52 lg:h-60 object-cover rounded-2xl mb-5 sm:mb-6"
            />

            <h2 className="text-2xl md:text-4xl lg:text-4xl font-extrabold text-orange-600 mb-3 sm:mb-4">
              Find Your Perfect Stay
            </h2>

            <p className="text-sm md:text-2xl lg:text-xl mb-5 sm:mb-6">
              Start your search instantly and discover verified PGs
              that match your preferences.
            </p>

            <CButton
              size="lg"
              variant="contained"
              onClick={() => navigate("/findMypg")}
              className="w-full sm:w-auto md:text-2xl lg:text-xl"
            >
              Find My Stay
            </CButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}