import React from "react";
import { motion } from "framer-motion";

const AboutIntro = () => {
  return (
    <section className="relative w-full h-screen snap-start overflow-hidden">

      {/* Background Image */}
      <img
        src="/images/aboutImages/aboutIMG1.png"
        alt="About EasyPG Manager"
        className="w-full h-full object-cover"
      />

      {/* LEFT BLACK GRADIENT SHADE */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* TEXT ON IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.1 }}
        className="absolute inset-0 flex items-center justify-center md:justify-start"
      >
        <div className="px-6 md:px-12 max-w-xl text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 tracking-widest uppercase mb-2 text-base sm:text-lg md:text-xl lg:text-lg"
          >
            About
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-6xl font-bold text-white leading-tight mb-4"
          >
            <span className="italic">EasyPG <br /> Manager</span>
          </motion.h1>

          {/* Extra 2 lines description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-sm sm:text-base md:text-2xl lg:text-base mb-2"
          >
            Simplifying PG management with seamless bookings and tenant tracking.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="text-white/80 text-sm sm:text-base md:text-2xl lg:text-base"
          >
            Manage your PG effortlessly with our intuitive platform.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutIntro;
