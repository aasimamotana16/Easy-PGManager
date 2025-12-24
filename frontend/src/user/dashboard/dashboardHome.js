import React from "react";

const DashboardHome = () => {
  const booking = {
    pgName: "Shree Residency PG",
    roomNo: "A-203",
    rent: "₹8,500",
    status: "Active",
    nextDue: "05 Jan 2026",
  };

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold text-primary">Welcome 👋</h1>
        <p className="text-buttonDEFAULT mt-1">
          Here’s an overview of your PG / Hostel stay
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="PG Name" value={booking.pgName} />
        <StatCard title="Room No" value={booking.roomNo} />
        <StatCard title="Rent" value={booking.rent} />
        <StatCard title="Status" value={booking.status} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard
          title="Current Booking"
          items={[
            ["PG", booking.pgName],
            ["Room", booking.roomNo],
            ["Status", booking.status],
          ]}
        />

        <InfoCard
          title="Next Payment"
          items={[
            ["Amount", booking.rent],
            ["Due Date", booking.nextDue],
            ["Payment", "Pending"],
          ]}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-primarySoft rounded-2xl shadow p-5 border border-border">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p className="text-primary text-lg font-semibold mt-1">{value}</p>
  </div>
);

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
