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

      {/* DARK GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* TEXT WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          absolute inset-0
          flex items-start justify-center
          pt-24
          md:pt-0 md:items-center md:justify-start
        "
      >
        <div className="px-6 md:px-12 max-w-xl text-center md:text-left">

          {/* SMALL LABEL */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              text-white/80 tracking-widest uppercase mb-3
              text-sm sm:text-xl
              md:text-4xl lg:text-3xl
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
              font-bold text-white leading-tight mb-5
              text-5xl sm:text-6xl
              md:text-8xl lg:text-6xl
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
              text-white/90 mb-3
              text-base sm:text-lg
              md:text-4xl lg:text-base
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
              text-base sm:text-lg
              md:text-4xl lg:text-base
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
