import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import ProfileCard from "./profileCard";
import StatsCard from "./statCard";
import ExtraInfoCard from "./extraCardinfo"; 
import { FaCrown, FaCalendarAlt } from "react-icons/fa";

const ProfileStatus = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "Owner",
    email: "",
    phone: "",
    address: "",
    pgName: "",
    memberId: "",
    profileImage: "/images/profileImages/profile1.jpg",
    socialLinks: {
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      twitter: "#",
    },
    registrationDate: "",
  });

  const [stats, setStats] = useState([
    { label: "Total PGs", value: 0 },
    { label: "Active PGs", value: 0 },
    { label: "Bookings Today", value: 0 },
    { label: "Complaints", value: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Execute both requests in parallel for better performance
        const [profileRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/owner/profile", config),
          axios.get("http://localhost:5000/api/owner/dashboard-summary", config)
        ]);
        
        // 1. Update Profile Details
        if (profileRes.data.success) {
          setProfileData(profileRes.data.data); 
        }

        // 2. Update Dashboard Stats
        if (statsRes.data.success) {
          const backendStats = statsRes.data.data.stats;
          setStats([
            { label: "Total PGs", value: backendStats[0]?.value || 0 },
            { label: "Total Rooms", value: backendStats[1]?.value || 0 }, 
            { label: "Live Listings", value: backendStats[2]?.value || 0 },
            { label: "Recent Status", value: backendStats[3]?.value || "N/A" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching owner data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-orange-100 opacity-20"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
          Syncing Identity Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Profile Header Section */}
      <section>
        <ProfileCard profileData={profileData} setProfileData={setProfileData} />
      </section>

      {/* 2. Stats Overview Section */}
      <section className="mt-2">
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-gray-800">Operational Stats</h3>
        </div>
        <StatsCard stats={stats} />
      </section>

      {/* 3. Bottom Info Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExtraInfoCard title="Subscription Management">
          <div className="flex flex-col gap-6 py-2">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-3 rounded-xl text-white">
                  <FaCrown size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest leading-none mb-1">Current Plan</p>
                  <p className="text-lg font-black text-gray-800 uppercase">Premium Plan</p>
                </div>
              </div>
              <span className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Active</span>
            </div>

            <div className="flex items-center gap-4 px-2">
              <FaCalendarAlt className="text-gray-300" />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Next Billing Cycle</p>
                <p className="text-sm font-bold text-gray-700">31 December 2026</p>
              </div>
            </div>
          </div>
        </ExtraInfoCard>

        {/* You can add another ExtraInfoCard here for "Quick Actions" or "Support" */}
      </div>
    </div>
  );
};

export default ProfileStatus;