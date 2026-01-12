import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import Sidebar from "../../components/sideBar"; // user sidebar
import OwnerSidebar from "../../owner/dashboard/layout"; // owner sidebar
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔹 Check login status
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

  const navLinkClass = (path) =>
    `relative font-semibold text-sm transition-colors duration-300
      ${location.pathname === path ? "text-text-light border-b-2 border-primary" : "text-text-light/80 hover:text-text-light"}`;

  // 🔹 Get user role
  const userRole = localStorage.getItem("userRole"); // "user" or "owner"

  return (
    <>
      <nav className="bg-background-dark border-b border-white/10 px-4 py-2 flex justify-between items-center">
        {/* LEFT: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger only if logged in, not on homepage, and role === user */}
          {isLoggedIn && location.pathname !== "/" && userRole === "user" && (
            <button onClick={() => setSidebarOpen(true)}>
              <FaBars className="text-xl text-text-light" />
            </button>
          )}

          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logos/logo1.png" className="h-10 mr-2" alt="logo" />
            <span className="text-text-light text-xl font-bold hidden sm:block">
              EASYPGMANAGER
            </span>
          </div>
        </div>

        {/* CENTER: Desktop Links */}
        <div className="hidden md:flex gap-5">
          <button className={`${navLinkClass("/")}`} onClick={() => navigate("/")}>
            Home
          </button>
          <button className={`${navLinkClass("/findmypg")}`} onClick={() => navigate("/findmypg")}>
            FindMyPG
          </button>
          {!isLoggedIn && (
            <>
              <button className={`${navLinkClass("/about")}`} onClick={() => navigate("/about")}>
                About
              </button>
              <button className={`${navLinkClass("/services")}`} onClick={() => navigate("/services")}>
                Services
              </button>
              <button className={`${navLinkClass("/contact")}`} onClick={() => navigate("/contact")}>
                Contact
              </button>
              <button className={`${navLinkClass("/faq")}`} onClick={() => navigate("/faq")}>
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
              onClick={() =>
                navigate(
                  userRole === "owner"
                    ? "/owner/dashboard/profileStatus"
                    : "/user/dashboard/userProfile"
                )
              }
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
          {/* User Sidebar */}
          {userRole === "user" && (
            <div className="w-80 bg-background-dark shadow-xl p-6">
              <Sidebar closeSidebar={() => setSidebarOpen(false)} />
            </div>
          )}

          {/* Owner Sidebar */}
          {userRole === "owner" && (
            <div className="w-80 bg-background-dark shadow-xl p-6">
              <OwnerSidebar closeSidebar={() => setSidebarOpen(false)} />
            </div>
          )}

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
