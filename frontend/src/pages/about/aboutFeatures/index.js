import React from "react";
import { motion } from "framer-motion";
import { aboutFeatures } from "../../../config/staticData";

const AboutFeatures = () => {
  return (
    <section className="py-12 px-6 sm:px-12 md:px-16 lg:px-24 snap-start">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-primary mb-8 text-center md:text-left">
        Our Key Features
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aboutFeatures.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-border rounded-xl shadow-lg hover:shadow-xl p-6 flex flex-col justify-between"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl font-semibold text-primary mb-2">
              {feature.title}
            </h3>
            <p className="text-text-secondary text-sm sm:text-base md:text-md lg:text-sm">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutFeatures;
