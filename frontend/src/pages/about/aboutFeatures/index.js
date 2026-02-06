import React from "react";
import { motion } from "framer-motion";
import { 
  Building, 
  Users, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  PieChart 
} from "lucide-react";

const AboutFeatures = () => {
  // Features split by role
  const ownerFeatures = [
    { title: "Property Management", desc: "Easily track rooms, beds, and availability across multiple buildings.", icon: <Building size={32} /> },
    { title: "Revenue Tracking", desc: "Real-time analytics for rent collection and pending payments.", icon: <PieChart size={32} /> },
    { title: "Tenant Onboarding", desc: "Quick digital registration with document verification support.", icon: <Users size={32} /> },
    { title: "Notice Board", desc: "Broadcast important announcements to all tenants instantly.", icon: <Bell size={32} /> },
  ];

  const userFeatures = [
    { title: "Rent Payments", desc: "Pay rent online securely and keep track of your payment history.", icon: <CreditCard size={32} /> },
    { title: "Issue Reporting", desc: "Raise maintenance requests directly to the owner with status updates.", icon: <MessageSquare size={32} /> },
    { title: "Digital Docs", desc: "Access your rental agreement and receipts anytime, anywhere.", icon: <FileText size={32} /> },
    { title: "Secure Living", desc: "Verified owner details and secure digital check-in process.", icon: <ShieldCheck size={32} /> },
  ];

  const renderFeatureSection = (title, features, colorClass) => (
    <div className="mb-16">
      <h3 className={`text-3xl font-bold mb-8 ${colorClass} border-l-4 border-primary pl-4`}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-6 flex flex-col items-start transition-all"
          >
            <div className="text-primary mb-4 bg-orange-50 p-3 rounded-lg">
              {feature.icon}
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {feature.title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Our Key Features
        </h2>
        <p className="text-gray-500 text-lg">
          Tailored solutions for both property owners and their valued residents.
        </p>
      </div>

      {renderFeatureSection("For Property Owners", ownerFeatures, "text-gray-800")}
      <hr className="my-12 border-gray-100" />
      {renderFeatureSection("For Tenants (Users)", userFeatures, "text-gray-800")}
    </section>
  );
};

export default AboutFeatures;