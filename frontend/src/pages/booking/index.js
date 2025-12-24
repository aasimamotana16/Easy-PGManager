import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";
import CInput from "../../components/cInput";
import { pgdetails, hosteldetails } from "../../config/staticData";

const BookingPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const property = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  useEffect(() => {
    // Optional login check
    // if (!user || user.role !== "tenant") {
    //   navigate("/login");
    // }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    checkIn: "",
    checkOut: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/confirm/${id}`, { state: { bookingData: formData } });
  };

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center py-32 text-red-500 text-2xl">
          Property not found!
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-roboto">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-0 py-20 flex justify-center">
        <div className="w-full max-w-3xl lg:max-w-4xl">
          <h1 className="text-4xl md:text-4xl font-bold mb-2 text-center">{`Book ${property.name}`}</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 text-center">
            {property.location} · Rent: {property.price}
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-xl p-6 sm:p-8 md:p-10 space-y-4"
          >
            <CInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mb-2"
            />
            <CInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mb-2"
            />
            <CInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mb-2"
            />
            <CInput
              label="Check-In Date"
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              required
              className="mb-2"
            />
            <CInput
              label="Check-Out Date"
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              required
              className="mb-2"
            />

            <CButton
              type="submit"
              className="w-full text-lg md:text-xl mt-2"
            >
              Confirm Booking
            </CButton>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
