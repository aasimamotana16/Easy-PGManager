// src/pages/booking/agreement.js
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { pgdetails } from "../../../config/staticData";

const Agreement = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Check if user is logged in and is a tenant
  if (!user || user.role !== "tenant") {
    navigate("/login");
    return null;
  }

  // Find property by ID
  const property = [...pgdetails].find(
    (item) => item.id === parseInt(id)
  );

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-2xl font-semibold text-red-500">
            Property not found!
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-roboto">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold mb-6">📝 Rental Agreement</h1>

        <p className="text-lg mb-10">
          Rental Agreement for <span className="font-semibold">{property.name}</span>.
        </p>

        <div className="bg-white shadow-lg rounded-xl p-8 mb-10">
          <p className="text-gray-700 mb-6">
            You can view or download your rental agreement for this property.
          </p>

          <CButton
            text="Download Agreement"
            fullWidth
            onClick={() => alert("Download PDF will start")}
          />
        </div>

        <Link to="/services">
          <CButton text="Back to Services" variant="outlined" />
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Agreement;
