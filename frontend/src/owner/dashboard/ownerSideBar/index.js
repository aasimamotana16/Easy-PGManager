import React, { useState } from "react";
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
  FaSignOutAlt,
} from "react-icons/fa";
import CButton from "../../../components/cButton";

const OwnerSidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  const menuItems = [
    { to: "/owner/dashboard/dashboardHome", label: "Dashboard", icon: <FaHome /> },
    { to: "/owner/dashboard/pgManagment", label: "My PGs", icon: <FaBuilding /> },
    { to: "/owner/dashboard/tenantManagement", label: "Tenants", icon: <FaUsers /> },
    { to: "/owner/dashboard/oBookings", label: "Bookings", icon: <FaBook /> },
    { to: "/owner/dashboard/totalEarnings", label: "Earnings", icon: <FaMoneyBill /> },
    { to: "/owner/dashboard/oAgreements", label: "Agreements", icon: <FaFileContract /> },
    { to: "/owner/dashboard/oSupport", label: "Support", icon: <FaQuestionCircle /> },
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
              navigate("/owner/dashboard");
              closeSidebar?.();
            }}
          >
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

        {/* BOTTOM ACTIONS */}
        <div className="border-t border-gray-800 my-4" />

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transition-all animate-in zoom-in duration-200">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-black my-4 font-medium">Are you sure you want to end your session?</p>
                <div className="flex gap-3 mt-6">
                  <CButton 
                    text="No"
                    variant="outlined"
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1"
                  />
                  <CButton 
                    text="Yes"
                    onClick={handleLogout}
                    className="flex-1"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4 border-2 border-green-200">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Success!</h3>
                <p className="text-white mt-2 font-medium">Logged out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerSidebar;