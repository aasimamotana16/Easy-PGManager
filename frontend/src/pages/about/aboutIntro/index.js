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

      {/* LEFT BLACK GRADIENT SHADE */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* TEXT ON IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.10 }}
        className="absolute inset-0 flex items-center"
      >
        <div className="px-6 md:px-12 max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 tracking-widest uppercase mb-2 text-lg md:text-xl"
          >
            About
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-6xl md:text-7xl font-bold text-white leading-tight"
          >
            <span className="italic">EasyPG <br /> Manager</span>
          </motion.h1>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutIntro;
