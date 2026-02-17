import React from "react";
import { motion } from "framer-motion";

const AboutIntro = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center">
      
      {/* Background Image Container */}
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="/images/aboutImages/aboutIMG1.png"
        alt="About EasyPG Manager"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-20" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-30 w-full px-6 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-left"
        >
          {/* LABEL - Uses Primary Theme Color */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary uppercase tracking-[0.3em] font-bold mb-4 text-sm sm:text-xl"
          >
            Since 2025
          </motion.p>

          {/* MAIN HEADING - Responsive Text Scaling */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-textLight mb-6 text-4xl sm:text-6xl lg:text-8xl font-extrabold leading-[1.1]"
          >
            Redefining <br />
            <span className="text-primary italic">PG Management</span>
          </motion.h1>

          {/* DESCRIPTION SPACE */}
          <div className="space-y-6 max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              /* Responsive Body Text */
              className="text-textLight text-body-sm sm:text-2xl leading-relaxed opacity-90"
            >
              We bridge the gap between PG owners and tenants through an 
              <span className="font-semibold text-textLight"> intuitive, all-in-one digital dashboard.</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              /* Border-primary used as an accent */
              className="text-textLight opacity-70 text-body-sm sm:text-xl border-l-4 border-primary pl-6"
            >
              Our mission is to simplify bookings, automate payments, and provide 
              real-time tracking for every property.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutIntro;
