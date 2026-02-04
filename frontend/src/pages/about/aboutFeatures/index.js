import React from "react";
import { motion } from "framer-motion";
import { aboutFeatures } from "../../../config/staticData";

const AboutFeatures = () => {
  return (
    <section className="py-12 px-6">
      
      {/* Section Heading */}
      <h2 className="text-4xl font-semibold text-primary mb-8 text-left">
        Our Key Features
      </h2>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aboutFeatures.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-border rounded-md shadow-md hover:shadow-lg p-6 flex flex-col"
          >
            {/* Card Title */}
            <h3 className="text-2xl font-semibold text-primary mb-3">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-xl text-text-secondary">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutFeatures;
