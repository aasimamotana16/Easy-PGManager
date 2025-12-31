// src/owner/dashboard/layout/index.js
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaBuilding,
  FaUsers,
  FaBook,
  FaMoneyBill,
  FaFileContract,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa";

const OwnerDashboardLayout = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { to: "/owner/dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "/owner/dashboard/pgManagment", label: "My PGs", icon: <FaBuilding /> },
    { to: "/owner/dashboard/tenantManagement", label: "Tenants", icon: <FaUsers /> },
    { to: "/owner/dashboard/oBookings", label: "Bookings", icon: <FaBook /> },
    { to: "/owner/dashboard/totalEarnings", label: "Earnings", icon: <FaMoneyBill /> },
    { to: "/owner/dashboard/oAgreements", label: "Agreements", icon: <FaFileContract /> },
    { to: "/owner/dashboard/oSupport", label: "Support", icon: <FaQuestionCircle /> },
    { to: "/owner/dashboard/profileStatus", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen bg-background.DEFAULT flex relative">
      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed lg:static top-0 left-0 min-h-screen 
          w-[75vw] lg:w-64 bg-white shadow-md
          transform transition-transform duration-300
          z-40
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col justify-between
        `}
      >
        {/* ===== Sidebar Header with Hamburger ===== */}
        <div className="flex items-center gap-4 px-6 py-6">
          <button
            className="lg:hidden text-3xl text-primary"
            onClick={() => setOpen(false)}
          >
            <FaBars />
          </button>
          <span className="text-3xl lg:text-2xl font-bold text-primary">
            EasyPG
          </span>
        </div>

        {/* ===== Menu ===== */}
        <nav className="px-4 flex-1 flex flex-col gap-3">
          {menuItems.map((item, i) => (
            <MenuLink
              key={i}
              to={item.to}
              label={item.label}
              icon={item.icon}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>

        {/* ===== Footer ===== */}
        <div className="px-4 py-6 text-sm text-gray-400">
          © 2025 EasyPG Manager
        </div>
      </aside>

      {/* ===== Overlay / Hamburger (mobile) ===== */}
      {!open && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 text-3xl text-primary"
          onClick={() => setOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};

const MenuLink = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    end
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 px-4 py-3 rounded-lg
       text-base md:text-lg transition-all ${
        isActive
          ? "bg-primary text-white"
          : "text-primary hover:bg-primarySoft"
      }`
    }
  >
    <span className="text-xl">{icon}</span>
    <span className="md:text-3xl lg:text-sm" >{label}</span>
  </NavLink>
);

export default OwnerDashboardLayout;
