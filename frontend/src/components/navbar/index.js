import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import CButton from "../../components/cButton";

// Import sidebars
import UserSidebar from "../../user/dashboard/dashboardLayout";
import OwnerSidebar from "../../owner/dashboard/layout";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  // Check login + username
  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const token = localStorage.getItem("userToken"); // Add this check [cite: 2026-01-06]
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserName(name);
  };

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", checkLoginStatus);
    document.addEventListener("visibilitychange", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      document.removeEventListener("visibilitychange", checkLoginStatus);
    };
  }, []);

  // Check if current page is dashboard for hamburger
  const isDashboard =
    location.pathname.startsWith("/user/dashboard") ||
    location.pathname.startsWith("/owner/dashboard");

  const role = localStorage.getItem("role");

 // Updated Logout logic with Modal and Success Check [cite: 2026-01-01]
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("userToken");
      
      // 1. Backend acknowledgment [cite: 2026-01-06]
      if (token) {
        await axios.post("http://localhost:5000/api/users/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // 2. Show success checkmark [cite: 2026-01-01]
      setIsLogoutSuccessful(true);

      // 3. Wait 1.5s, then wipe data and redirect [cite: 2026-01-07]
      setTimeout(() => {
        localStorage.clear();
        setProfileOpen(false);
        setSidebarOpen(false);
        setIsLogoutModalOpen(false);
        setIsLogoutSuccessful(false); 
        navigate("/");
        window.dispatchEvent(new Event("storage"));
      }, 1500);

    } catch (error) {
      // Fallback: Clear and exit [cite: 2026-01-06]
      localStorage.clear();
      setProfileOpen(false);
      navigate("/");
    }
  };

  const navLinkClass = (path) =>
    `relative font-semibold text-sm transition-colors duration-300
     ${
       location.pathname === path
         ? "text-text-light border-b-2 border-primary"
         : "text-text-light/80 hover:text-text-light"
     }`;

  // Navigate and open sidebar automatically for dashboard pages
  const goToDashboard = () => {
    if (role === "owner") {
      navigate("/owner/dashboard/dashboardHome");
    } else {
      navigate("/user/dashboard/dashboardHome");
    }
    setSidebarOpen(true);
  };

  const goToProfile = () => {
    if (role === "owner") {
      navigate("/owner/dashboard/profileStatus");
    } else {
      navigate("/user/dashboard/userProfile");
    }
    setSidebarOpen(true);
  };

  return (
    <>
      <nav className="bg-background-dark border-b border-white/10 px-4 py-2 flex justify-between items-center">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {isLoggedIn && isDashboard && (
            <button onClick={() => setSidebarOpen(true)}>
              <FaBars className="text-xl text-text-light" />
            </button>
          )}

          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logos/logo1.png" className="h-8 mr-2" alt="logo" />
            <span className="text-text-light font-bold hidden sm:block">
              EasyPG Manager
            </span>
          </div>
        </div>

        {/* CENTER (Desktop) */}
        <div className="hidden md:flex gap-5">
          <button className={navLinkClass("/")} onClick={() => navigate("/")}>
            Home
          </button>
          <button
            className={navLinkClass("/about")}
            onClick={() => navigate("/about")}
          >
            About
          </button>
          <button
            className={navLinkClass("/services")}
            onClick={() => navigate("/services")}
          >
            Services
          </button>
          <button
            className={navLinkClass("/findmypg")}
            onClick={() => navigate("/findmypg")}
          >
            FindMyPG
          </button>
          <button
            className={navLinkClass("/contact")}
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>
          <button
            className={navLinkClass("/faq")}
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <CButton text="Sign Up" onClick={() => navigate("/signup")} />
              <CButton text="Login" onClick={() => navigate("/login")} />
            </>
          ) : (
            <>
              <button
                className="flex items-center gap-2 text-text-light"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <FaUserCircle className="text-xl" />
                <span className="hidden sm:block">{userName}</span>
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      goToDashboard();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      goToProfile();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>

                  <button
                  onClick={() => {
                  setProfileOpen(false); // Closes the small menu first [cite: 2026-01-01]
                  setIsLogoutModalOpen(true); // Triggers the "Are you sure?" popup [cite: 2026-01-01]
                    }}
                   className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                   >
                   Logout
                 </button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* SIDEBAR */}
      {sidebarOpen && isLoggedIn && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-background-dark shadow-xl p-6">
            {role === "owner" ? (
              <OwnerSidebar closeSidebar={() => setSidebarOpen(false)} />
            ) : (
              <UserSidebar closeSidebar={() => setSidebarOpen(false)} />
            )}
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}
      {/* --- LOGOUT POPUP WITH SUCCESS CHECKMARK --- */}
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

export default Navbar;
