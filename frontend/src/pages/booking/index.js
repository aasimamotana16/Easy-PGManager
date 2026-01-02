import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { pgdetails, hosteldetails } from "../../config/staticData";
import CButton from "../../components/cButton";

const BookingPage = () => {
  const { id } = useParams();
  

  // Find the PG by ID
  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  const [persons, setPersons] = useState(1);

  if (!pg) return <div className="text-center mt-20">PG not found</div>;

  const increase = () => {
    if (persons < (pg.sharing?.[0]?.available || 5)) setPersons(persons + 1);
  };
  const decrease = () => {
    if (persons > 1) setPersons(persons - 1);
  };

  const totalRent = (pg.sharing?.[0]?.price || 0) * persons;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Book {pg.name}</h2>
        <p className="text-gray-500 mb-6">{pg.location}</p>

        {/* Booking Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
          />
          <input
            type="date"
            placeholder="Check-in Date"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
          />
          <input
            type="date"
            placeholder="Check-out Date"
            className="w-full p-3 rounded-lg border border-gray-300 text-base sm:text-sm"
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
          onClick={() => alert("Booking Confirmed")}
        >
          Confirm Booking
        </CButton>
      </div>
    </div>
  );
};

export default BookingPage;
