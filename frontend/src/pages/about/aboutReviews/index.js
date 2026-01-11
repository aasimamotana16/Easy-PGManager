import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPublicReviews } from "../../../api/api"; // Connecting to backend [cite: 2026-01-06]

const AboutReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getPublicReviews();
        if (response?.data?.success) {
          setReviews(response.data.data); // Dynamic data from MongoDB [cite: 2026-01-06]
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // To prevent UI flickering while loading [cite: 2026-01-01]
  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-12 px-6 sm:px-12 md:px-16 lg:px-24 bg-gray-50 snap-start">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-primary mb-8 text-center md:text-left">
        What Our Users Say
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review._id || i} // Using DB ID for stable list rendering [cite: 2026-01-01]
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-border rounded-xl shadow-lg p-6 flex flex-col justify-between"
          >
            <p className="italic text-text-secondary text-sm sm:text-base md:text-lg lg:text-md">
              "{review.comment}" {/* Backend variable [cite: 2026-01-01] */}
            </p>
            <p className="font-bold text-primary mt-4 text-sm sm:text-base md:text-lg">
              – {review.userRole} {/* Backend variable [cite: 2026-01-01] */}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutReviews;