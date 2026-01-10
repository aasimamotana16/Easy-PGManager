import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import ProfileCard from "./profileCard";
import StatsCard from "./statCard";
import ExtraInfoCard from "./extraCardinfo"; 

const ProfileStatus = () => {
  // 1. ADDED THIS LINE: Declaration of loading state
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
    { label: "Total PGs", value: 5 },
    { label: "Active PGs", value: 3 },
    { label: "Bookings Today", value: 2 },
    { label: "Complaints", value: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Profile Details
        const profileRes = await axios.get("http://localhost:5000/api/owner/profile", config);
        
        // Use the 'data' wrapper from your backend response
        if (profileRes.data.success) {
          setProfileData(profileRes.data.data); 
        }

        // 2. Fetch Dashboard Stats
        const statsRes = await axios.get("http://localhost:5000/api/owner/dashboard-summary", config);
        
        if (statsRes.data.success) {
          const backendStats = statsRes.data.data.stats;
          setStats([
            { label: "Total PGs", value: backendStats[0].value },
            { label: "Total Rooms", value: backendStats[1].value }, 
            { label: "Live Listings", value: backendStats[2].value },
            { label: "Recent Status", value: backendStats[3].value },
          ]);
        }
      } catch (error) {
        console.error("Error fetching owner data:", error);
      } finally {
        // THIS USES THE VARIABLE AND REMOVES THE WARNING
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  // CRITICAL: If loading is true, show a spinner or nothing.
  // This prevents the "blank" refresh issue.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ProfileCard profileData={profileData} setProfileData={setProfileData} />

      <StatsCard stats={stats} />

      <ExtraInfoCard title="Subscription Info">
        <p>Premium Plan: Active</p>
        <p>Next Billing Date: 31 Dec 2026</p>
      </ExtraInfoCard>
    </div>
  );
};

export default ProfileStatus;