import React from "react";
import { motion } from "framer-motion";
import { aboutWhyChooseUs } from "../../../config/staticData";

const AboutWhyChooseUs = () => {
  return (
    <section className="py-12 px-6 snap-start">
      
      {/* Section Heading */}
      <h2 className="text-4xl font-semibold text-primary mb-6 text-left">
        Why Choose Us
      </h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-text-secondary leading-relaxed text-2xl"
      >
        {aboutWhyChooseUs}
      </motion.p>
    </section>
  );
};

export default AboutWhyChooseUs;
