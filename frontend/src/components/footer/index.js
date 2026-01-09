import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../cButton";
import DemoBook from "../../pages/Home/demoBook";

const Footer = () => {
  const navigate = useNavigate();
  const [openDemo, setOpenDemo] = useState(false);

  return (
    <>
      <footer className="bg-black text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-14">

          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

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

              {/* Request Demo */}
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
                <li>
                  <span
                    onClick={() => navigate("/about")}
                    className="hover:text-primary hover:underline transition cursor-pointer"
                  >
                    About Us
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate("/contact")}
                    className="hover:text-primary hover:underline transition cursor-pointer"
                  >
                    Contact
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate("/findMypg")}
                    className="hover:text-primary hover:underline transition cursor-pointer"
                  >
                    FindMyStay
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <span
                    onClick={() => navigate("/termsConditions")}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Terms & Conditions
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate("/privacyPolicy")}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-10"></div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between text-sm gap-4">
            <p>© 2025 EasyPG Manager. All rights reserved.</p>

            <div className="flex gap-6">
              <span className="hover:text-primary cursor-pointer">Twitter</span>
              <span className="hover:text-primary cursor-pointer">LinkedIn</span>
              <span className="hover:text-primary cursor-pointer">Facebook</span>
              <span className="hover:text-primary cursor-pointer">Instagram</span>
              <span className="hover:text-primary cursor-pointer">YouTube</span>
            </div>
          </div>

        </div>
      </footer>
      <DemoBook
        isOpen={openDemo}
        onClose={() => setOpenDemo(false)}
      />
    </>
  );
};

export default Footer;
