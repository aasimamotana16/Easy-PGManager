import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active link class handler
  const navLinkClass = (path) =>
    `font-semibold text-sm md:text-sm lg:text-base transition duration-300
     ${
       location.pathname === path
         ? "text-text-light border-b-2 border-primary"
         : "text-text-light/80 hover:text-text-light hover:border-b-2 hover:border-primary"
     }`;

  return (
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
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>

          <Link to="/about" className={navLinkClass("/about")}>
            About
          </Link>

          <Link to="/services" className={navLinkClass("/services")}>
            Services
          </Link>

          <Link to="/findmypg" className={navLinkClass("/findmypg")}>
            FindMyPG
          </Link>

          <Link to="/contact" className={navLinkClass("/contact")}>
            Contact
          </Link>

          <Link to="/faq" className={navLinkClass("/faq")}>
            FAQ
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <CButton
            size="md"
            text="Sign Up"
            onClick={() => navigate("/signup")}
          />

          <CButton
            size="md"
            text="Login"
            onClick={() => navigate("/login")}
          />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
