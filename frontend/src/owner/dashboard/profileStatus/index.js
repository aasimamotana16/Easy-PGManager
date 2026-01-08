import React, { useState, useEffect } from "react"; // Added useEffect
import axios from "axios"; // Added axios
import ProfileCard from "./profileCard";
import StatsCard from "./statCard";
import ExtraInfoCard from "./extraCardinfo"; // Match your file name exactly
const ProfileStatus = () => {
  // Keep your state structure EXACTLY the same
  const [profileData, setProfileData] = useState({
    name: "alice",
    role: "Owner",
    email: "own@gmail.com",
    phone: "+91 1234567890",
    address: "Ahmedabad",
    pgName: "Girly Hostel",
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

  // Keep stats in state so we can update them from the backend
  const [stats, setStats] = useState([
    { label: "Total PGs", value: 4 },
    { label: "Active PGs", value: 3 },
    { label: "Bookings Today", value: 2 },
    { label: "Complaints", value: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from login
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Profile Details
        const profileRes = await axios.get("http://localhost:5000/api/owner/profile", config);
        setProfileData(profileRes.data);

        // 2. Fetch Dashboard Stats
        const statsRes = await axios.get("http://localhost:5000/api/owner/dashboard-summary", config);
        
        // Update stats while keeping the same UI structure
        setStats([
          { label: "Total PGs", value: statsRes.data.data.stats[0].value }, // Accesses the '1' from backend
          { label: "Total Rooms", value: statsRes.data.data.stats[1].value }, 
          { label: "Live Listings", value: statsRes.data.data.stats[2].value },
          { label: "Recent Status", value: statsRes.data.data.stats[3].value },
        ]);
      } catch (error) {
        console.error("Error fetching owner data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* UI remains UNCHANGED */}
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