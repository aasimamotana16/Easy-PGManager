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
      <section className="bg-background-default px-6 py-16 mt-6 relative">

        {/* Floating Illustration (desktop only, logic unchanged) */}
        <motion.div
          className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
          variants={floatAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />

        {/* SECTION HEADING */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-primary mb-3">
            Everything You Need to Manage Your PG
          </h2>

          <p className="text-lg text-text-secondary leading-relaxed">
            Powerful features designed to simplify daily operations for PG owners.
          </p>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureList.map((feature, index) => (
            <motion.div key={index} variants={fadeUp} className="h-full">
              <CFormCard className="h-full min-h-[180px] flex flex-col p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {feature.iconName === 'verified' && '✓'}
                    {feature.iconName === 'support' && '🎧'}
                    {feature.iconName === 'booking' && '📅'}
                    {feature.iconName === 'payment' && '💳'}
                    {feature.iconName === 'updates' && '🔔'}
                    {feature.iconName === 'mobile' && '📱'}
                    {!feature.iconName && '✓'}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {feature.title}
                </h3>

                <p className="text-lg text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </CFormCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-white px-6 py-20 mt-20 mb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-primary leading-tight">
              <span className="text-primary">Get Started!</span>{" "}
              Onboard your university in just 10 minutes.
            </h2>

            <p className="mt-6 text-lg text-text-secondary max-w-xl">
              Manage PGs, bookings, payments, and tenants from a single dashboard
              designed for scale.
            </p>

            <div className="mt-8">
              <CButton
                className="h-12 text-sm font-bold"
                text="Schedule a Free Demo"
                onClick={() => setOpenDemo(true)}
              />
            </div>

            {/* STATS */}
            <motion.div
              className="mt-12 flex flex-wrap gap-10"
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
                  className="flex items-center gap-4"
                  variants={fadeUp}
                >
                  <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-sm text-text-secondary">
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
              className="relative z-20 w-[700px] max-w-full"
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
