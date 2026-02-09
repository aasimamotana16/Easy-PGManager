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
    <section className="py-16 px-6 snap-start max-w-7xl mx-auto bg-background">
      {/* Section Heading */}
      <div className="mb-10">
        <h2 className="text-h2-sm lg:text-h2 font-bold text-primary mb-4">
          Who We Serve
        </h2>
        <div className="w-20 h-1.5 bg-primary rounded-full"></div>
      </div>

      {/* Responsive Grid [cite: 2026-02-06] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {aboutWhoWeServe.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            /* Border and Background using theme tokens [cite: 2026-02-09] */
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            {/* Icon Circle using primarySoft [cite: 2026-02-09] */}
            <div className="flex-shrink-0 bg-primarySoft text-primary p-4 rounded-2xl">
              {getIcon(item.role)}
            </div>

            {/* Content Area */}
            <div>
              <h3 className="text-h3-sm lg:text-h3 font-bold text-textPrimary mb-2">
                {item.role}
              </h3>
              <p className="text-textSecondary text-body-sm lg:text-body leading-relaxed">
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