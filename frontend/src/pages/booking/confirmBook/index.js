import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";

const ConfirmBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  /* 🔹 EFFECT 1: Redirect if accessed directly or refreshed */
  useEffect(() => {
    if (!bookingData) {
      navigate(`/book/${id}`, { replace: true });
    }
  }, [bookingData, id, navigate]);

  /* 🔹 EFFECT 2: Save booking data after successful navigation */
  useEffect(() => {
    if (!bookingData) return;

    const bookingId = "BK" + Date.now();
    const tenantId = "TN" + Date.now();
    const agreementId = "AG" + Date.now();

    const tenantProfile = {
      tenantId,
      bookingId,
      pgId: bookingData.pgId,
      members: bookingData.members,
      stayDetails: bookingData.stayDetails,
      totalRent: bookingData.totalRent,
      agreement: {
        agreementId,
        isSigned: true,
      },
    };

    localStorage.setItem("tenantProfile", JSON.stringify(tenantProfile));
  }, [bookingData]);

  /* 🔹 BLOCK RENDER WHILE REDIRECTING */
  if (!bookingData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background-muted">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          🎉 Booking Confirmed
        </h1>

        <p className="text-text-secondary mb-8">
          Your booking has been successfully confirmed.
        </p>

        {/* Rental Agreement 
        <div className="bg-card shadow-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">
            Rental Agreement
          </h2>

          <CButton
            text="View Rental Agreement"
            fullWidth
            onClick={() => navigate(`/agreement/${id}`)}
          />
        </div>*/}

        {/* Cancel Booking */}
        <div className="mb-6">
          <CButton
            text="Cancel Booking"
            variant="outlined"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => navigate(`/cancel/${id}`)}
          />
        </div>

        {/* Back to Services */}
        <CButton
          text="Back to Services"
          variant="outlined"
          onClick={() => navigate("/services")}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmBooking;
