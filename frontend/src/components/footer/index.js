import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import CButton from "../cButton";
import DemoBook from "../../pages/Home/demoBook";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDemo, setOpenDemo] = useState(false);

  // Active link style handler
  const linkClass = (path) =>
    `cursor-pointer hover:text-primary transition ${
      location.pathname === path
        ? "text-primary underline underline-offset-4"
        : ""
    }`;

  return (
    <>
      <footer className="bg-black text-gray-300">
        {/* Full width container */}
        <div className="w-full px-6 py-14">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-36 max-w-7xl mx-auto">

            {/* Brand Info */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                EasyPG Manager
              </h2>

              <p className="text-sm leading-7 mb-4">
                Smart PG & Hostel management platform to simplify bookings,
                payments, tenant records, and daily operations.
              </p>

              <p className="text-sm">
                <span className="font-semibold text-white">Address:</span>
                <br />
                EasyPG Manager Pvt. Ltd.
                <br />
                Gujarat, India
              </p>

              <div className="mt-6">
                <CButton onClick={() => setOpenDemo(true)}>
                  Request a Demo
                </CButton>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li
                  onClick={() => navigate("/about")}
                  className={linkClass("/about")}
                >
                  About Us
                </li>

                <li
                  onClick={() => navigate("/contact")}
                  className={linkClass("/contact")}
                >
                  Contact
                </li>

                <li
                  onClick={() => navigate("/findMypg")}
                  className={linkClass("/findMypg")}
                >
                  FindMyStay
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li
                  onClick={() => navigate("/termsConditions")}
                  className={linkClass("/termsConditions")}
                >
                  Terms & Conditions
                </li>

                <li
                  onClick={() => navigate("/privacyPolicy")}
                  className={linkClass("/privacyPolicy")}
                >
                  Privacy Policy
                </li>
              </ul>
            </div>

            {/* Social Icons */}
            <div>
              <h3 className="text-white font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-5 text-lg">
                <FaTwitter className="hover:text-primary cursor-pointer transition" />
                <FaLinkedin className="hover:text-primary cursor-pointer transition" />
                <FaFacebook className="hover:text-primary cursor-pointer transition" />
                <FaInstagram className="hover:text-primary cursor-pointer transition" />
                <FaYoutube className="hover:text-primary cursor-pointer transition" />
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-10 max-w-7xl mx-auto" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between text-sm gap-4 max-w-7xl mx-auto">
            <p>© 2025 EasyPG Manager. All rights reserved.</p>

            <div className="flex gap-6 text-lg">
              <FaTwitter className="hover:text-primary cursor-pointer" />
              <FaLinkedin className="hover:text-primary cursor-pointer" />
              <FaFacebook className="hover:text-primary cursor-pointer" />
              <FaInstagram className="hover:text-primary cursor-pointer" />
              <FaYoutube className="hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoBook isOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </>
  );
};

export default Footer;
