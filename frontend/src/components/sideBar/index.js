import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();

  const links = [
    { to: "/user/dashboard", label: "Dashboard" },
    { to: "/user/dashboard/payments", label: "Payments" },
    { to: "/user/dashboard/agreements", label: "Agreements" },
    { to: "/user/dashboard/check-ins", label: "Check-ins" },
    { to: "/user/dashboard/documents", label: "Documents" },
    { to: "/user/dashboard/timeline", label: "Timeline" },
    { to: "/user/dashboard/owner-contact", label: "Owner Contact" },
  ];

  const handleLogout = () => {
    // Clear local storage
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");

    // Close sidebar if function exists
    if (closeSidebar) closeSidebar();

    // Redirect to homepage
    navigate("/");
  };

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center mb-14 cursor-pointer px-2"
        onClick={handleLinkClick}
      >
        <img src="/logos/logo1.png" alt="Logo" className="h-10 mr-3" />
        <span className="text-white font-bold text-xl">EASYPG MANAGER</span>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 flex flex-col space-y-2 px-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/user/dashboard"}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition-colors duration-200
               ${isActive ? "border-b-2 border-primary text-white  bg-primary font-medium" : "text-white hover:text-primary hover:border-b-2 hover:border-primary"}`
            }
          >
            {link.label}
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 text-red-500 hover:text-red-600 font-semibold text-left px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
