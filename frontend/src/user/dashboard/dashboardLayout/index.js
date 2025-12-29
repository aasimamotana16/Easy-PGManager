import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const UserDashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-primarySoft">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6 text-xl font-semibold text-primary">
          User Dashboard
        </div>

        <nav className="px-4 space-y-2">
          <MenuLink to="/user/dashboard/home" label="Dashboard" />
          <MenuLink to="/user/dashboard/profile" label="Profile" />
          <MenuLink to="/user/dashboard/payments" label="Payments" />
          <MenuLink to="/user/dashboard/agreements" label="Agreements" />
          <MenuLink to="/user/dashboard/check-ins" label="Check-ins" />
          <MenuLink to="/user/dashboard/documents" label="Documents" />
          <MenuLink to="/user/dashboard/timeline" label="Timeline" />
          <MenuLink to="/user/dashboard/rebook" label="Rebook" />
          <MenuLink to="/user/dashboard/owner-contact" label="Owner Contact" />
          <MenuLink to="/user/dashboard/support" label="Support" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet /> {/* Renders the selected page */}
      </main>
    </div>
  );
};

// MenuLink component for sidebar links
const MenuLink = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
        isActive
          ? "bg-primary text-white font-medium"
          : "text-primary hover:bg-primarySoft"
      }`
    }
  >
    {label}
  </NavLink>
);

export default UserDashboardLayout;
