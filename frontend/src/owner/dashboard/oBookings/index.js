import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaClipboardList,
  FaFileDownload,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);

  /* ---------- FETCH BOOKINGS ---------- */
  const fetchBookings = async () => {
    const sample = [
      { _id: '1', bookingId: 'BK001', pgName: 'My Dream PG', roomType: 'Single', tenantName: 'Rahul Sharma', checkInDate: '2026-01-15', checkOutDate: '2026-02-15', bedsBooked: 1, status: 'Confirmed' },
      { _id: '2', bookingId: 'BK002', pgName: 'Sunrise Boys PG', roomType: 'Double', tenantName: 'Priya Patel', checkInDate: '2026-01-20', checkOutDate: '2026-02-20', bedsBooked: 1, status: 'Pending' },
      { _id: '3', bookingId: 'BK003', pgName: 'My Dream PG', roomType: 'Single', tenantName: 'Amit Kumar', checkInDate: '2026-02-01', checkOutDate: '2026-03-01', bedsBooked: 1, status: 'Cancelled' },
    ];
    setBookings(sample);

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("http://localhost:5000/api/owner/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data.length > 0) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.log('API failed, using sample data');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ---------- IN-TABLE STATUS UPDATE ---------- */
  const handleUpdateStatus = async (id, newStatus) => {
    const confirm = await Swal.fire({
      title: `Update to ${newStatus}?`,
      text: `Change booking status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef7e24",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("userToken");
        await axios.patch(`http://localhost:5000/api/owner/booking/${id}`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Success", "Status updated!", "success");
        fetchBookings();
      } catch (err) {
        setBookings(prev => prev.map(b => b._id === id ? {...b, status: newStatus} : b));
        Swal.fire("Updated", "Status updated locally", "success");
      }
    }
  };

  const downloadBookingConfirmation = (booking) => {
    const bookingContent = `Booking ID: ${booking.bookingId}\nTenant: ${booking.tenantName}`;
    const blob = new Blob([bookingContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Booking_${booking.bookingId}.txt`;
    a.click();
    Swal.fire({ icon: 'success', title: 'Downloaded!' });
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8f9fa] min-h-screen">
      
      {/* HEADER SECTION - Matched to your PG Management code */}
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-orange-100 p-3 rounded-xl hidden sm:block">
          <FaClipboardList className="text-[#ef7e24] text-2xl" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
            Bookings
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500">
            Manage your tenant booking requests
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-100 border-b">
             <tr className="text-black text-sm uppercase tracking-wider font-bold">
                <th className="p-4 ">ID</th>
                <th className="p-4 ">Tenant</th>
                <th className="p-4 ">PG Name</th>
                <th className="p-4 ">Room / Beds</th>
                <th className="p-4 ">Check-In/Out</th>
                <th className="p-4 ">Status</th>
                <th className="p-4 ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">{b.bookingId}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{b.tenantName}</div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{b.pgName}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[11px] font-bold mr-2">
                      {b.roomType}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">
                       {b.bedsBooked} Bed(s)
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px] font-semibold text-gray-700">
                      {b.checkInDate} <span className="text-gray-300 mx-1">→</span> {b.checkOutDate}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      b.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      b.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {b.status === "Pending" && <FaClock />}
                      {b.status === "Confirmed" && <FaCheck />}
                      {b.status === "Cancelled" && <FaTimes />}
                      {b.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <select 
                        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white shadow-sm font-bold cursor-pointer"
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button 
                        onClick={() => downloadBookingConfirmation(b)}
                        className="text-gray-400 hover:text-orange-600 p-2 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <FaFileDownload size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;