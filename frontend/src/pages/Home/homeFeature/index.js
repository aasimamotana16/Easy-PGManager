// src/pages/Home/homeFeatures/index.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { features } from "../../../config/staticData";
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

const HomeFeatures = ({ stats }) => {
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
      <section className="bg-background-default px-4 sm:px-6 py-12 lg:py-16 mt-6 relative overflow-hidden">

        {/* Floating Illustration */}
        <motion.div
          className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
          variants={floatAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />

        {/* SECTION HEADING */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10 lg:mb-16 px-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl  font-bold text-primary mb-4 leading-tight">
            Everything You Need to Manage Your PG
          </h2>

          <p className="text-xl sm:text-lg text-text-secondary leading-relaxed">
            Powerful features designed to simplify daily operations for PG owners.
          </p>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureList.map((feature, index) => (
            <motion.div key={index} variants={fadeUp} className="h-full">
              <CFormCard className="h-full min-h-[160px] sm:min-h-[180px] flex flex-col p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className=" sm:text-4xl md:text-2xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>

                <p className="sm:text-3xl md:text-xl  text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </CFormCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-white px-4 sm:px-6 py-12 lg:py-20 my-10 lg:my-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            className="text-center lg:text-left order-2 lg:order-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-primary leading-tight">
              <span className="text-primary">Get Started!</span>{" "}
              Onboard your university in just 10 minutes.
            </h2>

            <p className="mt-4 sm:mt-6 text-2xl text-text-secondary max-w-xl mx-auto lg:mx-0">
              Manage PGs, bookings, payments, and tenants from a single dashboard
              designed for scale.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start">
              <CButton
                className="w-full sm:w-auto h-12 px-10 text-lg font-bold"
                text="Schedule a Free Demo"
                onClick={() => setOpenDemo(true)}
              />
            </div>

            {/* STATS */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats && [
                {
                  value: stats.customersWorldwide || 0,
                  label: "Customers Worldwide"
                },
                {
                  value: stats.dailyUsers || 0,
                  label: "Daily Users"
                },
                {
                  value: `₹${(stats.worthOfRentManaged || 0).toLocaleString()}`,
                  label: "Worth of Rent Managed"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 lg:bg-transparent p-3 lg:p-0 rounded-lg min-w-[240px]"
                  variants={fadeUp}
                >
                  <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-lg ">
                    {item.value}
                  </div>
                  <div className="text-left">
                    <p className="text-lg  font-bold text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-lg text-text-secondary uppercase tracking-wider font-medium">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            className="relative flex justify-center order-1 lg:order-2 mb-8 lg:mb-0"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <img
              src="/images/homeImages/image11.png"
              alt="PG Management Dashboard"
              className="relative z-20 w-full max-w-[320px] sm:max-w-[500px] lg:max-w-full h-auto"
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