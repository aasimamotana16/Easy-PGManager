import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPublicReviews } from "../../../api/api";

const AboutReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getPublicReviews();
        if (response?.data?.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Prevent UI flicker when no reviews
  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-12 px-6 bg-gray-50 snap-start">
      
      {/* Section Heading */}
      <h2 className="text-3xl font-semibold text-primary mb-8 text-left">
        What Our Users Say
      </h2>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review._id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-border rounded-xl shadow-lg p-6 flex flex-col justify-between"
          >
            {/* Review Text */}
            <p className="italic text-text-secondary text-lg">
              “{review.comment}”
            </p>

            {/* User Role */}
            <p className="font-semibold text-primary mt-4 text-base">
              – {review.userRole}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutReviews;
