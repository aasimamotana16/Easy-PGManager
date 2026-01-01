import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { homeBannerStats, features } from "../../../config/staticData";
import { getHomeFeatures } from "../../../services/api"; 
import CFormCard from "../../../components/cFormCard";
import CButton from "../../../components/cButton";

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

const HomeFeatures = () => {
  const navigate = useNavigate();
  // Using static features as initial state so UI isn't empty while loading
  const [featureList, setFeatureList] = useState(features); 

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const response = await getHomeFeatures();
        if (response && response.data) {
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
      <section className="bg-background-default px-6 py-14 md:py-16">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
            Everything You Need to Manage Your PG
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Powerful features designed to simplify daily operations for PG and hostel owners.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureList.map((feature, index) => (
            <motion.div key={index} variants={fadeUp}>
              <CFormCard>
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </CFormCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-white px-6 py-20 mt-24 mb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-tight">
              <span className="text-primary">Get Started!</span>{" "}
              Onboard your university in just 10 minutes.
            </h2>

            <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-xl">
              Manage PGs, hostels, bookings, payments, and tenants from a single
              dashboard designed for scale.
            </p>

            <div className="mt-8">
              <CButton
                text="Schedule a Free Demo"
                onClick={() => navigate("/demoBooking")}
              />
            </div>

            <motion.div
              className="mt-12 flex flex-wrap gap-10"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {homeBannerStats.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4"
                  variants={fadeUp}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {item.value}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
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
              className="relative z-20 w-[380px] sm:w-[420px] md:w-[700px]"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomeFeatures;