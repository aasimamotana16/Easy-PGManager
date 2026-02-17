import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import CButton from "../../components/cButton";
import Loader from "../../components/loader";
import { services as staticServices } from "../../config/staticData";
import { getServicesPageData } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Add this import

export default function Services() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceList, setServiceList] = useState(staticServices);

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        const res = await getServicesPageData();
        if (mounted && res?.data?.success && Array.isArray(res.data.data)) {
          setServiceList(res.data.data);
        }
      } catch (error) {
        console.error("Services API failed, using static fallback:", error);
      } finally {
        if (mounted) {
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Cards appear one after another
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (isLoading) return <Loader />;

  return (
    <div className="bg-background min-h-screen flex flex-col text-textSecondary">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">

          {/* PAGE TITLE */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-16"
          >
            <h1 className="text-h1-sm lg:text-h1 font-bold text-textPrimary tracking-tight mb-4">
              Our Services
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-textSecondary max-w-3xl mx-auto px-2">
              EasyPG Manager provides verified PGs, smart booking, and
              seamless property management tailored for your comfort.
            </p>
          </motion.div>

          {/* SERVICE CARDS GRID */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24"
          >
            {serviceList.map((service, idx) => (
              <motion.div key={idx} variants={itemVariants} className="h-full">
                <ServiceCard {...service} />
              </motion.div>
            ))}
          </motion.div>

          {/* FIND YOUR PG SECTION (CTA) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-primary p-6 sm:p-10 lg:p-12 text-center overflow-hidden"
          >
            <div className="relative group mb-8 overflow-hidden rounded-xl">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={`${process.env.PUBLIC_URL}/images/serviceImage/mapimage.png`}
                alt="Map View"
                className="w-full h-48 sm:h-64 lg:h-72 object-cover shadow-md"
              />
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-textPrimary mb-4 tracking-tight">
              Find Your Perfect Stay
            </h2>

            <p className="text-sm md:text-lg text-textSecondary mb-8 max-w-2xl mx-auto">
              Ready to move? Start your search instantly and discover 
              hand-picked, verified PGs that match your budget and lifestyle.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CButton
                size="lg"
                variant="contained"
                onClick={() => navigate("/findMypg", { state: { fromServices: true } })}
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-lg shadow-primary/20"
              >
                Start Searching Now
              </CButton>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
