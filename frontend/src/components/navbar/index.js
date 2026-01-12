import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

  /* 🔹 UI-only login check */
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("userName");

    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setUserName(name || "User");
    }
  }, []);

  // Active link class handler
  const navLinkClass = (path) =>
    `font-semibold text-sm md:text-sm lg:text-base transition duration-300
     ${
       location.pathname === path
         ? "text-text-light border-b-2 border-primary"
         : "text-text-light/80 hover:text-text-light hover:border-b-2 hover:border-primary"
     }`;

  return (
    <>
      <nav className="bg-background-dark border-b border-white/10">
        <div className="flex justify-between items-center px-2 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-2.5">

          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logos/logo1.png"
              alt="EasyPG Manager Logo"
              className="h-8 md:h-9 lg:h-10 w-auto mr-2 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="font-bold tracking-wide text-text-light hidden sm:block text-sm md:text-base lg:text-lg">
              EASYPGMANAGER
            </span>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex gap-3 lg:gap-5">
            <Link to="/" className={navLinkClass("/")}>Home</Link>
            <Link to="/about" className={navLinkClass("/about")}>About</Link>
            <Link to="/services" className={navLinkClass("/services")}>Services</Link>
            <Link to="/findmypg" className={navLinkClass("/findmypg")}>FindMyPG</Link>
            <Link to="/contact" className={navLinkClass("/contact")}>Contact</Link>
            <Link to="/faq" className={navLinkClass("/faq")}>FAQ</Link>
          </div>

          {/* RIGHT ACTION AREA */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <CButton size="md" text="Sign Up" onClick={() => navigate("/signup")} />
                <CButton size="md" text="Login" onClick={() => navigate("/login")} />
              </>
            ) : (
              <>
                {/* PROFILE */}
                <div className="flex items-center gap-2 text-text-light">
                  <FaUserCircle className="text-xl" />
                  <span className="hidden sm:block font-medium">
                    {userName}
                  </span>
                </div>

                {/* HAMBURGER */}
                <button onClick={() => setOpenSidebar(true)}>
                  <FaBars className="text-xl text-text-light" />
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* RIGHT SIDEBAR */}
      {openSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="w-72 bg-white h-full shadow-xl p-6">
            <button
              className="text-right w-full mb-6 font-bold"
              onClick={() => setOpenSidebar(false)}
            >
              ✖
            </button>

            <ul className="space-y-4 font-semibold text-gray-800">
              <li onClick={() => navigate("/")}>Home</li>
              <li onClick={() => navigate("/profile")}>My Profile</li>
              <li onClick={() => navigate("/bookings")}>My Bookings</li>
              <li onClick={() => navigate("/payments")}>Payments</li>
              <li
                className="text-red-600 cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("userName");
                  navigate("/");
                  window.location.reload();
                }}
              >
                Logout
              </li>
            </ul>
          </div>

          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpenSidebar(false)}
          />
        </div>
      )}
    </>
  );
};

export default Navbar;
