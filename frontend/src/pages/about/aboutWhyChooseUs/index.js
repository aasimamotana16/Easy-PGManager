import React from "react";
import { motion } from "framer-motion";
import { aboutWhyChooseUs } from "../../../config/staticData";
import { CheckCircle } from "lucide-react";

const AboutWhyChooseUs = () => {
  const points = [
    { title: "Smart Automation", desc: "Automate rent reminders and payment tracking effortlessly." },
    { title: "Secure Data", desc: "Your tenant and property data is protected with enterprise-level security." },
    { title: "Real-time Analytics", desc: "Get instant insights into your PG's occupancy and revenue." },
    { title: "Easy Communication", desc: "Bridge the gap between owners and tenants with built-in tools." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    /* Updated background to your theme default [cite: 2026-02-09] */
    <section className="py-12 px-6 lg:px-20 snap-start bg-background">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Side: Content */}
        <div className="lg:w-1/2">
          {/* Responsive Heading [cite: 2026-02-06] */}
          <h2 className=" text-primary mb-6">
            Why Choose Us
          </h2>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            /* Standardized text color and size [cite: 2026-02-09] */
            className="text-textSecondary  mb-8"
          >
            {aboutWhyChooseUs}
          </motion.p>

          {/* Points Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {points.map((point, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                /* Swapped orange-50 for primarySoft [cite: 2026-02-09] */
                className="flex items-start gap-3 p-4 rounded-md hover:bg-primarySoft transition-colors duration-300"
              >
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-textPrimary ">
                    {point.title}
                  </h3>
                  <p className=" text-textSecondary opacity-80">
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Image Suggestion */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="lg:w-1/2 w-full"
        >
          <div className="relative">
            <img 
              src="/images/aboutImages/aboutIMG1.png" 
              alt="Management Dashboard" 
              /* Swapped gray-50 for border color [cite: 2026-02-09] */
              className="rounded-[2rem] shadow-2xl border-8 border-border w-full object-cover h-[300px] lg:h-[400px]"
            />
            {/* Floating Decorative Card using Primary colors [cite: 2026-02-09] */}
            <div className="absolute -bottom-6 -left-6 bg-primary text-textLight p-6 rounded-2xl shadow-xl hidden sm:block animate-bounce-slow">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-xs uppercase tracking-wider">Reliable Management</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutWhyChooseUs;