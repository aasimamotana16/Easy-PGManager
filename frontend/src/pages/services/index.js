import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import CButton from "../../components/cButton";
import { services } from "../../config/staticData";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8">
          Our Services
        </h1>

        <p className="text-lg sm:text-xl text-center max-w-3xl mx-auto mb-20">
          EasyPG Manager provides verified PGs, smart booking, and
          seamless property management.
        </p>

        {/* 4 Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>

        {/* Find Your PG Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Map Image */}
          <img
            src={`${process.env.PUBLIC_URL}/images/serviceImage/mapimage.png`}
            alt="Map"
            className="w-full h-60 object-cover rounded-2xl mb-6"
          />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-orange-600 flex items-center justify-center gap-2 mb-4">
            <span></span> Find Your Perfect Stay
          </h2>

          <p className="text-lg sm:text-xl mb-6">
            Start your search instantly and discover verified PGs
            that match your preferences.
          </p>

          <CButton
            size="lg"
            variant="contained"
            onClick={() => navigate("/findMypg")}
          >
            Find My Stay
          </CButton>
        </div>
      </div>

      <Footer />
    </div>
  );
}
