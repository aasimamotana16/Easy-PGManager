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
          h-screen w-[280px] max-w-[85vw]
          bg-black text-white
          flex flex-col
          px-4 py-5
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-64
        `}
      >
        {/* LOGO / BRAND */}
        <div className="flex items-center justify-between mb-16 shrink-0">
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
              <div className="text-xl font-medium">EasyPG</div>
              <div className="text-xl font-medium text-primary">Manager</div>
            </div>
          </div>

          <button
            className="lg:hidden text-gray-400 hover:text-white p-2"
            onClick={closeSidebar}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-6 px-4 py-3 rounded-md text-base  transition-colors shrink-0
                ${isActive ? "bg-primary text-white" : "hover:bg-gray-800 text-gray-300 hover:text-white"}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="shrink-0">
          <div className="border-t border-gray-800 my-4" />
          <div className="flex items-center gap-8 pb-2">
            <button
              onClick={() => {
                navigate("/");
                closeSidebar?.();
              }}
              className="p-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Go to Website Home"
            >
              <FaHome size={20} />
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:text-red-400 font-medium text-lg text-left transition-colors"
            >
              <FaSignOutAlt size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- LOGOUT POPUP --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transition-all animate-in zoom-in duration-200">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-medium text-gray-800 text-[#1C1C1C]">Confirm Logout</h3>
                <p className="text-[#4B4B4B] my-4 font-normal">Are you sure you want to end your session?</p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    onClick={() => setIsLogoutModalOpen(false)} 
                    className="order-2 sm:order-1 flex-1 py-3 bg-gray-100 text-[#4B4B4B] rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    No
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="order-1 sm:order-2 flex-1 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-orange-100 hover:bg-[#B45309] transition-all"
                  >
                    Yes
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-[#FEF3C7] text-primary rounded-full flex items-center justify-center text-4xl mb-4 border border-[#E5E0D9]">
                  ✓
                </div>
                <h3 className="text-2xl font-medium text-[#1C1C1C]">Success!</h3>
                <p className="text-[#4B4B4B] mt-2 font-normal">Signed Out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerSidebar;