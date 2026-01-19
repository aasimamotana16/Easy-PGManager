import React, { useState } from "react";
import {
  FaBuilding,
  FaBed,
  FaChartLine,
  FaMoneyBillWave,
  FaUserPlus,
  FaUsers,
  FaFileContract,
  FaEye,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CButton from "../../../components/cButton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardHome = () => {
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
        label: "Earnings",
        data: [15000, 20000, 22000, 25000, 27000, 30000, 32000],
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.2)",
        tension: 0.3,
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#e5e7eb" } },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* HEADER (Same style as Earnings & Support) */}
      <div className="bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold text-primary">
          Owner Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back, {user.fullName}
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total PGs" value={stats.totalPGs} icon={<FaBuilding size={22} />} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={<FaBed size={22} />} />
        <StatCard title="Live Listings" value={stats.liveListings} icon={<FaChartLine size={22} />} live />
        <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon={<FaMoneyBillWave size={22} />} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-md shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <CButton className="bg-black text-orange-500 flex items-center gap-2">
            <FaUserPlus /> Add New PG
          </CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2">
            <FaUsers /> Manage Tenants
          </CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2">
            <FaFileContract /> View Agreements
          </CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2">
            <FaEye /> View Listings
          </CButton>
        </div>
      </div>

      {/* EARNINGS & BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Earnings Overview
          </h2>
          <Line data={earningsData} options={earningsOptions} />
        </div>

        <div className="bg-white p-6 rounded-md shadow space-y-6">
          <div className="flex justify-between items-center bg-black text-white p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-300">Total Bookings</p>
              <p className="text-xl font-bold">{stats.totalBookings}</p>
            </div>
            <FaChartLine size={26} className="text-orange-500" />
          </div>

          <div className="flex justify-between items-center bg-black text-white p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-300">Total Earnings</p>
              <p className="text-xl font-bold">
                ₹{stats.totalEarnings.toLocaleString()}
              </p>
            </div>
            <FaMoneyBillWave size={26} className="text-orange-500" />
          </div>
        </div>
      </div>

    </div>
  );
};

/* STAT CARD */
const StatCard = ({ title, value, icon, live }) => (
  <div className="bg-black text-white p-6 rounded-md flex justify-between items-center shadow">
    <div>
      <p className="text-sm text-gray-300">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`text-orange-500 ${live ? "bg-green-500 px-2 py-1 rounded-full text-xs" : ""}`}>
      {icon}
      {live && <span className="ml-1 text-white text-xs font-semibold">Live</span>}
    </div>
  </div>
);

export default DashboardHome;
