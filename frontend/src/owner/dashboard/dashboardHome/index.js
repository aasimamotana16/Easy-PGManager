import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaBed,
  FaMoneyBillWave,
  FaUserPlus,
  FaUsers,
  FaFileContract,
  FaEye,
  FaSignal,
  FaChartLine,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import CButton from "../../../components/cButton";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const [user] = useState({ fullName: "Owner" });

  const stats = {
    totalPGs: 5,
    totalRooms: 24,
    liveListings: 18,
    totalEarnings: 125000,
    totalBookings: 50,
  };

  const earningsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        data: [15000, 20000, 22000, 25000, 27000, 30000, 32000],
        borderColor: "#D97706",
        backgroundColor: "rgba(217, 119, 6, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#1F1F1F',
        titleColor: '#FFFFFF',
        bodyColor: '#FEF3C7'
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#4B4B4B' } },
      y: { grid: { color: "#E5E0D9" }, ticks: { color: '#4B4B4B' } },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-3 sm:p-6 lg:p-8 bg-gray-200 min-h-screen space-y-6 sm:space-y-8"
    >
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-4xl font-bold text-textPrimary">
          Owner Dashboard
        </h1>
        <p className="text-sm sm:text-xl text-textSecondary">
          Welcome back, <span className="text-primary font-medium">{user.fullName}</span>
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total PGs" value={stats.totalPGs} icon={<FaBuilding />} index={0} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={<FaBed />} index={1} />
        <StatCard title="Available PGs" value={stats.liveListings} icon={<FaSignal />} live index={2} />
        <StatCard title="Earnings" value={`₹${(stats.totalEarnings / 1000).toFixed(0)}k`} icon={<FaMoneyBillWave />} index={3} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border border-primary space-y-4">
        <h2 className="text-base sm:text-xl text-textPrimary uppercase font-semibold">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <ActionButton label="Add PG" icon={<FaUserPlus />} onClick={() => navigate("/owner/dashboard/pgManagment/addProperty")} />
          <ActionButton label="Tenants" icon={<FaUsers />} onClick={() => navigate("/owner/dashboard/tenantManagement")} />
          <ActionButton label="Agreements" icon={<FaFileContract />} onClick={() => navigate("/owner/dashboard/oAgreements")} />
          <ActionButton label="Listings" icon={<FaEye />} onClick={() => navigate("/owner/dashboard/pgManagment")} />
        </div>
      </div>

      {/* CHART & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border border-primary space-y-4">
          <h2 className="text-base sm:text-lg md:text-2xl text-textPrimary font-semibold">
            Earnings Overview
          </h2>
          <div className="h-[250px] sm:h-[400px] lg:h-[450px]">
            <Line data={earningsData} options={earningsOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          <SummaryCard title="Total Bookings" value={stats.totalBookings} icon={<FaChartLine />} />
          <SummaryCard title="Total Revenue" value={`₹${stats.totalEarnings.toLocaleString()}`} icon={<FaMoneyBillWave />} />
        </div>
      </div>
    </motion.div>
  );
};

/* REUSABLE ACTION BUTTON */
const ActionButton = ({ label, icon, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <CButton
      onClick={onClick}
      className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base py-4 px-2 w-full transition-all rounded-md border border-border"
    >
      <span className="text-lg sm:text-xl text-textLight">{icon}</span>
      {label}
    </CButton>
  </motion.div>
);

/* STAT CARD - Updated with Background Dark, Text Light, and Normal Weight */
const StatCard = ({ title, value, icon, live, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-backgroundDark text-textLight p-4 sm:p-5 rounded-md flex flex-col justify-between shadow-md relative overflow-hidden min-h-[100px] sm:min-h-[120px]"
  >
    <div className="flex justify-between items-start">
      <p className="text-base sm:text-base text-textLight uppercase tracking-widest ">
        {title}
      </p>
      <div className="text-primary text-lg sm:text-2xl">
        {icon}
      </div>
    </div>
    
    <div className="mt-2 flex items-center gap-2">
      <p className="text-xl text-textLight sm:text-3xl "> {/* Removed bold */}
        {value}
      </p>
      {live && (
        <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full">
          <span className="w-1 h-1 bg-green-400 rounded-full animate-ping"></span>
          LIVE
        </span>
      )}
    </div>
  </motion.div>
);

/* SUMMARY CARD - Updated with Background Dark and Text Light */
const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-backgroundDark text-textLight p-5 sm:p-8 rounded-md flex justify-between items-center shadow-lg border-l-4 border-primary">
    <div className="space-y-1">
      <p className="text-base sm:text-base text-textLight uppercase tracking-widest font-medium">
        {title}
      </p>
      <p className="text-xl sm:text-3xl text-textLight font-normal"> {/* Removed bold */}
        {value}
      </p>
    </div>
    <div className="text-primary text-2xl sm:text-4xl opacity-80">
      {icon}
    </div>
  </div>
);

export default DashboardHome;