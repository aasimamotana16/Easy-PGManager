import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const HomeBanner = () => {
  const navigate = useNavigate();

  // AUTH LOGIC
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role")?.toLowerCase(); // Added optional chaining and lowercase for safety
  const isProfileComplete = localStorage.getItem("isProfileComplete") === "true"; 

  return (
    <section className="bg-background overflow-hidden pt-6 sm:pt-0">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left order-2 lg:order-1">
            
            <motion.h1
              /* UPDATED: Uses h1-sm for mobile and h1 for desktop */
              className="text-h1-sm lg:text-h1 leading-tight text-textPrimary"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <span className="text-textPrimary block mb-2">
                Welcome to
              </span>
              EasyPG <span className="text-primary">
                Manager
              </span> 
            </motion.h1>

            <motion.p
              /* UPDATED: Uses body-sm for mobile and body for desktop */
              className="text-body-sm lg:text-body text-textSecondary max-w-xl mx-auto lg:mx-0 leading-relaxed"
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
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              {!isLoggedIn ? (
                <div className="w-full sm:w-auto">
                  <CButton
                    text="Get Started"
                    onClick={() => navigate("/signup")}
                  />
                </div>
              ) : (
                <div className="w-full sm:w-auto">
                  <CButton
                    text="Go to Dashboard"
                    onClick={() => navigate(role === "owner" ? "/owner/dashboard" : "/user/dashboard")}
                  />
                </div>
              )}

              <div className="w-full sm:w-auto">
                <CButton
                  className="font-bold border-2 border-border text-textSecondary hover:bg-gray-50 transition-colors"
                  variant="outlined"
                  onClick={() => navigate("/about")}
                >
                  Learn more →
                </CButton>
              </div>
            </motion.div>

            {/* PROFILE ALERT */}
            {isLoggedIn && !isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 mx-auto lg:mx-0 max-w-xl bg-orange-50 border border-primary/20 rounded-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm"
              >
                <div className="text-center sm:text-left">
                  <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">
                    Profile Incomplete
                  </p>
                  <p className="text-sm text-textSecondary">
                    Finish setting up your account to access all features.
                  </p>
                </div>

                <CButton
                  text="Complete Now"
                  className="whitespace-nowrap"
                  onClick={() => {
                    // Debugging check: console.log("Navigating for role:", role);
                    navigate(role === "owner" ? "/owner/dashboard/profileStatus" : "/user/userProfile");
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[320px] sm:max-w-[500px] lg:max-w-full"
            >
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl opacity-60"></div>
              
              <img
                src="/images/homeImages/img12.png"
                alt="EasyPG Illustration"
                className="w-full h-auto object-contain relative z-10"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;