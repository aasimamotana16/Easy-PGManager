import React from "react";
import { motion } from "framer-motion";
import { aboutReviews } from "../../../config/staticData";

const AboutReviews = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
        What Our Users Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aboutReviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl shadow-card p-6"
          >
            <p className="italic text-text-secondary">{review.text}</p>
            <p className="font-bold text-primary mt-4">– {review.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutReviews;
