import React from "react";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CancelForm from "../cancelForm"; // ✅ fixed relative path

const CancelBooking = () => {
  return (
    <>
      <Navbar />
      <CancelForm />
      <Footer />
    </>
  );
};

export default CancelBooking;
