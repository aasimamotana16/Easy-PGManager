import React from "react";
import { Link } from "react-router-dom";
import CButton from "../cButton";

const Footer = () => {
  return (
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

            <div className="mt-6">
              <CButton>Request a Demo</CButton>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>PG Management</li>
              <li>Hostel Management</li>
              <li>Tenant Records</li>
              <li>Payments</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-primary hover:underline transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary hover:underline transition">
                  Contact
                </Link>
              </li>
              <li>Careers</li>
              <li>News</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-10"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm gap-4">
          <p>© 2025 EasyPG Manager. All rights reserved.</p>

          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer">
              Twitter
            </span>
            <span className="hover:text-primary cursor-pointer">
              LinkedIn
            </span>
            <span className="hover:text-primary cursor-pointer">
              Facebook
            </span>
            <span className="hover:text-primary cursor-pointer">
              Instagram
            </span>
            <span className="hover:text-primary cursor-pointer">
              YouTube
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
