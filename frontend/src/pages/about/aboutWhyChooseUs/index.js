import React from "react";
import { motion } from "framer-motion";
import { aboutWhyChooseUs } from "../../../config/staticData";
import { CheckCircle } from "lucide-react"; // Simple clean icons

const AboutWhyChooseUs = () => {
  // Mock points - Move these to your staticData.js
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
    <section className="py-16 px-6 lg:px-20 snap-start bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Side: Content */}
        <div className="lg:w-1/2">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Why Choose Us
          </h2>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-text-secondary leading-relaxed text-lg mb-8"
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
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-orange-50 transition-colors duration-300"
              >
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-gray-800">{point.title}</h4>
                  <p className="text-sm text-gray-500">{point.desc}</p>
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
            {/* Main Image: Use a dashboard mockup or PG interior */}
            <img 
              src="/images/aboutImages/aboutIMG1.png" 
              alt="Management Dashboard" 
              className="rounded-[2rem] shadow-2xl border-8 border-gray-50 w-full object-cover h-[400px]"
            />
            {/* Floating Decorative Card */}
            <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-2xl shadow-xl hidden sm:block animate-bounce-slow">
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