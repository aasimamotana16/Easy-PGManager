import React, { useState, useEffect, useMemo } from "react";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaSearch,
  FaFilter,
  FaPlus,
  FaRegPaperPlane
} from "react-icons/fa";
import { LuDownload } from "react-icons/lu"; 
import axios from "axios";
import Swal from "sweetalert2";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPg, setSelectedPg] = useState("All Properties");

  const fetchBookings = async () => {
    const sample = [
      { _id: '1', bookingId: 'BK001', pgName: 'Green Villa', roomType: 'Single', tenantName: 'Rahul Sharma', checkInDate: '2026-01-15', checkOutDate: '2026-02-15', status: 'Confirmed', isPaid: false },
      { _id: '2', bookingId: 'BK002', pgName: 'Sunshine Residency', roomType: 'Double', tenantName: 'Priya Patel', checkInDate: '2026-01-20', checkOutDate: '2026-02-20', status: 'Pending', isPaid: false },
      { _id: '3', bookingId: 'BK003', pgName: 'Green Villa', roomType: 'Single', tenantName: 'Amit Kumar', checkInDate: '2026-02-01', checkOutDate: '2026-03-01', status: 'Cancelled', isPaid: false },
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

  const uniquePgs = useMemo(() => {
    const pgs = bookings.map(b => b.pgName);
    return ["All Properties", ...new Set(pgs)];
  }, [bookings]);

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      b.tenantName.toLowerCase().includes(searchLower) || 
      b.bookingId.toLowerCase().includes(searchLower) ||
      b.pgName.toLowerCase().includes(searchLower)
    ) && (selectedPg === "All Properties" || b.pgName === selectedPg);
  });

  const handleUpdateStatus = async (id, newStatus) => {
    const confirm = await Swal.fire({
      title: `Update to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("userToken");
        await axios.patch(`http://localhost:5000/api/owner/booking/${id}`, 
          { status: newStatus }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchBookings();
      } catch (err) {
        setBookings(prev => prev.map(b => b._id === id ? {...b, status: newStatus} : b));
      }
    }
  };

  const handleResendEmail = (id) => {
    Swal.fire({
      title: 'Resend Payment Link?',
      text: "The tenant will receive the email again.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#4B4B4B',
      confirmButtonText: 'Yes, resend'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sent!', 'Payment link has been resent.', 'success');
      }
    });
  };

  return (
    <div className="p-4 md:p-10 bg-gray-100 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#1C1C1C]">Bookings</h1>
          <p className="text-[#4B4B4B] mt-2">Manage and track all tenant booking requests</p>
        </div>
        {/*<CButton className="flex items-center gap-2">
          <FaPlus /> Add New Booking
        </CButton>*/}
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-[#D97706]">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name, ID, or PG..." 
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#E5E0D9] focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CSelect 
          value={selectedPg}
          onChange={(e) => setSelectedPg(e.target.value)}
          options={uniquePgs.map(pg => ({ value: pg, label: pg }))}
          placeholder="All Properties"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D9] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9]">
           <h2 className="text-h2-sm lg:text-h2 font-bold text-[#1C1C1C]">Bookings List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-primarySoft text-black text-sm uppercase ">
              <tr>
                <th className="p-5">Booking Details</th>
                <th className="p-5">Property</th>
                <th className="p-5 text-center">Room Type</th>
                <th className="p-5">Stay Dates</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D9]">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-[#1C1C1C]">{b.tenantName}</div>
                    <div className="text-xs text-[#4B4B4B] font-mono">{b.bookingId}</div>
                  </td>
                  <td className="p-5 text-[#4B4B4B] font-medium">{b.pgName}</td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 rounded border border-[#D97706] text-[#B45309] text-[10px] font-bold uppercase min-w-[80px] text-center">
                        {b.roomType}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-[#4B4B4B]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400">IN:</span> {b.checkInDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400">OUT:</span> {b.checkOutDate}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        b.status === "Confirmed" ? "bg-green-100 text-green-700" : 
                        "bg-red-100 text-red-700"
                      }`}>
                        {b.status === "Pending" && <FaClock />}
                        {b.status === "Confirmed" && <FaCheck />}
                        {b.status === "Cancelled" && <FaTimes />}
                        {b.status}
                      </span>
                      {b.status === "Confirmed" && (
                        <span className="text-[10px] text-[#B45309] font-medium italic leading-none mt-1">
                          {b.isPaid ? "Payment Received" : "Awaiting Payment"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3">
                      <CSelect 
                        value={b.status}
                        onChange={(val) => handleUpdateStatus(b._id, val)}
                        options={[
                          { label: 'Pending', value: 'Pending' },
                          { label: 'Confirmed', value: 'Confirmed' },
                          { label: 'Cancelled', value: 'Cancelled' }
                        ]}
                      />
                      {b.status === "Confirmed" && !b.isPaid && (
                        <button 
                          onClick={() => handleResendEmail(b._id)}
                          className="p-2 text-[#D97706] hover:bg-[#FEF3C7] rounded-full transition-all"
                          title="Resend Payment Link"
                        >
                          <FaRegPaperPlane size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => window.alert(`Downloading ${b.bookingId}`)}
                        className="p-2 text-[#4B4B4B] hover:text-[#D97706] hover:bg-[#FEF3C7] rounded-full transition-all"
                        title="Download Confirmation"
                      >
                        <LuDownload size={20} />
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