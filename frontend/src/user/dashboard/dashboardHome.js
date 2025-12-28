import React from "react";

// Mock data for the user
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
      pgName: "Sunrise PG",
      roomNo: "B-101",
      rent: "₹4,500",
      status: "Pending",
      nextDue: "10 Jan 2026",
    },
  ],
};

const DashboardHome = () => {
  const { profile, bookings } = userData;

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold text-primary">Welcome, {profile.name} 👋</h1>
        <p className="text-buttonDEFAULT mt-1">
          Here’s an overview of your PG / Hostel stay
        </p>
      </div>

      {/* User Stats (based on first booking for quick stats) */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="PG Name" value={bookings[0].pgName} />
          <StatCard title="Room No" value={bookings[0].roomNo} />
          <StatCard title="Rent" value={bookings[0].rent} />
          <StatCard title="Status" value={bookings[0].status} />
        </div>
      )}

      {/* Info cards for all bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookings.map((booking, index) => (
          <InfoCard
            key={index}
            title={`Booking ${index + 1}`}
            items={[
              ["PG", booking.pgName],
              ["Room", booking.roomNo],
              ["Status", booking.status],
              ["Rent", booking.rent],
              ["Next Payment Due", booking.nextDue],
            ]}
          />
        ))}
      </div>
    </div>
  );
};

// StatCard remains same
const StatCard = ({ title, value }) => (
  <div className="bg-primarySoft rounded-2xl shadow p-5 border border-border">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p className="text-primary text-lg font-semibold mt-1">{value}</p>
  </div>
);

// InfoCard remains same
const InfoCard = ({ title, items }) => (
  <div className="bg-white rounded-2xl shadow p-6 border border-border">
    <h2 className="text-primaryDark text-lg font-semibold mb-4">{title}</h2>
    <div className="space-y-3 text-sm">
      {items.map(([label, value], i) => (
        <div key={i} className="flex justify-between">
          <span className="text-buttonDEFAULT">{label}</span>
          <span className="text-primary font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardHome;
