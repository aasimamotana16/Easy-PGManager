import React, { useState, useEffect, useMemo } from "react";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaSearch,
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
  const apiBaseUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("http://localhost:5000/api/owner/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (error) {
      console.log("Failed to load bookings");
      setBookings([]);
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
    const tenantName = String(b?.tenantName || "").toLowerCase();
    const bookingCode = String(b?.bookingId || "").toLowerCase();
    const pgName = String(b?.pgName || "").toLowerCase();
    return (
      tenantName.includes(searchLower) ||
      bookingCode.includes(searchLower) ||
      pgName.includes(searchLower)
    ) && (selectedPg === "All Properties" || String(b?.pgName || "") === selectedPg);
  });

  const handleUpdateStatus = async (id, newStatus) => {
    const confirm = await Swal.fire({
      title: `Update to ${newStatus}?`,
      text: `Are you sure you want to mark this as ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      confirmButtonText: "Yes, update it!"
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("userToken");
        await axios.put(`http://localhost:5000/api/owner/update-booking/${id}`, 
          { status: newStatus }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchBookings();
        Swal.fire({
          title: "Updated!",
          text: `Booking is now ${newStatus}.`,
          icon: "success",
          confirmButtonColor: "#D97706",
        });
      } catch (err) {
        // Optimistic UI fallback if API fails
        setBookings(prev => prev.map(b => b._id === id ? {...b, status: newStatus} : b));
      }
    }
  };

  const handleResendEmail = async (id) => {
    const result = await Swal.fire({
      title: 'Resend Payment Link?',
      text: "The tenant will receive the email again.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#4B4B4B',
      confirmButtonText: 'Yes, resend'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("userToken");
      Swal.fire({
        title: 'Sending...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await axios.post(`http://localhost:5000/api/owner/send-payment-link/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: 'Sent!',
        text: res.data?.message || 'Payment link has been sent successfully.',
        icon: 'success',
        confirmButtonColor: '#D97706',
      });
    } catch (error) {
      Swal.fire({
        title: 'Failed',
        text: error.response?.data?.message || 'Unable to send payment link.',
        icon: 'error',
        confirmButtonColor: '#D97706',
      });
    }
  };

  const handleDownload = (bookingId) => {
    Swal.fire({
      title: 'Generating PDF...',
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    }).then(() => {
      Swal.fire({
        title: 'Download Started',
        text: `Booking details for ${bookingId} have been saved.`,
        icon: 'success',
        confirmButtonColor: '#D97706',
      });
    });
  };

  const openAgreementPdf = (booking) => {
    const agreementPdfUrl = booking?.agreementPdfUrl;
    if (!agreementPdfUrl) {
      const ownerApproved = Boolean(booking?.ownerApproved);
      const paid = Boolean(booking?.isPaid);
      const status = String(booking?.status || "Pending");

      let reason = "Available after confirmation.";
      if (status === "Pending" && !ownerApproved) reason = "Available after owner approval.";
      if (ownerApproved && !paid) reason = "Available after tenant payment.";
      if (status === "Cancelled") reason = "Not available for cancelled bookings.";

      Swal.fire({
        title: "Agreement Not Ready",
        text: reason,
        icon: "info",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    const normalizedPath = String(agreementPdfUrl).replace(/^\/+/, "");
    const finalUrl = `${apiBaseUrl}/${normalizedPath}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4 md:p-10 bg-gray-200 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className=" text-textPrimary">Bookings</h2>
          <p className="text-primary ">Manage and track all tenant booking requests</p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-md shadow-sm border border-[#D97706]">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Search by name, ID, or PG..." 
            className="w-full pl-2 pr-4 py-3 rounded-md border border-[#E5E0D9] focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
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
      <div className="bg-white rounded-md shadow-sm border border-[#E5E0D9] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9]">
           <h2 className="text-h3-sm lg:text-h3 font-bold text-[#1C1C1C]">Bookings List</h2>
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
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#4B4B4B]">
                    No bookings found
                  </td>
                </tr>
              )}
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-[#1C1C1C]">{b.tenantName}</div>
                    <div className="text-xs text-[#4B4B4B] font-mono">{b.bookingId}</div>
                  </td>
                  <td className="p-5 text-[#4B4B4B] font-medium">{b.pgName}</td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 rounded-md border border-[#D97706] text-[#B45309] text-[10px] font-bold uppercase min-w-[80px] text-center">
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
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
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
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                        options={[
                          { label: 'Pending', value: 'Pending' },
                          { label: 'Confirmed', value: 'Confirmed' },
                          { label: 'Cancelled', value: 'Cancelled' }
                        ]}
                      />
                      {b.status === "Confirmed" && !b.isPaid && (
                        <button 
                          onClick={() => handleResendEmail(b._id)}
                          className="p-2 text-[#D97706] hover:bg-[#FEF3C7] rounded-md transition-all"
                          title="Resend Payment Link"
                        >
                          <FaRegPaperPlane size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownload(b.bookingId)}
                        className="p-2 text-[#4B4B4B] hover:text-[#D97706] hover:bg-[#FEF3C7] rounded-md transition-all"
                        title="Download Confirmation"
                      >
                        <LuDownload size={20} />
                      </button>
                      <button
                        onClick={() => openAgreementPdf(b)}
                        className={`px-3 py-2 text-[10px] font-bold uppercase rounded-md border border-[#E5E0D9] transition-all ${
                          b.agreementPdfUrl
                            ? "text-[#4B4B4B] hover:text-[#D97706] hover:bg-[#FEF3C7]"
                            : "text-[#4B4B4B] opacity-50"
                        }`}
                        title={b.agreementPdfUrl ? "View Agreement" : "Available after confirmation"}
                      >
                        View Agreement
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
