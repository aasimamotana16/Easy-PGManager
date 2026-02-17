import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Loader from "../../../components/loader";
import { CheckBadgeIcon, ShieldCheckIcon, MapPinIcon, CreditCardIcon } from "@heroicons/react/24/solid";

const PayNow = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  // Your Color Theme [cite: 2026-02-09]
  const colors = {
    primary: "#D97706",
    primaryDark: "#B45309",
    primarySoft: "#FEF3C7",
    textPrimary: "#1C1C1C",
    textSecondary: "#4B4B4B",
    border: "#E5E0D9",
    background: "#ffffff"
  };

  useEffect(() => {
    // This effect handles fetching the data using the ID from the URL (Email link)
    const getBookingDetails = async () => {
      try {
        // Replace with your actual API call: const res = await api.getBooking(bookingId);
        // Mocking the data structure visible in your backend screenshots:
        setBooking({
          propertyName: "Elite Property",
          fullAddress: "Sector 45, Hitech City, Surat", // Combined address + location
          roomType: "Single Sharing",
          rent: 5000,
          deposit: 5000,
          total: 10000
        });
        setLoading(false);
      } catch (err) {
        console.error("Booking fetch failed", err);
        setLoading(false);
      }
    };
    getBookingDetails();
  }, [bookingId]);

  const handlePayment = () => {
    // Tenant pays the rent/deposit [cite: 2026-02-15]
    console.log("Processing payment for booking:", bookingId);
    alert("Payment Successful! Owner has been notified.");
    // After payment, redirect to confirm booking page so owner can confirm arrival
    navigate(`/confirmBook/${bookingId}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Navbar />
      
      {/* Responsive Container [cite: 2026-02-06] */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row gap-10">
        
        {/* Left Section: Booking Details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: colors.textPrimary }}>
              Finalize Booking
            </h1>
            <p style={{ color: colors.textSecondary }}>Review your stay details and complete the payment to move in.</p>
          </div>

          <div className="p-6 rounded-md border-2" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-2">{booking.propertyName}</h2>
            <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: colors.textSecondary }}>
              <MapPinIcon className="h-4 w-4" style={{ color: colors.primary }} />
              {booking.fullAddress}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-dashed" style={{ borderColor: colors.border }}>
                <span style={{ color: colors.textSecondary }}>Room Variant</span>
                <span className="font-bold text-xs uppercase bg-gray-100 px-2 py-1 rounded">{booking.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Monthly Rent</span>
                <span className="font-bold">₹{booking.rent}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span style={{ color: colors.textSecondary }}>Security Deposit</span>
                <span className="font-bold">₹{booking.deposit}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-md" style={{ backgroundColor: colors.primarySoft }}>
            <ShieldCheckIcon className="h-8 w-8" style={{ color: colors.primary }} />
            <p className="text-xs font-medium" style={{ color: colors.primaryDark }}>
              Your payment is secure. Once paid, the owner will receive a notification to confirm your arrival [cite: 2026-02-15].
            </p>
          </div>
        </div>

        {/* Right Section: Payment Action */}
        <div className="w-full md:w-96">
          <div className="sticky top-24 p-8 rounded-md shadow-2xl border border-gray-100 bg-white">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>
              Total Payable Now
            </p>
            <div className="text-5xl font-black mb-8" style={{ color: colors.textPrimary }}>
              ₹{booking.total}
            </div>

            <button 
              onClick={handlePayment}
              className="w-full py-4 rounded font-black text-white uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              <CreditCardIcon className="h-5 w-5" />
              Pay Now
            </button>

            <div className="mt-6 space-y-3">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                 <CheckBadgeIcon className="h-4 w-4 text-green-600" /> Instant Confirmation
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                 <CheckBadgeIcon className="h-4 w-4 text-green-600" /> Receipt sent to Email
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayNow;