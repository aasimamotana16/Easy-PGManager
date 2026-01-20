import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaClipboardList,
  FaFileDownload,
} from "react-icons/fa";
import axios from "axios";
import CButton from "../../../components/cButton";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [viewBooking, setViewBooking] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [pgFilter, setPgFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------- FETCH BOOKINGS (UNCHANGED) ---------- */
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/owner/my-bookings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  /* ---------- UPDATE STATUS (UNCHANGED) ---------- */
  const confirmBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/owner/update-booking/${id}`,
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) fetchBookings();
    } catch (err) {
      console.error("Confirm error:", err);
    }
  };

  const rejectBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/owner/update-booking/${id}`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) fetchBookings();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  /* ---------- FILTER LOGIC (UNCHANGED) ---------- */
  const filteredBookings = bookings.filter((b) => {
    const statusMatch =
      statusFilter === "all" ? true : b.status === statusFilter;

    const pgMatch =
      pgFilter === "all" ? true : b.pgName === pgFilter;

    const checkIn = new Date(b.checkInDate);
    const fromMatch = fromDate ? checkIn >= new Date(fromDate) : true;
    const toMatch = toDate ? checkIn <= new Date(toDate) : true;

    return statusMatch && pgMatch && fromMatch && toMatch;
  });

  const uniquePGs = [...new Set(bookings.map((b) => b.pgName))];

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER (LIKE OTHER DASHBOARD PAGES) */}
      <div className="flex items-center gap-3">
        <FaClipboardList className="text-orange-500 text-3xl" />
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Bookings
          </h1>
          <p className="text-gray-500">
            View and manage booking requests
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-md shadow grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* PG Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            PG Name
          </label>
          <select
            value={pgFilter}
            onChange={(e) => setPgFilter(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          >
            <option value="all">All PGs</option>
            {uniquePGs.map((pg) => (
              <option key={pg} value={pg}>
                {pg}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white border-b">
            <tr>
              <th className="p-4 text-left">Booking ID</th>
              <th className="p-4 text-left">PG Name</th>
              <th className="p-4 text-left">Room Type</th>
              <th className="p-4 text-left">Tenant</th>
              <th className="p-4 text-left">Check-in</th>
              <th className="p-4 text-left">Check-out</th>
              <th className="p-4 text-center">Seats</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <tr key={b._id} className="border-b last:border-none">
                  <td className="p-4">{b.bookingId || b._id.slice(0, 6)}</td>
                  <td className="p-4">{b.pgName}</td>
                  <td className="p-4">{b.roomType}</td>
                  <td className="p-4">{b.tenantName}</td>
                  <td className="p-4">{b.checkInDate}</td>
                  <td className="p-4">{b.checkOutDate}</td>
                  <td className="p-4 text-center">{b.seatsBooked}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
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

                  <td className="p-4 flex justify-center gap-2">
                    <CButton onClick={() => setViewBooking(b)} title="View">
                      <FaEye />
                    </CButton>

                    <CButton
                      onClick={() =>
                        alert("Agreement download coming soon")
                      }
                      title="Download Agreement"
                    >
                      <FaFileDownload />
                    </CButton>

                    {b.status === "Pending" && (
                      <>
                        <CButton onClick={() => confirmBooking(b._id)}>
                          <FaCheck />
                        </CButton>
                        <CButton onClick={() => rejectBooking(b._id)}>
                          <FaTimes />
                        </CButton>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500"
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {viewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-md shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Booking Details
            </h2>

            <div className="space-y-2 text-sm">
              <p><strong>Tenant:</strong> {viewBooking.tenantName}</p>
              <p><strong>PG:</strong> {viewBooking.pgName}</p>
              <p><strong>Room:</strong> {viewBooking.roomType}</p>
              <p><strong>Check-in:</strong> {viewBooking.checkInDate}</p>
              <p><strong>Status:</strong> {viewBooking.status}</p>
            </div>

            <button
              onClick={() => setViewBooking(null)}
              className="mt-6 w-full bg-black text-white py-2 rounded-md"
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
