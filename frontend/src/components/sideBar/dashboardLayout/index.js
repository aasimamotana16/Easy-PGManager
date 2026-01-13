import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const UserSidebar = ({ closeSidebar }) => {
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

  const handleClose = () => {
    if (closeSidebar) closeSidebar();
  };

  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="h-full flex flex-col bg-black text-white p-4">
      {/* LOGO */}
      <div
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => {
          handleClose();
          navigate("/");
        }}
      >
        <img src="/logos/logo1.png" alt="Logo" className="h-10" />
        <span className="font-bold text-lg">EASYPG MANAGER</span>
      </div>

      {/* LINKS */}
      <nav className="flex-1 flex flex-col space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/user/dashboard"}
            onClick={handleClose}
            className={({ isActive }) =>
              `
              block px-4 py-2 rounded-md text-sm transition-all
              ${
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "text-white hover:bg-gray-800"
              }
              `
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="mt-6 text-left px-4 py-2 rounded-md text-red-400 hover:bg-gray-800 hover:text-red-500 font-semibold transition"
      >
        Logout
      </button>
    </div>
  );
};

export default UserSidebar;
