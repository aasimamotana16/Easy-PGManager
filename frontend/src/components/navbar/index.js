import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import CButton from "../../components/cButton";
import Sidebar from "../../components/sideBar"; // single sidebar component

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔹 CENTRAL LOGIN CHECK */
  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("userName");

    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setUserName(name || "User");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  };

  /* 🔹 Run on load + route change */
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  /* 🔹 Detect login/logout from other tabs */
  useEffect(() => {
    window.addEventListener("storage", checkLoginStatus);
    document.addEventListener("visibilitychange", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      document.removeEventListener("visibilitychange", checkLoginStatus);
    };
  }, []);

  /* 🔹 Navbar link class */
  const navLinkClass = (path) =>
    `relative font-semibold text-sm transition-colors duration-300
      ${location.pathname === path ? "text-text-light border-b-2 border-primary" : "text-text-light/80 hover:text-text-light"}`;

  return (
    <>
      <nav className="bg-background-dark border-b border-white/10 px-4 py-2 flex justify-between items-center">
        {/* LEFT: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {isLoggedIn && (
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
              EASYPGMANAGER
            </span>
          </div>
        </div>

        {/* CENTER: Desktop Links */}
        <div className="hidden md:flex gap-5">
          {/* Always show Home */}
          <button
            className={`${navLinkClass("/")}`}
            onClick={() => navigate("/")}
          >
            Home
          </button>

          {/* Show FindMyPG always if logged in */}
          <button
            className={`${navLinkClass("/findmypg")}`}
            onClick={() => navigate("/findmypg")}
          >
            FindMyPG
          </button>

          {/* Show other links only if NOT logged in */}
          {!isLoggedIn && (
            <>
              <button
                className={`${navLinkClass("/about")}`}
                onClick={() => navigate("/about")}
              >
                About
              </button>
              <button
                className={`${navLinkClass("/services")}`}
                onClick={() => navigate("/services")}
              >
                Services
              </button>
              <button
                className={`${navLinkClass("/contact")}`}
                onClick={() => navigate("/contact")}
              >
                Contact
              </button>
              <button
                className={`${navLinkClass("/faq")}`}
                onClick={() => navigate("/faq")}
              >
                FAQ
              </button>
            </>
          )}
        </div>

        {/* RIGHT: Login/Profile */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <CButton text="Sign Up" onClick={() => navigate("/signup")} />
              <CButton text="Login" onClick={() => navigate("/login")} />
            </>
          ) : (
            <button
              className="flex items-center gap-2 text-text-light"
              onClick={() => navigate("/user/dashboard/userProfile")}
            >
              <FaUserCircle className="text-xl" />
              <span className="hidden sm:block">{userName}</span>
            </button>
          )}
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && isLoggedIn && (
        <div className="fixed inset-0 z-50 flex">
          {/* Sidebar content */}
          <div className="w-80 bg-background-dark shadow-xl p-6">
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </div>

          {/* Backdrop */}
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
