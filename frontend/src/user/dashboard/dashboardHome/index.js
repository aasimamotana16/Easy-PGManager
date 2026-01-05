import React, { useState } from "react";

// Mock data (later replace with API)
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

  // Upload Document
  const handleUpload = (index) => {
    const file = prompt(`Upload file for ${documents[index].name} (enter file name)`);
    if (file) {
      const updatedDocs = [...documents];
      updatedDocs[index].uploaded = true;
      setDocuments(updatedDocs);
      alert(`${documents[index].name} uploaded successfully!`);
    }
  };

  // Pay Rent
  const handlePayRent = () => {
    if (activeBooking) alert(`Paid ${activeBooking.rent} for ${activeBooking.pgName}`);
  };

  return (
    <div className="space-y-8 bg-default p-6 rounded-2xl">

      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          Manage your PG stay, payments, and support from one place.
        </p>
      </div>

      {/* Top Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Current Booking */}
        {activeBooking && (
          <DashboardCard title="Current Booking" icon="🏠">
            <p className="font-medium">{activeBooking.pgName}</p>
            <p>Room: {activeBooking.roomNo}</p>
            <p>Status: <StatusBadge status={activeBooking.status} /></p>
          </DashboardCard>
        )}

        {/* Next Payment */}
        {activeBooking && (
          <DashboardCard title="Next Payment" icon="📅">
            <p className="font-medium">{activeBooking.rent}</p>
            <p>Due on {activeBooking.nextDue}</p>
            <button
              className="mt-2 px-4 py-1 bg-orange-500 text-white rounded"
              onClick={handlePayRent}
            >
              Pay Rent
            </button>
          </DashboardCard>
        )}
      </div>

      {/* Quick Stats (Your Original Cards) */}
      {activeBooking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <StatCard title="PG Name" value={activeBooking.pgName} />
          <StatCard title="Room No" value={activeBooking.roomNo} />
          <StatCard title="Monthly Rent" value={activeBooking.rent} />
          <StatCard title="Status" value={activeBooking.status} highlight />
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-primarySoft p-6 rounded-2xl border border-border mt-6">
        <h2 className="text-lg font-semibold text-primaryDark mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton label="Pay Rent" />
          <ActionButton label="View Agreement" />
          <ActionButton label="Upload Documents" />
          <ActionButton label="Contact Support" />
        </div>
      </div>

      {/* All Bookings */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-primaryDark mb-4">
          Your Bookings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking, index) => (
            <BookingCard key={index} booking={booking} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Reusable Components ---------- */

const DashboardCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow p-5 border flex flex-col gap-2">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span>{icon}</span>
      {title}
    </div>
    <div className="mt-2 text-sm">{children}</div>
  </div>
);

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white rounded-2xl shadow p-5 border border-border">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p
      className={`text-lg font-semibold mt-1 ${highlight ? "text-green-600" : "text-primary"}`}
    >
      {value}
    </p>
  </div>
);

const ActionButton = ({ label }) => (
  <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm hover:opacity-90 transition">
    {label}
  </button>
);

const BookingCard = ({ booking }) => (
  <div className="bg-white rounded-2xl shadow p-6 border border-border">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-primaryDark font-semibold text-lg">{booking.pgName}</h3>
      <StatusBadge status={booking.status} />
    </div>

    <div className="space-y-3 text-sm">
      <InfoRow label="Room No" value={booking.roomNo} />
      <InfoRow label="Monthly Rent" value={booking.rent} />
      <InfoRow label="Next Due Date" value={booking.nextDue} />
    </div>

    <div className="mt-5 flex gap-3">
      <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm">
        View Details
      </button>
      <button className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm">
        Pay Rent
      </button>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-buttonDEFAULT">{label}</span>
    <span className="text-primary font-medium">{value}</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {status}
  </span>
);

export default DashboardHome;
