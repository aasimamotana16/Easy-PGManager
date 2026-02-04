import React from "react";
import { motion } from "framer-motion";

const AboutIntro = () => {
  return (
    <section className="relative w-full h-[50vh] sm:h-[70vh] md:h-screen overflow-hidden">
      {/* Background Image: 
        Using h-full ensures it doesn't grow larger than the parent 50vh on mobile.
      */}
      <img
        src="/images/aboutImages/aboutIMG1.png"
        alt="About EasyPG Manager"
        className="w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />

      {/* TEXT WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          absolute inset-0
          flex items-center justify-start
          pt-4 pl-5 sm:pt-12 sm:pl-10
        "
      >
        <div className="max-w-xl text-left">
          {/* LABEL */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              text-white/80 uppercase tracking-widest mb-1
              text-sm sm:text-2xl
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
               text-white mb-2
               text-2xl sm:text-5xl md:text-6xl font-bold
            "
          >
            <span className="italic">
              EasyPG <br /> Manager
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <div className="space-y-1 sm:space-y-3 max-w-[250px] sm:max-w-full">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="
                text-white/90 
                text-[13px] sm:text-xl md:text-2xl leading-snug
              "
            >
              Simplifying PG management with seamless bookings and tenant tracking.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="
                text-white/90 hidden sm:block
                sm:text-xl md:text-2xl
              "
            >
              Manage your PG effortlessly with our intuitive platform.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutIntro;