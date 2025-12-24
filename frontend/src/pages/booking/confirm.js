import React, { useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";
import { pgdetails, hosteldetails } from "../../config/staticData";

const ConfirmBooking = ({ user }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const property = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (!bookingData || !property) return;

    const bookingId = "BK" + Date.now();
    const tenantId = "TN" + Date.now();
    const agreementId = "AG" + Date.now();

    const tenantProfile = {
      tenantId,
      bookingId,
      personalInfo: {
        fullName: bookingData.fullName || "Guest User",
        mobile: bookingData.mobile || "9999999999",
        email: bookingData.email || "guest@email.com",
        gender: property.gender || "N/A",
      },
      pgInfo: {
        pgId: property.id,
        pgName: property.name,
        location: property.location,
        address: property.address,
      },
      roomInfo: {
        sharingType: bookingData.sharingType,
        monthlyRent: bookingData.price,
      },
      stayInfo: {
        checkInDate: new Date().toLocaleDateString(),
        status: "Active",
      },
      agreement: {
        agreementId,
        isSigned: true,
      },
    };

    localStorage.setItem("tenantProfile", JSON.stringify(tenantProfile));
  }, [bookingData, property]);

  if (!bookingData || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-background-muted">
        <Navbar />
        <div className="flex-1 text-center py-24 px-4 sm:px-6">
          <p className="text-text-danger text-lg sm:text-xl mb-6">
            Please complete booking first.
          </p>
          <Link to="/services">
            <CButton text="Go to Services" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-muted">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          🎉 Booking Confirmed
        </h1>

        <p className="text-base sm:text-lg text-text-secondary mb-8 sm:mb-10">
          Your booking for{" "}
          <span className="font-semibold">{property.name}</span> has been
          successfully confirmed.
        </p>

        {/* Rental Agreement */}
        <div className="bg-card shadow-card rounded-xl p-4 sm:p-8 mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
            Rental Agreement
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6">
            View or download your rental agreement.
          </p>

          <CButton
            text="View Rental Agreement"
            fullWidth
            className="text-sm sm:text-base"
            onClick={() => navigate(`/agreement/${id}`)}
          />
        </div>

        {/* Cancel Booking Button */}
        <div className="mb-6">
          <CButton
            text="Cancel Booking"
            variant="outlined"
            className="text-sm sm:text-base border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => navigate(`/booking/cancel/${id}`)}
          />
        </div>

        <Link to="/services">
          <CButton
            text="Back to Services"
            variant="outlined"
            className="text-sm sm:text-base"
          />
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmBooking;
