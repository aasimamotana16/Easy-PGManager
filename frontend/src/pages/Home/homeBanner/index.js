// src/pages/Home/homeBanner/index.js
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7, ease: "easeOut" },
  }),
};

const HomeBanner = () => {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");
  const isProfileComplete = false;

  return (
    <section className="bg-background-default overflow-hidden">
      {/* Adjusted padding: smaller on mobile (py-10), larger on desktop (py-24) */}
      <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left order-2 lg:order-1">
            
            <motion.h1
              className="text-5xl font-bold leading-tight" 
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="text-primary block mb-1 sm:mb-2">
                Welcome to
              </span>
              <span className="text-accent">
                EasyPG Manager
              </span>
            </motion.h1>

            <motion.p
              className="text-2xl  text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Hassle-free PG Management System for Owners and Tenants.
              Manage check-ins, payments, and maintenance—all in one platform.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              {/* Added w-full sm:w-auto to ensure buttons look good on small screens */}
              <div className="w-full sm:w-auto">
                <CButton
                  className="w-full px-8 h-12 text-lg shadow-lg"
                  text="Get Started"
                  variant="contained"
                  onClick={() => navigate("/signup")}
                />
              </div>

              <div className="w-full sm:w-auto">
                <CButton
                  className="w-full px-8 h-12 text-lg"
                  variant="outlined"
                  onClick={() => navigate("/about")}
                >
                  Learn more →
                </CButton>
              </div>
            </motion.div>

            {/* PROFILE ALERT */}
            {isLoggedIn && (role === "owner" || role === "user") && !isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 mx-auto lg:mx-0 max-w-xl bg-orange-50 border border-orange-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="text-center sm:text-left">
                  <p className="text-base font-bold text-black uppercase  mb-1">
                    Profile Incomplete
                  </p>
                  <p className="text-base text-primary">
                    Finish setting up your account to access all features.
                  </p>
                </div>

                <button
                  className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-md text-base active:scale-95 transition-transform"
                  onClick={() =>
                    role === "owner"
                      ? navigate("/owner/dashboard/profileStatus")
                      : navigate("/user/dashboard/userProfile")
                  }
                >
                  Complete Profile
                </button>
              </motion.div>
            )}
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
            <motion.img
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              src="/images/homeImages/img12.png"
              alt="EasyPG Illustration"
              // Optimized image sizing for mobile (larger width on mobile to see detail)
              className="w-full max-w-[320px] sm:max-w-[650px] lg:max-w-full h-auto object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;