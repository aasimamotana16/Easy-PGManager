import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
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

  // Check login + username
  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
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

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    setProfileOpen(false);
    setSidebarOpen(false);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
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
                    onClick={handleLogout}
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
    </>
  );
};

export default Navbar;
