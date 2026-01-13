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
  FaUser,
} from "react-icons/fa";

const OwnerSidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.clear();
    closeSidebar();
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="h-full flex flex-col text-primary">
      {/* LOGO */}
      <div
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => {
          closeSidebar();
          navigate("/");
        }}
      >
        <span className="text-2xl font-bold">EasyPG</span>
      </div>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/owner/dashboard"}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-colors
              ${
                isActive
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primarySoft"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="mt-6 text-left px-4 py-2 rounded-lg text-red-500 hover:text-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default OwnerSidebar;
