import React, { useState, useEffect } from "react"; // Added useEffect
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios"; // Ensure axios is installed
import CButton from "../../../components/cButton";

const BookingManagement = () => {
  // 1. Initialize with empty array so data comes from Backend
  const [bookings, setBookings] = useState([]);
  const [viewBooking, setViewBooking] = useState(null);

  // 2. Fetch bookings on page load
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token"); // Use your owner token
      const res = await axios.get("http://localhost:5000/api/owner/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 3. Update Status on Backend (Confirm)
  const confirmBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/owner/update-booking/${id}`, 
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Booking Confirmed!");
        fetchBookings(); // Refresh list to show updated status
      }
    } catch (err) {
      console.error("Confirm error:", err);
    }
  };

  // 4. Update Status on Backend (Reject)
  const rejectBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/owner/update-booking/${id}`, 
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Bookings</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Booking ID</th>
              <th className="p-3">PG Name</th>
              <th className="p-3">Room Type</th>
              <th className="p-3">Tenant Name</th>
              <th className="p-3">Check-in</th>
              <th className="p-3">Check-out</th>
              <th className="p-3">Seats Booked</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t">
                {/* Use b._id or bookingId from backend */}
                <td className="p-3">{b.bookingId || b._id.substring(0, 6)}</td>
                <td className="p-3">{b.pgName}</td>
                <td className="p-3">{b.roomType}</td>
                <td className="p-3">{b.tenantName}</td>
                <td className="p-3">{b.checkInDate}</td>
                <td className="p-3">{b.checkOutDate}</td>
                <td className="p-3">{b.seatsBooked}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    b.status === "Pending" ? "bg-yellow-100 text-yellow-700" : 
                    b.status === "Confirmed" ? "bg-green-100 text-green-700" : 
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <CButton onClick={() => setViewBooking(b)} title="View Booking">
                    <FaEye />
                  </CButton>
                  {b.status === "Pending" && (
                    <>
                      <CButton onClick={() => confirmBooking(b._id)} title="Confirm">
                        <FaCheck />
                      </CButton>
                      <CButton onClick={() => rejectBooking(b._id)} title="Reject">
                        <FaTimes />
                      </CButton>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Booking Modal logic remains same, just update field names to camelCase */}
      {/* This uses 'viewBooking', which will remove the blur and the warning */}
{viewBooking && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Booking Details</h2>
      
      {/* Accessing properties from the selected booking */}
      <div className="space-y-2">
        <p><strong>Tenant:</strong> {viewBooking.tenantName}</p>
        <p><strong>PG Name:</strong> {viewBooking.pgName}</p>
        <p><strong>Room:</strong> {viewBooking.roomType}</p>
        <p><strong>Check-in:</strong> {viewBooking.checkInDate}</p>
      </div>

      <button 
        onClick={() => setViewBooking(null)} 
        className="mt-6 w-full bg-gray-800 text-white py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default BookingManagement;