import React from "react";

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
  ],
};

const DashboardHome = () => {
  const { profile, bookings } = userData;

  const activeBooking = bookings.find((b) => b.status === "Active");

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          Manage your PG stay, payments, nd support from one place.
        </p>
      </div>

      {/* Quick Stats */}
      {activeBooking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="PG Name" value={activeBooking.pgName} />
          <StatCard title="Room No" value={activeBooking.roomNo} />
          <StatCard title="Monthly Rent" value={activeBooking.rent} />
          <StatCard
            title="Status"
            value={activeBooking.status}
            highlight
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-primarySoft p-6 rounded-2xl border border-border">
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
      <div>
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

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white rounded-2xl shadow p-5 border border-border">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p
      className={`text-lg font-semibold mt-1 ${
        highlight ? "text-green-600" : "text-primary"
      }`}
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
      <h3 className="text-primaryDark font-semibold text-lg">
        {booking.pgName}
      </h3>
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
      status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {status}
  </span>
);

export default DashboardHome;
