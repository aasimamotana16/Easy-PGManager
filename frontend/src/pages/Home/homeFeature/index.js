import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { features, guestFeatures } from "../../../config/staticData";
import { getHomeFeatures } from "../../../api/api";
import CFormCard from "../../../components/cFormCard";
import CButton from "../../../components/cButton";
import DemoBook from "../demoBook";
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
  const iconProps = { size: 32, strokeWidth: 1.5, className: "text-primary" };
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

const HomeFeatures = ({ stats, userRole }) => {
  const [featureList, setFeatureList] = useState(features);
  const [openDemo, setOpenDemo] = useState(false);
  const effectiveRole =
    userRole && String(userRole).toLowerCase().trim() !== "guest"
      ? userRole
      : localStorage.getItem("role");
  const resolvedRoleRaw = String(effectiveRole || "guest").toLowerCase().trim();
  const isOwnerRole = resolvedRoleRaw.includes("owner");
  const isTenantRole =
    resolvedRoleRaw.includes("tenant") ||
    resolvedRoleRaw.includes("user");
  const resolvedRole = isOwnerRole ? "owner" : isTenantRole ? "tenant" : "guest";

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const response = await getHomeFeatures();
        const payload = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        const normalized = payload.map((item) => ({
          ...item,
          role: String(item?.role || "").toLowerCase()
        }));
        const hasRoleAwareData = normalized.some((item) => item.role === "owner" || item.role === "tenant");
        setFeatureList(hasRoleAwareData ? normalized : features);
      } catch (err) {
        console.error("Error loading features:", err);
        setFeatureList(features);
      }
    };
    fetchFeatureData();
  }, []);

  const ownerFallback = features.filter((f) => f.role === "owner").slice(0, 6);
  const tenantFallback = features.filter((f) => f.role === "tenant").slice(0, 6);
  const guestFallback = guestFeatures.slice(0, 6);

  let filteredFeatures = [];
  if (resolvedRole === "owner") {
    filteredFeatures = featureList.filter((f) => String(f?.role || "").toLowerCase() === "owner").slice(0, 6);
    if (filteredFeatures.length === 0) filteredFeatures = ownerFallback;
  } else if (resolvedRole === "tenant") {
    filteredFeatures = featureList.filter((f) => String(f?.role || "").toLowerCase() === "tenant").slice(0, 6);
    if (filteredFeatures.length === 0) filteredFeatures = tenantFallback;
  } else {
    filteredFeatures = guestFallback;
  }

  return (
    <>
      {/* ================= FEATURES GRID SECTION ================= */}
      <section className="bg-background px-6 py-10 lg:py-14 mt-4">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {/* Responsive Typography for Feature Header [cite: 2026-02-06] */}
            <h2 className=" text-primary mb-4">
              Everything You Need to <span className="text-textPrimary">Manage Your PG</span>
            </h2>
            <p className="text-textSecondary ">
              Powerful features designed to simplify daily operations.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {filteredFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} className="w-full px-1">
                <div className="h-full rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-orange-400 to-black p-[1px] shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <CFormCard className="h-full flex flex-col items-start p-10 rounded-[2.5rem] bg-background">
                    <div className="mb-6 transition-transform group-hover:scale-110">
                      {getFeatureIcon(feature.title)}
                    </div>
                    {/* Card Title stays as standard xl on all screens but respects theme color */}
                    <h3 className=" font-bold text-textPrimary mb-3 group-hover:text-primary">
                      {feature.title}
                    </h3>
                    {/* Card Body text is now responsive [cite: 2026-02-06] */}
                    <p className="text-textSecondary  leading-relaxed">
                      {feature.desc}
                    </p>
                  </CFormCard>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= GET STARTED / CTA SECTION ================= */}
      <section className="bg-background px-6 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <motion.div 
            className="text-center lg:text-left order-2 lg:order-1"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {/* CTA Header uses responsive h2-sm [cite: 2026-02-06] */}
            <h2 className=" text-textPrimary leading-snug">
              <span className="text-primary">Get Started!</span> Onboard your university in just 10 minutes.
            </h2>
            <p className="mt-6  text-textSecondary max-w-xl mx-auto lg:mx-0">
              Manage PGs, bookings, payments, and tenants from a single dashboard designed for scale.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start">
              <CButton 
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
                  <div className="w-12 h-12 rounded-md bg-primarySoft text-primary flex items-center justify-center font-bold">
                    {i === 2 ? "₹" : stat.value}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-textPrimary">{stat.value}</p>
                    <p className="text-base text-textSecondary uppercase tracking-widest ">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT IMAGE */}
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
