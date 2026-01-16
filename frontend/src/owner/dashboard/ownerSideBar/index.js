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
} from "react-icons/fa";

const OwnerSidebar = ({ closeSidebar }) => {
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
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className="h-full w-64 bg-black text-white flex flex-col p-4">
      
      {/* LOGO */}
      <div
        className="text-2xl font-bold mb-10 cursor-pointer"
        onClick={() => navigate("/owner/dashboard")}
      >
        EasyPG
      </div>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-colors
              ${isActive ? "bg-primary text-white" : "hover:bg-gray-800"}`
            }
            onClick={closeSidebar}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 rounded-lg text-red-500 hover:text-red-600 font-semibold text-left"
      >
        Logout
      </button>
    </aside>
  );
};

export default OwnerSidebar;
