import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBook,
  FaCalendarCheck,
  FaFileAlt,
  FaPhone,
} from "react-icons/fa";

const UserSidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu links
  const menuItems = [
    { to: "/user/dashboard/dashboardHome", label: "Dashboard", icon: <FaHome /> },
    { to: "/user/dashboard/payments", label: "Payments", icon: <FaBook /> },
    { to: "/user/dashboard/agreements", label: "Agreements", icon: <FaFileAlt /> },
    { to: "/user/dashboard/check-ins", label: "Check-ins", icon: <FaCalendarCheck /> },
    { to: "/user/dashboard/documents", label: "Documents", icon: <FaFileAlt /> },
    { to: "/user/dashboard/timeline", label: "Timeline", icon: <FaBook /> },
    { to: "/user/dashboard/owner-contact", label: "Owner Contact", icon: <FaPhone /> },
    { to: "/user/dashboard/userProfile", label: "Profile", icon: <FaUser /> },
  ];

  // Handle navigation click
  const handleNavClick = (to) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(to);
    if (closeSidebar) closeSidebar();
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    if (closeSidebar) closeSidebar();
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="h-full flex flex-col bg-black text-white p-4">
      {/* LOGO */}
      <div
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => handleNavClick("/user/dashboard/dashboardHome")}
      >
        <span className="text-2xl font-bold">EasyPG</span>
      </div>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm w-full transition-colors
                ${isActive ? "bg-primary text-white" : "text-white hover:bg-gray-800"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
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

export default UserSidebar;
