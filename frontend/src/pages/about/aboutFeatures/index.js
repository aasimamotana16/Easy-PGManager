import React from "react";
import { motion } from "framer-motion";
import { aboutFeatures } from "../../../config/staticData";

const AboutFeatures = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
        Our Key Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aboutFeatures.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl shadow-card hover:shadow-hover p-6"
          >
            <h3 className="text-xl font-semibold text-primary mb-2">
              {feature.title}
            </h3>
            <p className="text-text-secondary">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutFeatures;
