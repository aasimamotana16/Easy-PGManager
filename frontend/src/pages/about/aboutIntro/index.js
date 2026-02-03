import React from "react";
import { motion } from "framer-motion";

const AboutIntro = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">

      {/* Background Image */}
      <img
        src="/images/aboutImages/aboutIMG1.png"
        alt="About EasyPG Manager"
        className="w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />

      {/* TEXT WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          absolute inset-0
          flex items-center justify-start
          pt-12 pl-6
        "
      >
        <div className="max-w-xl text-left">

          {/* LABEL */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              text-white/80 uppercase tracking-widest mb-2
              text-3xl
            "
          >
            About
          </motion.p>

          {/* MAIN HEADING */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="
              font-bold text-white leading-tight mb-4
              text-5xl
            "
          >
            <span className="italic">
              EasyPG <br /> Manager
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="
              text-white/90 mb-2
              text-3xl
            "
          >
            Simplifying PG management with seamless bookings and tenant tracking.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="
              text-white/90
              text-3xl
            "
          >
            Manage your PG effortlessly with our intuitive platform.
          </motion.p>

        </div>
      </motion.div>
    </section>
  );
};

export default AboutIntro;
