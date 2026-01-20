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

  // ✅ AUTH + ROLE CHECK
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role"); // "owner" | "user" | null

  // ⚠️ TEMP FLAG (replace later with backend value)
  const isProfileComplete = false;

  return (
    <section className="bg-background-default">
      <div className="px-4 md:px-8 lg:px-14 pt-16 md:pt-20 pb-28 md:pb-32">
        <div className="flex flex-col md:flex-row items-center gap-14">

          {/* LEFT CONTENT */}
          <div className="md:w-1/2 space-y-6">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Welcome to <span className="text-accent">EasyPG Manager</span>
            </motion.h1>

            <motion.p
              className="text-text-secondary text-base sm:text-lg max-w-xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Hassle-free PG Management System for Owners and Tenants.
              Manage check-ins, payments, maintenance, and more—all in one platform.
            </motion.p>

            <motion.div
              className="flex items-center gap-4 pt-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <CButton
                text="Get Started"
                variant="contained"
                size="lg"
                onClick={() => (window.location.href = "/signup")}
              />

              <CButton
                variant="outlined"
                size="md"
                onClick={() => (window.location.href = "/about")}
              >
                Learn more →
              </CButton>
            </motion.div>

            {/* ✅ SOFT PROFILE COMPLETION INFO (PROFESSIONAL) */}
            {isLoggedIn &&
              (role === "owner" || role === "user") &&
              !isProfileComplete && (
                <div className="mt-6 max-w-xl bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Complete your profile
                    </p>
                    <p className="text-xs text-orange-700">
                      Finish setting up your account to access all features.
                    </p>
                  </div>

                  <CButton
                    className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm"
                    onClick={() =>
                      role === "owner"
                        ? navigate("/owner/dashboard/profileStatus")
                        : navigate("/user/dashboard/userProfile")
                    }
                  >
                    Complete Profile
                  </CButton>
                </div>
              )}
          </div>

          {/* RIGHT IMAGE */}
          <div className="md:w-full flex justify-center">
            <img
              src="/images/homeImages/img12.png"
              alt="EasyPG Illustration"
              className="w-full max-w-[680px] md:max-w-[700px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
