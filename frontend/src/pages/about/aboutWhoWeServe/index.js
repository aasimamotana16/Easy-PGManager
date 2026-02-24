import React from "react";
import { motion } from "framer-motion";
import { Building2, User, Home, Shield } from "lucide-react";
import { aboutWhoWeServe } from "../../../config/staticData";

const AboutWhoWeServe = () => {
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
    /* Background set to your default white [cite: 2026-02-09] */
    <section className="py-12 px-6 snap-start max-w-7xl mx-auto bg-background">
      {/* Section Heading */}
      <div className="mb-10">
        <h2 className=" text-primary mb-4">
          Who We Serve
        </h2>
      </div>

      {/* Responsive Grid [cite: 2026-02-06] */}
      {/* Responsive Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {aboutWhoWeServe.map((item, i) => {
    // Check if it's the 3rd item (index 2)
    const isThirdItem = i === 2;

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }} // Changed to 'y' for a smoother entrance for centered items
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        viewport={{ once: true }}
        className={`
          flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 
          bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-all
          ${isThirdItem ? "md:col-span-2 md:max-w-2xl md:mx-auto w-full" : ""}
        `}
      >
        {/* Icon Circle */}
        <div className="flex-shrink-0 bg-primarySoft text-primary p-4 rounded-2xl">
          {getIcon(item.role)}
        </div>

        {/* Content Area */}
        <div>
          <h3 className=" font-bold text-textPrimary mb-2">
            {item.role}
          </h3>
          <p className="text-textSecondary  leading-relaxed">
            {item.desc}
          </p>
        </div>
      </motion.div>
    );
  })}
</div>
    </section>
  );
};

export default AboutWhoWeServe;