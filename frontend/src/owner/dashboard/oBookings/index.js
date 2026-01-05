import React, { useState } from "react";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import CButton from "../../../components/cButton"; // your default button

// Mock PG list
const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
];

// Initial Bookings (mock data)
const INITIAL_BOOKINGS = [
  {
    id: 101,
    pgId: 1,
    roomType: "Single",
    tenantName: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@gmail.com",
    checkIn: "2026-01-05",
    checkOut: "2026-06-05",
    seatsBooked: 1,
    status: "Pending",
  },
  {
    id: 102,
    pgId: 2,
    roomType: "Double",
    tenantName: "Aman Verma",
    phone: "8765432109",
    email: "aman@gmail.com",
    checkIn: "2026-01-10",
    checkOut: "2026-07-10",
    seatsBooked: 2,
    status: "Pending",
  },
];

const BookingManagement = () => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [tenants, setTenants] = useState([]); // to store confirmed tenants
  const [viewBooking, setViewBooking] = useState(null); // booking to view

  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "";

  // Confirm booking
  const confirmBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "Confirmed" } : b
      )
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      // Add tenant automatically
      const newTenant = {
        id: tenants.length + 1,
        name: booking.tenantName,
        phone: booking.phone,
        email: booking.email,
        pgId: booking.pgId,
        room: booking.roomType,
        joiningDate: booking.checkIn,
        status: "Active",
      };
      setTenants([...tenants, newTenant]);
      alert(`${booking.tenantName} added as Tenant!`);
    }
  };

  // Reject booking
  const rejectBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "Cancelled" } : b
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Bookings</h1>

      {/* Booking Table */}
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
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.id}</td>
                <td className="p-3">{getPGName(b.pgId)}</td>
                <td className="p-3">{b.roomType}</td>
                <td className="p-3">{b.tenantName}</td>
                <td className="p-3">{b.checkIn}</td>
                <td className="p-3">{b.checkOut}</td>
                <td className="p-3">{b.seatsBooked}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : b.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <CButton onClick={() => setViewBooking(b)} title="View Booking">
                    <FaEye />
                  </CButton>

                  {b.status === "Pending" && (
                    <>
                      <CButton
                        onClick={() => confirmBooking(b.id)}
                        title="Confirm Booking"
                      >
                        <FaCheck />
                      </CButton>
                      <CButton
                        onClick={() => rejectBooking(b.id)}
                        title="Reject Booking"
                      >
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

      {/* View Booking Modal */}
      {viewBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <p>
              <strong>Booking ID:</strong> {viewBooking.id}
            </p>
            <p>
              <strong>Tenant Name:</strong> {viewBooking.tenantName}
            </p>
            <p>
              <strong>Phone:</strong> {viewBooking.phone}
            </p>
            <p>
              <strong>Email:</strong> {viewBooking.email}
            </p>
            <p>
              <strong>PG:</strong> {getPGName(viewBooking.pgId)}
            </p>
            <p>
              <strong>Room Type:</strong> {viewBooking.roomType}
            </p>
            <p>
              <strong>Check-in:</strong> {viewBooking.checkIn}
            </p>
            <p>
              <strong>Check-out:</strong> {viewBooking.checkOut}
            </p>
            <p>
              <strong>Seats Booked:</strong> {viewBooking.seatsBooked}
            </p>
            <p>
              <strong>Status:</strong> {viewBooking.status}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <CButton onClick={() => setViewBooking(null)}>Close</CButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
