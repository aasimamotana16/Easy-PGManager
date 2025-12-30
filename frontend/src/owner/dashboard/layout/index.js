// src/owner/dashboard/layout/index.js
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const OwnerDashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background.DEFAULT">
      {/* Sidebar */}
      <aside className="w-64 bg-primarySoft border-r border-border hidden md:block">
        <div className="p-6 text-xl font-semibold text-primary">
          Owner Dashboard
        </div>

        <nav className="px-4 space-y-2">
          <MenuLink to="/owner/dashboard" label="Dashboard" />
          <MenuLink to="/owner/dashboard/pgManagment" label="My PGs" />
          <MenuLink to="/owner/dashboard/tenantManagement" label="Tenants" />
          <MenuLink to="/owner/dashboard/oBookings" label="Bookings" />
          <MenuLink to="/owner/dashboard/totalEarnings" label="Earnings" />
          <MenuLink to="/owner/dashboard/oAgreements" label="Agreements" />
          <MenuLink to="/owner/dashboard/oSupport" label="Support" />
          <MenuLink to="/owner/dashboard/profileStatus" label="Profile" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

const MenuLink = ({ to, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `block px-4 py-2 rounded-lg text-sm transition ${
        isActive
          ? "bg-primary text-white"
          : "text-primary hover:bg-primarySoft"
      }`
    }
  >
    {label}
  </NavLink>
);

export default OwnerDashboardLayout;
