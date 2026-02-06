import React from "react";
import { motion } from "framer-motion";
import { Building2, User, Home, Shield } from "lucide-react"; // Added icons
import { aboutWhoWeServe } from "../../../config/staticData";

const AboutWhoWeServe = () => {
  // Mapping icons to roles (Update these based on your staticData keys)
  const getIcon = (role) => {
    switch (role.toLowerCase()) {
      case "owners":
      case "property owners":
        return <Building2 size={40} />;
      case "tenants":
      case "users":
        return <User size={40} />;
      case "pg managers":
        return <Home size={40} />;
      default:
        return <Shield size={40} />;
    }
  };

  return (
    <section className="py-16 px-6 snap-start max-w-7xl mx-auto">
      {/* Section Heading */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Who We Serve
        </h2>
        <div className="w-20 h-1.5 bg-primary rounded-full"></div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {aboutWhoWeServe.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Icon Circle */}
            <div className="flex-shrink-0 bg-orange-50 text-primary p-4 rounded-2xl">
              {getIcon(item.role)}
            </div>

            {/* Content */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {item.role}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutWhoWeServe;