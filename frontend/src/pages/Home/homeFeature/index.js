import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { homeBannerStats, features } from "../../../config/staticData";
import { getHomeFeatures } from "../../../api/api";
import CFormCard from "../../../components/cFormCard";
import CButton from "../../../components/cButton";
import DemoBook from "../demoBook";

/* ================= ANIMATION CONFIG ================= */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const floatAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: [0, -8, 0],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/* ================= COMPONENT ================= */

const HomeFeatures = () => {
  const [featureList, setFeatureList] = useState(features);
  const [openDemo, setOpenDemo] = useState(false);

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const response = await getHomeFeatures();
        if (response?.data) {
          setFeatureList(response.data);
        }
      } catch (err) {
        console.error("Error loading features:", err);
      }
    };

    fetchFeatureData();
  }, []);

  return (
    <>
      {/* ================= FEATURES SECTION ================= */}
      <section className="bg-background-default px-4 sm:px-6 py-12 sm:py-14 md:py-16 mt-6 relative">
        
        {/* Illustration (desktop only) */}
        <motion.div
          className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
          variants={floatAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />

        {/* SECTION HEADING */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-4xl font-bold text-primary mb-3">
            Everything You Need to Manage Your PG
          </h2>

          <p className="text-sm sm:text-3xl md:text-3xl lg:text-lg text-text-secondary leading-relaxed">
            Powerful features designed to simplify daily operations for PG owners.
          </p>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureList.map((feature, index) => (
            <motion.div key={index} variants={fadeUp} className="h-full">
              <CFormCard className="h-full min-h-[160px] sm:min-h-[180px] flex flex-col p-5 sm:p-6">
                <h3 className="text-base sm:text-xl md:text-4xl lg:text font-semibold text-primary mb-2 sm:mb-3">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-xl md:text-3xl lg:tex text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </CFormCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-white px-4 sm:px-6 py-16 sm:py-20 mt-16 sm:mt-24 mb-20 sm:mb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-6xl lg:text-5xl font-bold text-text-primary leading-tight">
              <span className="text-primary">Get Started!</span>{" "}
              Onboard your university in just 10 minutes.
            </h2>

            <p className="mt-4 sm:mt-6 text-sm md:text-3xl lg:text-lg text-text-secondary max-w-xl">
              Manage PGs, bookings, payments, and tenants from a single dashboard
              designed for scale.
            </p>

            <div className="mt-6 sm:mt-8">
              <CButton
                className="h-11 sm:h-12 text-sm sm:text-2xl font-bold"
                text="Schedule a Free Demo"
                onClick={() => setOpenDemo(true)}
              />
            </div>

            {/* STATS */}
            <motion.div
              className="mt-8 sm:mt-12 flex flex-wrap gap-6 sm:gap-10"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {homeBannerStats.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 sm:gap-4"
                  variants={fadeUp}
                >
                  <div className="w-10 h-10 sm:w-12 md:h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs sm:text-sm">
                    {item.value}
                  </div>
                  <div>
                    <p className="text-base sm:text-lg md:text-4xl  font-semibold text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-xs sm:text-lg md:text-3xl lg:text-sm text-text-secondary">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <img
              src="/images/homeImages/image11.png"
              alt="PG Management Dashboard"
              className="relative z-20 w-[260px] sm:w-[480px] md:w-[780px] lg:w-[700px]"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= DEMO MODAL ================= */}
      <DemoBook isOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </>
  );
};

export default HomeFeatures;
