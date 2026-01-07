import React from "react";
import { motion } from "framer-motion";
import { aboutReviews } from "../../../config/staticData";

const AboutReviews = () => {
  return (
    <section className="py-12 px-6 sm:px-12 md:px-16 lg:px-24 bg-gray-50 snap-start">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-primary mb-8 text-center md:text-left">
        What Our Users Say
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {aboutReviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-border rounded-xl shadow-lg p-6 flex flex-col justify-between"
          >
            <p className="italic text-text-secondary text-sm sm:text-base md:text-lg lg:text-md">
              "{review.text}"
            </p>
            <p className="font-bold text-primary mt-4 text-sm sm:text-base md:text-lg">
              – {review.author}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutReviews;
