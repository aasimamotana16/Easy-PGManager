import React from "react";
import { motion } from "framer-motion";
import { aboutWhyChooseUs } from "../../../config/staticData";

const AboutWhyChooseUs = () => {
  return (
    <section className="py-12 px-6 sm:px-12 md:px-16 lg:px-24 snap-start">
      <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-4xl font-semibold text-primary mb-6 text-center md:text-left">
        Why Choose Us
      </h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-text-secondary leading-relaxed text-sm sm:text-base md:text-2xl lg:text-md"
      >
        {aboutWhyChooseUs}
      </motion.p>
    </section>
  );
};

export default AboutWhyChooseUs;
