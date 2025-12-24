import React from "react";
import { Link, useNavigate } from "react-router-dom";
import CButton from "../../components/cButton"; // make sure the path is correct

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background-dark border-b border-white/10">
      <div className="flex justify-between items-center px-2 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-2.5">

        {/* Logo + Text */}
        <div className="flex items-center">
          <img
            src="/logos/logo1.png"
            alt="EasyPG Manager Logo"
            className="h-8 md:h-9 lg:h-10 w-auto mr-2"
          />
          <span className="font-bold tracking-wide text-text-light hidden sm:block text-sm md:text-base lg:text-lg">
            EASYPGMANAGER
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-3 lg:gap-5">
          {["Home", "Services", "About", "Contact", "FAQ"].map((item, index) => (
            <Link
              key={index}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="font-semibold text-text-light/80 text-sm md:text-sm lg:text-base
                         transition duration-300 hover:text-text-light hover:border-b-2 hover:border-primary"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <CButton title="" size="md" text="Sign Up" onClick={() => navigate("/signup")} />
        

          <CButton size="md"  text="Login" onClick={() => navigate("/login")} />
          
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
