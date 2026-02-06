import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import CButton from "../../components/cButton";
import Loader from "../../components/loader";
import { services } from "../../config/staticData";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">

          {/* PAGE TITLE */}
          <h1 className="text-5xl text-center mb-4 sm:mb-6">
            Our Services
          </h1>

          <p className="text-2xl text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20 text-gray-600">
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
              className="w-full h-44 sm:h-52 lg:h-60 object-cover rounded-md mb-5 sm:mb-6"
            />

            <h2 className="text-4xl text-primary mb-3 sm:mb-4">
              Find Your Perfect Stay
            </h2>

            <p className="text-2xl mb-5 sm:mb-6">
              Start your search instantly and discover verified PGs
              that match your preferences.
            </p>

            <CButton
              size="lg"
              variant="contained"
              /* UPDATED: Passing state to trigger the back button logic */
              onClick={() => navigate("/findMypg", { state: { fromServices: true } })}
              className="w-full sm:w-auto text:2xl"
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