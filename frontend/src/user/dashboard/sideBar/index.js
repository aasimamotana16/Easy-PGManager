import React, { useState } from "react";
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  // Menu links
  const menuItems = [
    { to: "/user/dashboard/dashboardHome", label: "Dashboard", icon: <FaHome /> },
    { to: "/user/dashboard/payments", label: "Payments", icon: <FaBook /> },
    { to: "/user/dashboard/agreements", label: "Agreements", icon: <FaFileAlt /> },
    { to: "/user/dashboard/check-ins", label: "Check-ins", icon: <FaCalendarCheck /> },
    { to: "/user/dashboard/documents", label: "Documents", icon: <FaFileAlt /> },
    { to: "/user/dashboard/timeline", label: "Timeline", icon: <FaBook /> },
    { to: "/user/dashboard/owner-contact", label: "Owner Contact", icon: <FaPhone /> },
  ];

  // Navigate to a route
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
  const handleLogout = async () => {
    try {
      // Show success checkmark
      setIsLogoutSuccessful(true);

      // Wait 1.5s, then wipe data and redirect
      setTimeout(() => {
        localStorage.clear();
        setIsLogoutModalOpen(false);
        setIsLogoutSuccessful(false); 
        navigate("/");
        closeSidebar?.();
        window.dispatchEvent(new Event("storage"));
      }, 1500);

    } catch (error) {
      // Fallback: Clear and exit
      localStorage.clear();
      setIsLogoutModalOpen(false);
      navigate("/");
    }
  };

  // Check if menu item is active
  const isActive = (to) => {
    if (to === "/user/dashboard") {
      return location.pathname === "/user/dashboard";
    }
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-black text-white w-64">
        {/* LOGO */}
        <div
          className="flex items-center gap-3 p-4 text-2xl font-bold cursor-pointer"
          onClick={() => handleNavClick("/user/dashboard")}
        >
          EasyPG Manager 
        </div>

        {/* MENU */}
        <nav className="flex-1 flex flex-col gap-2 p-2">
          {menuItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full transition-colors
                ${isActive(item.to) ? "bg-primary text-white" : "hover:bg-gray-800"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="mt-6 text-left px-4 py-2 rounded-lg text-red-500 hover:text-red-600 font-semibold"
        >
          Logout
        </button>
      </div>

      {/* --- LOGOUT POPUP WITH SUCCESS CHECKMARK (MATCHES NAVBAR & OWNER) --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transition-all animate-in zoom-in duration-200">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-gray-500 my-4 font-medium">Are you sure you want to end your session?</p>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setIsLogoutModalOpen(false)} 
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    No, Stay
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
                  >
                    Yes, Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4 border-2 border-green-200">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Success!</h3>
                <p className="text-gray-500 mt-2 font-medium">Logged out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;
