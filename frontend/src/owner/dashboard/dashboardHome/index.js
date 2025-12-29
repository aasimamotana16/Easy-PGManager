import React from "react";

const stats = [
  { label: "Total PGs", value: 3 },
  { label: "Live Listings", value: 2 },
  { label: "Pending Approvals", value: 1 },
  { label: "Bookings Today", value: 5 },
];

const recentActivity = [
  { title: "New booking request", detail: "Room A-203 • City PG" },
  { title: "Rent received", detail: "₹8,500 • Sunrise PG" },
];

const OwnerDashboardHome = () => {
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-2xl border border-border">
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, Owner 👋
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          Manage your PGs, rooms, tenants, and payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-primarySoft rounded-2xl border border-border p-5">
            <p className="text-sm text-buttonDEFAULT">{item.label}</p>
            <p className="text-2xl font-semibold text-primary mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3 text-sm">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex justify-between border-b border-border pb-2">
              <span className="text-buttonDEFAULT">{item.title}</span>
              <span className="text-primary font-medium">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardHome;
