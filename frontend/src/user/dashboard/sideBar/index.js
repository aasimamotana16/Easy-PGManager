import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaFileAlt,
  FaPhone,
  FaTimes,
  FaWallet,
  FaHistory
} from "react-icons/fa";

const UserSidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  // Menu items tailored for the Tenant/User
  const menuItems = [
    { to: "/user/dashboard/dashboardHome", label: "Dashboard", icon: <FaHome /> },
    { to: "/user/dashboard/payments", label: "Payments", icon: <FaWallet /> },
    { to: "/user/dashboard/agreements", label: "Agreements", icon: <FaFileAlt /> },
    { to: "/user/dashboard/check-ins", label: "Check-ins", icon: <FaCalendarCheck /> },
    { to: "/user/dashboard/documents", label: "Documents", icon: <FaFileAlt /> },
    { to: "/user/dashboard/timeline", label: "Timeline", icon: <FaHistory /> },
    { to: "/user/dashboard/owner-contact", label: "Owner Contact", icon: <FaPhone /> },
  ];

  const handleLogout = async () => {
    try {
      setIsLogoutSuccessful(true);

      setTimeout(() => {
        localStorage.clear();
        setIsLogoutModalOpen(false);
        setIsLogoutSuccessful(false); 
        navigate("/");
        closeSidebar?.();
        window.dispatchEvent(new Event("storage"));
      }, 1500);

    } catch (error) {
      localStorage.clear();
      setIsLogoutModalOpen(false);
      navigate("/");
    }
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
          h-screen w-2/3 sm:w-1/2 md:w-2/5 lg:w-64
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
              navigate("/user/dashboard/dashboardHome");
              closeSidebar?.();
            }}
          >
            <img
              src="/logos/logo1.png"
              alt="EasyPG"
              className="w-15 h-14 object-contain"
            />
            <div className="leading-tight">
              <div className="text-xl font-semibold">EasyPG</div>
              <div className="text-xl font-semibold text-primary">Manager</div>
            </div>
          </div>

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
                `relative flex items-center gap-4 px-4 py-2.5 rounded-md text-base transition-all duration-300 group
                ${isActive ? "bg-primary text-white" : " text-white"}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="relative">
                {item.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </span>
            </NavLink>
          ))}
        </nav>

        {/* DIVIDER */}
        <div className="border-t border-gray-800 my-4" />

        {/* BOTTOM ACTIONS: HOME & LOGOUT */}
        <div className="flex items-center justify-between px-2 mb-2">
          <button
            onClick={() => {
              navigate("/");
              closeSidebar?.();
            }}
            className="flex items-center gap-2 py-2 text-gray-400 hover:text-white font-semibold transition-colors"
          >
            <FaHome size={16} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="py-2 text-red-500 hover:text-red-600 font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- LOGOUT POPUP --- */}
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
                    No
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
                  >
                    Yes
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