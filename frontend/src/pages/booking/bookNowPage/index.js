import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pgdetails, hosteldetails } from "../../../config/staticData";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput"; // default CInput

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the PG by ID
  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  const [persons, setPersons] = useState(1);

  // Booking form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    sharingType: pg?.sharing?.[0]?.type || "Single",
    price: pg?.sharing?.[0]?.price || 0,
  });

  if (!pg) return <div className="text-center mt-20">PG not found</div>;

  const increase = () => {
    if (persons < (pg.sharing?.[0]?.available || 5)) setPersons(persons + 1);
  };
  const decrease = () => {
    if (persons > 1) setPersons(persons - 1);
  };

  const totalRent = (pg.sharing?.[0]?.price || 0) * persons;

  const handleBooking = () => {
    const bookingData = {
      ...form,
      sharingType: pg.sharing?.[0]?.type || "Single",
      price: pg.sharing?.[0]?.price || 0,
      persons,
    };

    navigate(`/confirm/${pg.id}`, { state: { bookingData } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Book {pg.name}</h2>
        <p className="text-gray-500 mb-6">{pg.location}</p>

        {/* Booking Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <CInput
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <CInput
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <CInput
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <CInput
            type="date"
            placeholder="Check-in Date"
            value={form.checkIn}
            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
          />
          <CInput
            type="date"
            placeholder="Check-out Date"
            value={form.checkOut}
            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
          />
        </div>

        {/* Number of Persons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
          <span className="text-green-600">
            {pg.sharing?.[0]?.available || 5} Beds Available
          </span>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={decrease}
              className="px-4 py-2 bg-gray-200 rounded text-lg"
            >
              −
            </button>
            <span className="text-lg font-medium">{persons}</span>
            <button
              onClick={increase}
              className="px-4 py-2 bg-gray-200 rounded text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Rent Info */}
        <div className="bg-gray-100 p-4 rounded mb-4 text-center text-base sm:text-lg">
          <p>Per Person Rent ₹{pg.sharing?.[0]?.price}/month</p>
          <p className="font-semibold">Total Rent ₹{totalRent}/month</p>
        </div>

        <CButton
          size="lg"
          className="w-full bg-orange-500 text-white text-lg"
          onClick={handleBooking} // ✅ navigate to confirm page with bookingData
        >
          Confirm Booking
        </CButton>
      </div>
    </div>
  );
};

export default BookingPage;
