import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { ArrowLeft } from "lucide-react"; // Matching your previous request
import axios from "axios";
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = localStorage.getItem("role");

  const checkLoginStatus = () => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserName(localStorage.getItem("userName") || "User");
  };

  useEffect(() => {
    checkLoginStatus();
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (token) {
        await axios.post(
          "http://localhost:5000/api/users/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsLogoutSuccessful(true);
      setTimeout(() => {
        localStorage.clear();
        setProfileOpen(false);
        setIsLogoutModalOpen(false);
        setIsLogoutSuccessful(false);
        navigate("/");
        window.dispatchEvent(new Event("storage"));
      }, 1500);
    } catch (error) {
      console.error("Logout failed", error);
      localStorage.clear();
      navigate("/");
    }
  };

  const goToDashboard = () => {
    navigate(role === "owner" ? "/owner/dashboard/dashboardHome" : "/user/dashboard/dashboardHome");
    setProfileOpen(false);
  };

  const goToProfile = () => {
    navigate(role === "owner" ? "/owner/dashboard/profileStatus" : "/user/userProfile");
    setProfileOpen(false);
  };

  const navLinks = [
    ["/", "Home"],
    ["/about", "About"],
    ["/services", "Services"],
    ["/findmypg", "FindMyPG"],
    ["/contact", "Contact"],
    ["/faq", "FAQ"],
  ];

  return (
    <>
      <nav className="bg-[#1F1F1F] border-b border-[#E5E0D9]/10 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[100]">
        
        {/* LEFT: LOGO */}
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src="/logos/logo1.png" className="h-8 w-auto mr-2" alt="logo" />
          <span className="text-white text-base md:text-base font-medium">
            EasyPG <span className="text-[#D97706]">Manager</span>
          </span>
        </div>

        {/* CENTER: NAV LINKS */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(([path, label]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative py-2 text-sm transition-all duration-300 ${
                location.pathname === path ? "text-[#D97706]" : "text-white hover:text-[#D97706]"
              } group`}
            >
              {label}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#D97706] transition-all duration-300 ${
                location.pathname === path ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </button>
          ))}
        </div>

        {/* RIGHT: PROFILE & MOBILE TOGGLE */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isLoggedIn ? (
            <div className="hidden sm:flex gap-3">
              <CButton variant="outline" text="Login" onClick={() => navigate("/loginPage")} />
              <CButton text="Sign Up" onClick={() => navigate("/signup")} />
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button className="flex items-center gap-3 text-white" onClick={() => setProfileOpen((p) => !p)}>
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-[10px] text-[#D97706] uppercase font-bold tracking-widest">
                    {role === "owner" ? "Property Owner" : "Tenant"}
                  </span>
                </div>
                <FaUserCircle size={28} className="text-[#D97706]" />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl z-[110] overflow-hidden border border-[#E5E0D9]">
                  <div className="py-1">
                    <button onClick={goToDashboard} className="w-full px-4 py-2 hover:bg-[#FEF3C7] text-[#1C1C1C] text-sm text-left">Dashboard</button>
                    <button onClick={goToProfile} className="w-full px-4 py-2 hover:bg-[#FEF3C7] text-[#1C1C1C] text-sm text-left">My Profile</button>
                    <button 
                      onClick={() => { setProfileOpen(false); setIsLogoutModalOpen(true); }} 
                      className="w-full px-4 py-2 text-red-600 hover:bg-red-50 text-sm text-left font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="lg:hidden text-white p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* MOBILE SIDEBAR MENU */}
        <div className={`fixed inset-0 bg-[#1F1F1F] z-[90] transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`} style={{ top: '72px' }}>
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map(([path, label]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-xl text-left font-medium ${location.pathname === path ? "text-[#D97706]" : "text-white"}`}
              >
                {label}
              </button>
            ))}
            {!isLoggedIn && (
              <div className="flex flex-col gap-4 mt-4">
                <CButton text="Login" onClick={() => navigate("/loginPage")} />
                <CButton text="Sign Up" onClick={() => navigate("/signup")} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- LOGOUT POPUP (Matched with Sidebar) --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transition-all animate-in zoom-in duration-200">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-bold text-[#1C1C1C]">Confirm Logout</h3>
                <p className="text-[#4B4B4B] my-4 font-medium">
                  Are you sure you want to end your session?
                </p>
                <div className="flex gap-3 mt-6">
                  <CButton 
                    text="No"
                    variant="outline"
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
                <h3 className="text-2xl font-bold text-[#1C1C1C]">Success!</h3>
                <p className="text-[#4B4B4B] mt-2 font-medium">Logged out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;