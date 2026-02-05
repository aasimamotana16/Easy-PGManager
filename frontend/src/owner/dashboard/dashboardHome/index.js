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
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { font: { size: 10 } } 
      },
      y: { 
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 10 } }
      },
    },
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-5 sm:space-y-8">
      
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-4xl font-semibold text-gray-800">
          Owner Dashboard
        </h1>
        <p className="sm:text-3xl md:text-2xl text-gray-500">
          Welcome back, <span className="text-primary font-medium">{user.fullName}</span>
        </p>
      </div>

      {/* STATS GRID */}
      {/* 2 columns on mobile (xs) to save vertical space, 4 on large */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total PGs" value={stats.totalPGs} icon={<FaBuilding />} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={<FaBed />} />
        <StatCard
          title="Live Listings"
          value={stats.liveListings}
          icon={<FaSignal />}
          live
        />
        <StatCard
          title="Earnings"
          value={`₹${(stats.totalEarnings / 1000).toFixed(0)}k`} // Abbreviated for mobile readability
          icon={<FaMoneyBillWave />}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm border border-gray-100 space-y-4">
        <h2 className="md:text-2xl   text-gray-700 uppercase ">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <ActionButton
            label="Add PG"
            icon={<FaUserPlus />}
            onClick={() =>
              navigate("/owner/dashboard/pgManagment/addProperty")
            }
          />
          <ActionButton
            label="Tenants"
            icon={<FaUsers />}
            onClick={() => navigate("/owner/dashboard/tenantManagement")}
          />
          <ActionButton
            label="Agreements"
            icon={<FaFileContract />}
            onClick={() => navigate("/owner/dashboard/oAgreements")}
          />
          <ActionButton
            label="Listings"
            icon={<FaEye />}
            onClick={() => navigate("/owner/dashboard/pgManagment")}
          />
        </div>
      </div>

      {/* CHART & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-md shadow-sm border border-gray-100 space-y-4">
          <h2 className=" sm:text-lg md:text-4xl  text-gray-700">
            Earnings Overview
          </h2>
          <div className="h-[200px] sm:h-[500px]  ">
            <Line data={earningsData} options={earningsOptions} />
          </div>
        </div>

        {/* Summary Side Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          <SummaryCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<FaChartLine />}
          />
          <SummaryCard
            title="Total Revenue"
            value={`₹${stats.totalEarnings.toLocaleString()}`}
            icon={<FaMoneyBillWave />}
          />
        </div>
      </div>
    </div>
  );
};

/* REUSABLE ACTION BUTTON */
const ActionButton = ({ label, icon, onClick }) => (
  <CButton
    onClick={onClick}
    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 sm:text-sm md:text-xl  py-3 px-1 w-full  transition-all "
  >
    <span className="text-xl ">{icon}</span>
    {label}
  </CButton>
);

/* STAT CARD */
const StatCard = ({ title, value, icon, live }) => (
  <div className="bg-black text-white p-3 sm:p-5 rounded-md flex flex-col justify-between shadow-md relative overflow-hidden">
    <div className="flex justify-between items-start">
      <p className="text-[10px] sm:text-xs md:text-2xl lg:text-lg text-gray-200 uppercase  tracking-wider">
        {title}
      </p>
      <div className="text-primary md:text-3xl text-lg sm:text-2xl ">
        {icon}
      </div>
    </div>
    
    <div className="mt-2 flex items-center gap-2">
      <p className="text-lg sm:text-2xl md:text-3xl lg:text-xl ">
        {value}
      </p>
      {live && (
        <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[8px] sm:text-[10px]  px-1.5 py-0.5 rounded-full border border-green-500/30">
          <span className="w-1 h-1 bg-green-400 rounded-full animate-ping"></span>
          LIVE
        </span>
      )}
    </div>
  </div>
);

/* SUMMARY CARD */
const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-black text-white p-4 sm:p-6 rounded-md flex justify-between items-center shadow-md ">
    <div className="space-y-1">
      <p className="text-lg sm:text-xs md:text-2xl lg:text-lg text-gray-300 uppercase  tracking-widest">
        {title}
      </p>
      <p className="text-lg sm:text-2xl md:text-3xl lg:text-xl">
        {value}
      </p>
    </div>
    <div className="text-primary text-xl sm:text-3xl ">
      {icon}
    </div>
  </div>
);

export default DashboardHome;