// src/owner/dashboard/dashboardHome/index.js
import React, { useEffect, useState } from "react";
import { getOwnerDashboardStats } from "../../../api/api"; // Path to your api.js

const OwnerDashboardHome = () => {
  // State using camelCase as requested [cite: 2026-01-01]
  const [dashboardData, setDashboardData] = useState({
    totalPgs: 5,
    totalRooms: 24,
    liveListings: 18,
    recentStatus: "live..."
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getOwnerDashboardStats(); 
        
        // Ensure we check response.data.stats specifically
        if (response.success && response.data && response.data.stats) {
          const statsArray = response.data.stats;
          
          // Match the labels exactly as defined in your controller
          const pgCount = statsArray.find(s => s.label === "Total PGs")?.value || 0;
          const roomCount = statsArray.find(s => s.label === "Total Rooms")?.value || 0;
          const liveCount = statsArray.find(s => s.label === "Live Listings")?.value || 0;
          const status = statsArray.find(s => s.label === "Recent Status")?.value || "Live";

          setDashboardData({
            totalPgs: pgCount,
            totalRooms: roomCount,
            liveListings: liveCount,
            recentStatus: status
          });
        }
      } catch (error) {
        console.error("Back-end connection error:", error);
        setDashboardData(prev => ({ ...prev, recentStatus: "Offline" }));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mapping data to UI - Kept exactly as your original structure
  const stats = [
    { label: "Total PGs", value: loading ? "..." : dashboardData.totalPgs },
    { label: "Total Rooms", value: loading ? "..." : dashboardData.totalRooms },
    { label: "Live Listings", value: loading ? "..." : dashboardData.liveListings },
    { label: "Server Status", value: dashboardData.recentStatus },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-card p-6 rounded-2xl border border-border">
        <h1 className="text-2xl font-semibold text-primary">
          Owner Dashboard 
        </h1>
        <p className="text-buttonDEFAULT mt-1">
          WELCOME BACK
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-primarySoft rounded-2xl border border-border p-5">
            <p className="text-sm text-buttonDEFAULT">{item.label}</p>
            <p className="text-2xl font-semibold text-primary mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboardHome;