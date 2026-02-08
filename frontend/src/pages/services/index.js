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
        {/* Adjusted padding: py-10 for mobile, py-20 for desktop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">

          {/* PAGE TITLE - Styled like Filter/FindMyPG headings */}
          <div className="text-center  mb-10 md:mb-16">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4">
              Our Services
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
              EasyPG Manager provides verified PGs, smart booking, and
              seamless property management tailored for your comfort.
            </p>
          </div>

          {/* SERVICE CARDS - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
            {services.map((service, idx) => (
              <ServiceCard key={idx}
               {...service} />
            ))}
          </div>

          {/* FIND YOUR PG SECTION - Matches Filter Box UI */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-t-4 border-primary p-6 sm:p-10 lg:p-12 text-center overflow-hidden">
            <div className="relative group mb-8">
              <img
                src={`${process.env.PUBLIC_URL}/images/serviceImage/mapimage.png`}
                alt="Map View"
                className="w-full h-48 sm:h-64 lg:h-72 object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Optional overlay for extra polish */}
              <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none"></div>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
              Find Your Perfect Stay
            </h2>

            <p className="text-sm md:text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Ready to move? Start your search instantly and discover 
              hand-picked, verified PGs that match your budget and lifestyle.
            </p>

            <CButton
              size="lg"
              variant="contained"
              onClick={() => navigate("/findMypg", { state: { fromServices: true } })}
              className="w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-lg shadow-primary/20"
            >
              Start Searching Now
            </CButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}