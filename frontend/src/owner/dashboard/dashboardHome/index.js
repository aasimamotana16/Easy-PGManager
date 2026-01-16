import React, { useEffect, useState } from "react";
import { FaBuilding, FaBed, FaChartLine, FaMoneyBillWave, FaUserPlus, FaUsers, FaFileContract, FaEye } from "react-icons/fa";
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
import CButton from "../../../components/cButton"; // Your button component

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardHome = () => {
  const [user, setUser] = useState({ fullName: "Owner" });

  // Mock Data
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
        borderColor: "#F97316",
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { type: "category" },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-6 bg-dashboard-gradient  rounded-2xl min-h-screen space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className=" text-primary text-2xl font-bold text-">Owner Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.fullName}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total PGs" value={stats.totalPGs} icon={<FaBuilding size={24} />} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={<FaBed size={24} />} />
        <StatCard title="Live Listings" value={stats.liveListings} icon={<FaChartLine size={24} />} live />
        <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon={<FaMoneyBillWave size={24} />} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <CButton className="bg-black text-orange-500 flex items-center gap-2"><FaUserPlus /> Add New PG</CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2"><FaUsers /> Manage Tenants</CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2"><FaFileContract /> View Agreements</CButton>
          <CButton className="bg-black text-orange-500 flex items-center gap-2"><FaEye /> View Listings</CButton>
        </div>
      </div>

      {/* Earnings & Bookings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Earnings Overview</h2>
          <Line data={earningsData} options={earningsOptions} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow space-y-6">
          <div className="flex justify-between items-center bg-black text-white p-4 rounded-lg">
            <div>
              <p className="text-sm">Total Bookings</p>
              <p className="text-xl font-bold">{stats.totalBookings}</p>
            </div>
            <FaChartLine size={28} />
          </div>

          <div className="flex justify-between items-center bg-black text-white p-4 rounded-lg">
            <div>
              <p className="text-sm">Total Earnings</p>
              <p className="text-xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave size={28} />
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, live }) => (
  <div className="bg-black text-white p-6 rounded-2xl flex justify-between items-center shadow">
    <div>
      <p className="text-sm text-gray-300">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`text-orange-500 ${live ? "bg-green-500 px-2 py-1 rounded-full text-xs" : ""}`}>
      {icon} {live && <span className="ml-1 text-white text-xs font-semibold">Live</span>}
    </div>
  </div>
);

export default DashboardHome;
