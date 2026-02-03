import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaTimes } from "react-icons/fa";
import axios from "axios";
import CButton from "../../components/cButton";

import UserSidebar from "../../user/dashboard/dashboardLayout";
import OwnerSidebar from "../../owner/dashboard/layout";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  const role = localStorage.getItem("role");

  const checkLoginStatus = () => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserName(localStorage.getItem("userName") || "User");
  };

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const isDashboard =
    location.pathname.startsWith("/user/dashboard") ||
    location.pathname.startsWith("/owner/dashboard");
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
        setSidebarOpen(false);
        setMobileMenuOpen(false);
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

  const navLinkClass = (path) =>
    `relative font-medium text-sm transition-colors
     ${
       location.pathname === path
         ? "text-white border-b-2 border-primary"
         : "text-text-light/80 hover:text-text-light"
     }`;

  const goToDashboard = () => {
    navigate(
      role === "owner"
        ? "/owner/dashboard/dashboardHome"
        : "/user/dashboard/dashboardHome"
    );
    setSidebarOpen(true);
  };

  const goToProfile = () => {
    navigate(
      role === "owner"
        ? "/owner/profileStatus"
        : "/user/userProfile"
    );
    setSidebarOpen(true);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-background-dark border-b border-white/10 px-4 py-3 flex justify-between items-center">
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
            <img src="/logos/logo1.png" className="h-12 mr-2" alt="logo" />
            <span className="text-text-light font-bold text-lg hidden sm:block">
              EasyPG Manager
            </span>
          </div>
        </div>

        {/* CENTER (DESKTOP) */}
        <div className="hidden md:flex gap-5">
          {[
            ["/", "Home"],
            ["/about", "About"],
            ["/services", "Services"],
            ["/findmypg", "FindMyPG"],
            ["/contact", "Contact"],
            ["/faq", "FAQ"],
          ].map(([path, label]) => (
            <button
              key={path}
              className={navLinkClass(path)}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-text-light"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars className="text-xl" />
          </button>

          {/* DESKTOP AUTH */}
          {!isLoggedIn ? (
            <div className="hidden md:flex gap-2">
              <CButton className="h-9 text-lg" text="Sign Up" onClick={() => navigate("/signup")} />
              <CButton className="h-9 text-lg" text="Login" onClick={() => navigate("/login")} />
            </div>
          ) : (
            <div className="relative hidden md:block">
              <button
                className="flex items-center gap-2 text-text-light text-sm"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <FaUserCircle className="text-lg" />
                <span>{userName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-9 w-44 bg-white rounded-md shadow-lg z-50 text-sm">
                  <button onClick={goToDashboard} className="w-full px-4 py-2 hover:bg-gray-100 text-left">
                    Dashboard
                  </button>
                  <button onClick={goToProfile} className="w-full px-4 py-2 hover:bg-gray-100 text-left">
                    Profile
                  </button>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="bg-background-dark w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-text-light font-bold text-base">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <FaTimes className="text-text-light text-xl" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                ["/", "Home"],
                ["/about", "About"],
                ["/services", "Services"],
                ["/findmypg", "FindMyPG"],
                ["/contact", "Contact"],
                ["/faq", "FAQ"],
              ].map(([path, label]) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setMobileMenuOpen(false);
                  }}
                  className="text-text-light text-left font-medium text-xl py-2"
                >
                  {label}
                </button>
              ))}

              {!isLoggedIn ? (
                <>
                  <CButton className="h-12 text-lg font-bold" text="Sign Up" onClick={() => navigate("/signup")} />
                  <CButton className="h-12 text-lg font-bold" text="Login" onClick={() => navigate("/login")} />
                </>
              ) : (
                <>
                  <button onClick={goToDashboard} className="text-text-light font-medium text-base py-2">
                    Dashboard
                  </button>
                  <button onClick={goToProfile} className="text-text-light font-medium text-base py-2">
                    Profile
                  </button>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="text-red-400 font-medium text-base py-2"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (UNCHANGED) */}
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

      {/* LOGOUT MODAL (UNCHANGED) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-gray-500 my-4 font-medium">
                  Are you sure you want to end your session?
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
                  >
                    No, Stay
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold"
                  >
                    Yes, Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold">Success!</h3>
                <p className="text-gray-500 mt-2">Logged out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
