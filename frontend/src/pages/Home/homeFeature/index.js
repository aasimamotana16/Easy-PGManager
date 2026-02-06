import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { features } from "../../../config/staticData";
import { getHomeFeatures } from "../../../api/api";
import CFormCard from "../../../components/cFormCard";
import CButton from "../../../components/cButton";
import DemoBook from "../demoBook";
// Adding unique icons
import { 
  ShieldCheck, 
  Headphones, 
  CalendarCheck, 
  CreditCard, 
  BellRing, 
  Smartphone,
  LineChart,
  Home,
  Users
} from "lucide-react";

/* ================= ANIMATION CONFIG ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ================= ICON MAPPING ================= */
const getFeatureIcon = (title) => {
  const iconProps = { size: 32, strokeWidth: 1.5, className: "text-[#D97706]" };
  if (title.includes("Verified")) return <ShieldCheck {...iconProps} />;
  if (title.includes("Support")) return <Headphones {...iconProps} />;
  if (title.includes("Booking")) return <CalendarCheck {...iconProps} />;
  if (title.includes("Payments")) return <CreditCard {...iconProps} />;
  if (title.includes("Updates")) return <BellRing {...iconProps} />;
  if (title.includes("App")) return <Smartphone {...iconProps} />;
  if (title.includes("Analytics") || title.includes("Reports")) return <LineChart {...iconProps} />;
  if (title.includes("Room")) return <Home {...iconProps} />;
  if (title.includes("Tenant")) return <Users {...iconProps} />;
  return <ShieldCheck {...iconProps} />;
};

const HomeFeatures = ({ stats, userRole = "guest" }) => {
  const [featureList, setFeatureList] = useState(features);
  const [openDemo, setOpenDemo] = useState(false);

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const response = await getHomeFeatures();
        if (response?.data) setFeatureList(response.data);
      } catch (err) {
        console.error("Error loading features:", err);
      }
    };
    fetchFeatureData();
  }, []);

  // OWNER LOGIC: Filter features based on role
  const filteredFeatures = featureList.filter(f => 
    userRole === "owner" ? true : f.role !== "owner"
  );

  return (
    <>
      {/* ================= FEATURES GRID SECTION ================= */}
      <section className="bg-white px-6 py-12 lg:py-16 mt-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#D97706] mb-4">
              Everything You Need to <span className="text-black">Manage Your PG</span>
            </h2>
            <p className="text-gray-500 text-lg">Powerful features designed to simplify daily operations.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {filteredFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} className="w-full">
                <CFormCard className="h-full flex flex-col items-start p-10 rounded-[2.5rem] border border-primary shadow-sm hover:shadow-xl transition-all duration-300 group bg-white">
                  <div className="mb-6 transition-transform group-hover:scale-110">
                    {getFeatureIcon(feature.title)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {feature.desc}
                  </p>
                  {feature.role === "owner" && (
                    <span className="mt-4 px-3 py-1 bg-orange-100 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                      Owner Feature
                    </span>
                  )}
                </CFormCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= GET STARTED / CTA SECTION ================= */}
      <section className="bg-white px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* LEFT CONTENT */}
          <motion.div 
            className="text-center lg:text-left order-2 lg:order-1"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-black leading-tight">
              <span className="text-[#D97706]">Get Started!</span> Onboard your university in just 10 minutes.
            </h2>
            <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto lg:mx-0">
              Manage PGs, bookings, payments, and tenants from a single dashboard designed for scale.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start">
              <CButton 
                className="w-full sm:w-auto px-10 h-14 text-lg font-bold bg-[#D97706]" 
                text="Schedule a Free Demo" 
                onClick={() => setOpenDemo(true)} 
              />
            </div>

            {/* STATS AREA */}
            <div className="mt-12 space-y-6">
              {[
                { label: "Customers Worldwide", value: stats?.customersWorldwide || 0 },
                { label: "Daily Users", value: stats?.dailyUsers || 0 },
                { label: "Worth of Rent Managed", value: `₹${(stats?.worthOfRentManaged || 125000).toLocaleString()}` }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 text-[#D97706] flex items-center justify-center font-bold">
                    {i === 2 ? "₹" : stat.value}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT IMAGE / ILLUSTRATION */}
          <motion.div 
            className="flex justify-center order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img 
              src="/images/homeImages/image11.png" 
              alt="Dashboard Illustration" 
              className="w-full max-w-[550px] h-auto object-contain"
            />
          </motion.div>
        </div>
      </section>

      <DemoBook isOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </>
  );
};

export default HomeFeatures;