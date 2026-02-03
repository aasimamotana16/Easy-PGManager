import React from "react";
import { motion } from "framer-motion";
import { aboutWhoWeServe } from "../../../config/staticData";

const AboutWhoWeServe = () => {
  return (
    <section className="py-12 px-6 snap-start">
      
      {/* Section Heading */}
      <h2 className="text-3xl font-semibold text-primary mb-6 text-left">
        Who We Serve
      </h2>

      {/* List */}
      <ul className="list-disc pl-6 space-y-3">
        {aboutWhoWeServe.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="text-text-secondary text-lg"
          >
            <span className="font-semibold">
              {item.role}:
            </span>{" "}
            {item.desc}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default AboutWhoWeServe;
