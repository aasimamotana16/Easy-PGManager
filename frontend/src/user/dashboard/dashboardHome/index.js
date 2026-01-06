import React, { useState } from "react";
import { FaMoneyBillWave, FaFileContract, FaUpload, FaHeadset } from "react-icons/fa";
import CButton from "../../../components/cButton";

/* ---------- Mock Data ---------- */
const userData = {
  profile: {
    name: "Asima Motana",
    email: "asima@example.com",
    contact: "+91 9876543210",
  },
  bookings: [
    {
      pgName: "Shree Residency PG",
      roomNo: "A-203",
      rent: "₹8,500",
      status: "Active",
      nextDue: "05 Jan 2026",
    },
    {
      pgName: "Sai Paying Guest",
      roomNo: "B-101",
      rent: "₹7,500",
      status: "Completed",
      nextDue: "N/A",
    },
  ],
  documents: [
    { name: "PG Agreement", uploaded: false },
    { name: "Aadhaar Card", uploaded: false },
  ],
};

const DashboardHome = () => {
  const { profile } = userData;
  const [bookings, setBookings] = useState(userData.bookings);
  const [documents, setDocuments] = useState(userData.documents);

  const activeBooking = bookings.find((b) => b.status === "Active");

  /* ---------- Handlers ---------- */
  const handlePayRent = () => {
    if (!activeBooking) return;
    alert(`Rent ${activeBooking.rent} paid for ${activeBooking.pgName}`);
  };

  const handleViewAgreement = () => alert("Opening PG Agreement...");
  const handleUploadDocuments = () => {
    setDocuments(documents.map((d) => ({ ...d, uploaded: true })));
    alert("Documents uploaded successfully");
  };
  const handleSupport = () => alert("Support team will contact you shortly");
  const handleViewDetails = (pgName) => alert(`Viewing details for ${pgName}`);

  return (
    /* 🌿 MINT → TEAL GRADIENT BACKGROUND */
    <div className="space-y-8 p-6 rounded-2xl 
      bg-dashboard-gradient">

      {/* Welcome */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          Manage your PG stay, payments, and support from one place.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {activeBooking && (
          <DashboardCard title="Current Booking" icon="🏠">
            <p className="font-medium">{activeBooking.pgName}</p>
            <p>Room: {activeBooking.roomNo}</p>
            <StatusBadge status={activeBooking.status} />
          </DashboardCard>
        )}

        {activeBooking && (
          <DashboardCard title="Next Payment" icon="📅">
            <p className="font-medium">{activeBooking.rent}</p>
            <p>Due on {activeBooking.nextDue}</p>
            <CButton
              className="mt-3 hover:scale-105 transition-transform"
              onClick={handlePayRent}
            >
              Pay Rent
            </CButton>
          </DashboardCard>
        )}
      </div>

      {/* Stats */}
      {activeBooking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="PG Name" value={activeBooking.pgName} />
          <StatCard title="Room No" value={activeBooking.roomNo} />
          <StatCard title="Monthly Rent" value={activeBooking.rent} />
          <StatCard title="Status" value={activeBooking.status} highlight />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-lg font-semibold text-primaryDark mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <CButton
            icon={<FaMoneyBillWave className="mr-2" />}
            className="hover:scale-105 transition-transform"
            onClick={handlePayRent}
          >
            Pay Rent
          </CButton>
          <CButton
            icon={<FaFileContract className="mr-2" />}
            className="hover:scale-105 transition-transform"
            onClick={handleViewAgreement}
          >
            View Agreement
          </CButton>
          <CButton
            icon={<FaUpload className="mr-2" />}
            className="hover:scale-105 transition-transform"
            onClick={handleUploadDocuments}
          >
            Upload Documents
          </CButton>
          <CButton
            icon={<FaHeadset className="mr-2" />}
            className="hover:scale-105 transition-transform"
            onClick={handleSupport}
          >
            Contact Support
          </CButton>
        </div>
      </div>

      {/* Bookings */}
      <div>
        <h2 className="text-xl font-semibold text-primaryDark mb-4">
          Your Bookings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking, index) => (
            <BookingCard
              key={index}
              booking={booking}
              onView={() => handleViewDetails(booking.pgName)}
              onPay={handlePayRent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Components ---------- */
const DashboardCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-2xl transition-shadow">
    <div className="flex items-center gap-2 font-semibold">
      <span>{icon}</span>
      {title}
    </div>
    <div className="mt-3 text-sm space-y-1">{children}</div>
  </div>
);

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-2xl transition-shadow">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p className={`text-lg font-semibold mt-1 ${highlight ? "text-green-600" : "text-primary"}`}>
      {value}
    </p>
  </div>
);

const BookingCard = ({ booking, onView, onPay }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-lg">{booking.pgName}</h3>
      <StatusBadge status={booking.status} />
    </div>

    <div className="space-y-2 text-sm">
      <InfoRow label="Room No" value={booking.roomNo} />
      <InfoRow label="Monthly Rent" value={booking.rent} />
      <InfoRow label="Next Due" value={booking.nextDue} />
    </div>

    <div className="mt-5 flex gap-3">
      <CButton className="hover:scale-105 transition-transform" onClick={onView}>
        View Details
      </CButton>
      {booking.status === "Active" && (
        <CButton className="hover:scale-105 transition-transform" onClick={onPay}>
          Pay Rent
        </CButton>
      )}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-buttonDEFAULT">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

export default DashboardHome;
