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
    // ❌ removed overflow-hidden
    <section className="bg-background-default">
      <div className="px-4 sm:px-8 lg:px-14 pt-10 md:pt-20 pb-16 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-5 md:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-primary leading-[1.1] tracking-tight"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Welcome to <span className="text-accent">EasyPG Manager</span>
            </motion.h1>

            <motion.p
              className="text-text-secondary text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
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
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <CButton
                className="
                  w-full sm:w-auto
                  px-6 sm:px-10
                  h-11 sm:h-12 md:h-14
                  text-sm md:text-3xl lg:text-base
                  font-bold
                  shadow-lg
                "
                text="Get Started"
                variant="contained"
                onClick={() => navigate("/signup")}
              />

              <CButton
                className="
                  w-full sm:w-auto
                  px-6 sm:px-10
                  h-11 sm:h-12 md:h-14
                  text-sm md:text-3xl lg:text-base
                  font-bold
                "
                variant="outlined"
                onClick={() => navigate("/about")}
              >
                Learn more →
              </CButton>
            </motion.div>

            {/* PROFILE ALERT */}
            {isLoggedIn && (role === "owner" || role === "user") && !isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 max-w-xl bg-orange-50 border border-orange-200 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="text-center sm:text-left">
                  <p className="text-sm md:text-base font-bold text-orange-800 uppercase tracking-wide">
                    Profile Incomplete
                  </p>
                  <p className="text-xs md:text-sm text-orange-700">
                    Finish setting up your account to access all features.
                  </p>
                </div>

                <button
                  className="w-full sm:w-auto bg-orange-500 text-white px-6 py-2.5 rounded-xl text-xs md:text-sm font-black shadow-md"
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
          <div className="w-full lg:w-2/3 flex justify-center order-1 lg:order-2">
            <motion.img
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              src="/images/homeImages/img12.png"
              alt="EasyPG Illustration"
              className="w-[75%] sm:w-full max-w-[950px] lg:max-w-[750px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
