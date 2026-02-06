import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa"; // Added icons for mobile
import axios from "axios";
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile state

  const role = localStorage.getItem("role");

  const checkLoginStatus = () => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserName(localStorage.getItem("userName") || "User");
  };

  useEffect(() => {
    checkLoginStatus();
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [location.pathname]);

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
    } catch {
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
      <nav className="bg-black border-b border-white/10 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[100]">
        
        {/* LEFT: LOGO */}
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src="/logos/logo1.png" className="h-8 w-auto mr-2" alt="logo" />
          <span className="text-white text-base md:text-base font-medium">
            EasyPG <span className="text-primary">Manager</span>
          </span>
        </div>

        {/* CENTER: NAV LINKS (Hidden on mobile, flex on desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(([path, label]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative py-2 text-sm transition-all duration-300 ${
                location.pathname === path ? "text-orange-500" : "text-white hover:text-primary"
              } group`}
            >
              {label}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-orange-500 transition-all duration-300 ${
                location.pathname === path ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </button>
          ))}
        </div>

        {/* RIGHT: PROFILE & MOBILE TOGGLE */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isLoggedIn ? (
            <div className="hidden sm:flex gap-3">
              <CButton variant="outline"  text="Login" onClick={() => navigate("/login")} />
              <CButton  text="Sign Up" onClick={() => navigate("/signup")} />
            </div>
          ) : (
            <div className="relative">
              <button className="flex items-center gap-2 text-white" onClick={() => setProfileOpen((p) => !p)}>
                <span className="text-sm font-medium hidden md:block">{userName}</span>
                <FaUserCircle size={24} className="text-orange-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl z-[110] overflow-hidden border border-gray-100">
                  <div className="p-3 border-b bg-gray-50">
                    <p className="text-[10px] text-gray-500">Signed in as</p>
                    <p className="text-sm text-gray-900 truncate font-bold">{userName}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={goToDashboard} className="w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left">Dashboard</button>
                    <button onClick={goToProfile} className="w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left">My Profile</button>
                    <button onClick={() => { setProfileOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-sm text-left">Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu Icon (Visible on mobile only) */}
          <button className="lg:hidden text-white p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* MOBILE SIDEBAR MENU */}
        <div className={`fixed inset-0 bg-black z-[90] transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`} style={{ top: '72px' }}>
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map(([path, label]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-xl text-left font-medium ${location.pathname === path ? "text-primary" : "text-white"}`}
              >
                {label}
              </button>
            ))}
            {!isLoggedIn && (
              <div className="flex flex-col gap-4 mt-4">
                <CButton text="Login" onClick={() => navigate("/login")} />
                <CButton text="Sign Up" onClick={() => navigate("/signup")} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* LOGOUT MODAL remains same */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-xl text-gray-900 font-bold">Sign Out?</h3>
                <p className="text-gray-500 mt-2 text-sm">Are you sure you want to end your session?</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
                  <button onClick={handleLogout} className="flex-1 py-3 bg-primary text-white rounded-lg text-sm font-bold">YES</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">✓</div>
                <h3 className="text-xl font-bold">Logged Out</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;