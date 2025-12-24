import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";

const CancelSuccess = () => {
  return (
    <>
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Booking Cancelled
        </h1>

        <p className="text-text-secondary mb-6">
          Your profile is archived for 10 days with read-only access.
        </p>

        <CButton>Go to Dashboard</CButton>
      </section>

      <Footer />
    </>
  );
};

export default CancelSuccess;
