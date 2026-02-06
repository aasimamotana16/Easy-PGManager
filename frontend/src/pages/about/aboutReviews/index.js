import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react"; // Icons for UI polish
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

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#FDFBF9] snap-start">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col mb-12">
          <h2 className="text-4xl font-bold text-primary mb-2">
            What Our Users Say
          </h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Simple Skeleton Loader
            [1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
            ))
          ) : (
            reviews.map((review, i) => (
              <motion.div
                key={review._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }} // Hover lift effect
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-2xl hover:border-primary/20 p-8 flex flex-col justify-between transition-all duration-300"
              >
                {/* Decorative Quote Icon */}
                <div className="absolute top-4 right-6 text-orange-100 group-hover:text-orange-200 transition-colors">
                  <Quote size={40} fill="currentColor" />
                </div>

                <div>
                  {/* Star Rating (Static 5 star for UI) */}
                  <div className="flex gap-1 mb-4 text-orange-400">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={16} fill="currentColor" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 italic text-lg leading-relaxed relative z-10">
                    “{review.comment}”
                  </p>
                </div>

                {/* User Info */}
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {review.userRole?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 capitalize leading-none">
                      {review.userRole}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Verified User</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutReviews;