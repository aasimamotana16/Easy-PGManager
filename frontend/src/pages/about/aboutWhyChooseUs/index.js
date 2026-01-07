import React from "react";
import { motion } from "framer-motion";
import { aboutWhyChooseUs } from "../../../config/staticData";

const AboutWhyChooseUs = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
        Why Choose Us
      </h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-text-secondary leading-relaxed"
      >
        {aboutWhyChooseUs}
      </motion.p>
    </section>
  );
};

export default AboutWhyChooseUs;
