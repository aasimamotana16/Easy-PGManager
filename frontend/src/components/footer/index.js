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
    `cursor-pointer hover:text-primary transition-all duration-300 ${
      location.pathname === path
        ? "text-primary underline underline-offset-4"
        : ""
    }`;

  // Social Link Helper Component to keep code clean
  const SocialLink = ({ href, icon: Icon, label }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="hover:text-primary transition-colors duration-300 cursor-pointer"
    >
      <Icon />
    </a>
  );

  return (
    <>
      <footer className="bg-black text-textLight border-t border-white/10">
        {/* Full width container */}
        <div className="w-full px-6 py-14">
          
          {/* Responsive Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">

            {/* Brand Info */}
            <div className="flex flex-col items-start">
              <div 
                className="flex items-center mb-4 cursor-pointer" 
                onClick={() => navigate("/")}
              >
                <img src="/logos/logo1.png" className="h-8 w-auto mr-2" alt="logo" />
                <span className="text-white text-lg font-medium">
                  EasyPG <span className="text-primary">Manager</span>
                </span>
              </div>

              <p className="text-sm leading-7 mb-4 text-white">
                Smart PG management platform to simplify bookings,
                payments, tenant records, and daily operations.
              </p>

              <div className="text-sm  space-y-1">
                <p><span className="font-semibold text-white">Address:</span></p>
                <p className="text-white">EasyPG Manager Pvt. Ltd.</p>
                <p className="text-white">Gujarat, India</p>
              </div>

              <div className="mt-6">
                <CButton onClick={() => setOpenDemo(true)}>
                  Request a Demo
                </CButton>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li onClick={() => navigate("/about")} className={linkClass("/about")}>About Us</li>
                <li onClick={() => navigate("/contact")} className={linkClass("/contact")}>Contact</li>
                <li onClick={() => navigate("/findMypg")} className={linkClass("/findMypg")}>FindMyStay</li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li onClick={() => navigate("/termsConditions")} className={linkClass("/termsConditions")}>
                  Terms & Conditions
                </li>
                <li onClick={() => navigate("/privacyPolicy")} className={linkClass("/privacyPolicy")}>
                  Privacy Policy
                </li>
              </ul>
            </div>

            {/* Social Icons Section (Main for Mobile/Tablet) */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Follow Us</h3>
              <div className="flex gap-5 text-2xl">
                <SocialLink href="#" icon={FaTwitter} label="Twitter" />
                <SocialLink href="#" icon={FaLinkedin} label="LinkedIn" />
                <SocialLink href="#" icon={FaFacebook} label="Facebook" />
                <SocialLink href="#" icon={FaInstagram} label="Instagram" />
                <SocialLink href="#" icon={FaYoutube} label="YouTube" />
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-10 max-w-7xl mx-auto" />

          {/* Bottom Bar */}
          <div className="flex items-center justify-center text-sm p-4 max-w-7xl mx-auto">
  <p className="text-center text-textLight">
    © 2025 EasyPG Manager. All rights reserved.
  </p>
</div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoBook isOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </>
  );
};

export default Footer;