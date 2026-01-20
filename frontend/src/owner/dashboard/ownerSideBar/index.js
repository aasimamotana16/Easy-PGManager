import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaBook,
  FaMoneyBill,
  FaFileContract,
  FaQuestionCircle,
  FaTimes,
} from "react-icons/fa";

const OwnerSidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  const menuItems = [
    { to: "/owner/dashboard/dashboardHome", label: "Dashboard", icon: <FaHome /> },
    { to: "/owner/dashboard/pgManagment", label: "My PGs", icon: <FaBuilding /> },
    { to: "/owner/dashboard/tenantManagement", label: "Tenants", icon: <FaUsers /> },
    { to: "/owner/dashboard/oBookings", label: "Bookings", icon: <FaBook /> },
    { to: "/owner/dashboard/totalEarnings", label: "Earnings", icon: <FaMoneyBill /> },
    { to: "/owner/dashboard/oAgreements", label: "Agreements", icon: <FaFileContract /> },
    { to: "/owner/dashboard/oSupport", label: "Support", icon: <FaQuestionCircle /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner/login");
    closeSidebar?.();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-1/2 sm:w-1/2 md:w-2/5 lg:w-64
          bg-black text-white
          flex flex-col
          px-4 py-5
          overflow-hidden
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* LOGO / BRAND */}
        <div className="flex items-center justify-between mb-14">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => {
              navigate("/owner/dashboard");
              closeSidebar?.();
            }}
          >
            {/* LOGO IMAGE */}
            <img
              src="/logos/logo1.png"
              alt="EasyPG Manager"
              className="w-15 h-14 object-contain"
            />

            <div className="leading-tight">
              <div className="text-xl font-semibold">EasyPG</div>
              <div className="text-xl font-semibold text-primary">Manager</div>
            </div>
          </div>

          {/* CLOSE ICON (MOBILE ONLY) */}
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={closeSidebar}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm transition-colors
                ${isActive ? "bg-primary text-white" : "hover:bg-gray-800"}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* DIVIDER */}
        <div className="border-t border-gray-800 my-4" />

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-red-500 hover:text-red-600 font-semibold text-left"
        >
          Logout
        </button>
      </aside>
    </>
  );
};

export default OwnerSidebar;
