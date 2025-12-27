// src/pages/Home/homeBanner/index.js
import React from "react";
import { motion } from "framer-motion";
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
  return (
    <section className="bg-background-default">
      {/* Extra bottom space added here */}
      <div className="px-4 md:px-8 lg:px-14 pt-16 md:pt-20 pb-28 md:pb-32">
        <div className="flex flex-col md:flex-row items-center gap-14">

          {/* LEFT CONTENT (ONLY TEXT ANIMATION) */}
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
              Hassle-free Hostel & PG Management System for Owners and Tenants.
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
          </div>

          {/* RIGHT IMAGE (NO ANIMATION, BIGGER SIZE) */}
          <div className="md:w-1/2 flex justify-center">
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
