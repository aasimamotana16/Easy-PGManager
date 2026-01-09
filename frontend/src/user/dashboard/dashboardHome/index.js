import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaFileContract, FaUpload, FaHeadset } from "react-icons/fa";
import CButton from "../../../components/cButton";

/* ---------- Mock Data ---------- */
const userData = {
  profile: {
    name: "Asima Motana",
    email: "asima@example.com",
    contact: "", // empty contact simulates incomplete profile
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
  const navigate = useNavigate();
  const { profile } = userData;
  const [bookings, setBookings] = useState(userData.bookings);
  const [documents, setDocuments] = useState(userData.documents);

  const [modalBooking, setModalBooking] = useState(null); // modal state

  const activeBooking = bookings.find((b) => b.status === "Active");

  /* ---------- Handlers ---------- */
  const handlePayRent = () => {
    if (!activeBooking) return;
    navigate("/user/dashboard/payments", { state: { booking: activeBooking } });
  };

  const handleViewAgreement = () => {
    if (!activeBooking) return;
    navigate("/user/dashboard/agreements", { state: { booking: activeBooking } });
  };

  const handleUploadDocuments = () => {
    navigate("/user/dashboard/documents", { state: { documents } });
  };

  const handleSupport = () => {
    navigate("/user/dashboard/support");
  };

  const handleViewDetails = (booking) => {
    setModalBooking(booking); // open modal with selected booking
  };

  const closeModal = () => setModalBooking(null);

  /* ---------- Profile completeness check ---------- */
  const isProfileComplete = profile.name && profile.email && profile.contact;

  return (
    <div className="space-y-8 p-6 rounded-2xl bg-dashboard-gradient">
      {/* Welcome */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          Manage your PG stay, payments, and support from one place.
        </p>
        {!isProfileComplete && (
          <p className="mt-2 text-sm text-red-500 font-medium">
            Your profile is incomplete. Please update your personal information.
          </p>
        )}
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
              Next Payment
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
              onView={() => handleViewDetails(booking)}
              onPay={handlePayRent}
            />
          ))}
        </div>
      </div>

      {/* ---------- Modal for View Details ---------- */}
      {modalBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{modalBooking.pgName}</h2>
            <p>
              <strong>Room No:</strong> {modalBooking.roomNo}
            </p>
            <p>
              <strong>Rent:</strong> {modalBooking.rent}
            </p>
            <p>
              <strong>Status:</strong> {modalBooking.status}
            </p>
            <p>
              <strong>Next Due:</strong> {modalBooking.nextDue}
            </p>
            <div className="mt-5 text-right">
              <CButton className="bg-red-500 text-white" onClick={closeModal}>
                Close
              </CButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Components ---------- */
const DashboardCard = ({ title, icon, children }) => (
  <div className="bg-card rounded-2xl shadow-lg p-5 border hover:shadow-2xl transition-shadow">
    <div className="flex items-center gap-2 font-semibold">
      <span>{icon}</span>
      {title}
    </div>
    <div className="mt-3 text-sm space-y-1">{children}</div>
  </div>
);

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-card rounded-2xl shadow-lg p-5 border hover:shadow-2xl transition-shadow">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p
      className={`text-lg font-semibold mt-1 ${
        highlight ? "text-green-2" : "text-primary"
      }`}
    >
      {value}
    </p>
  </div>
);

const BookingCard = ({ booking, onView, onPay }) => (
  <div className="bg-card rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow">
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
      status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

export default DashboardHome;
