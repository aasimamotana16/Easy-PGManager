import React from "react";
import { motion } from "framer-motion";
import { aboutWhoWeServe } from "../../../config/staticData";

const AboutWhoWeServe = () => {
  return (
    <section className="py-12 px-6 sm:px-12 md:px-16 lg:px-24 snap-start">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-primary mb-6 text-center md:text-left">
        Who We Serve
      </h2>

      <ul className="list-disc pl-6 sm:pl-8 md:pl-10 space-y-3">
        {aboutWhoWeServe.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="text-text-secondary text-sm sm:text-base md:text-lg lg:text-md"
          >
            <span className="font-semibold">{item.role}:</span> {item.desc}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default AboutWhoWeServe;
