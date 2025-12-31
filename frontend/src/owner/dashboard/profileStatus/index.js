import React, { useState } from "react";
import ProfileCard from "./profileCard";
import StatsCard from "./statCard";
import ExtraInfoCard from "./extraCardinfo";

const ProfileStatus = () => {
  const [profileData, setProfileData] = useState({
    name: "ABCD",
    role: "Owner",
    email: "owner@example.com",
    phone: "+1 123 456 7890",
    address: "123 Main Street, City",
    pgName: "ABCD",
    memberId: "EPG12345",
    profileImage: "/images/profileImages/profile1.jpg",
    socialLinks: {
      facebook: "#",
      instagram: "#",
      linkedin: "#",
      twitter: "#",
    },
    registrationDate: "01 Jan 2025",
  });

  const stats = [
    { label: "Total PGs", value: 3 },
    { label: "Active PGs", value: 2 },
    { label: "Bookings Today", value: 5 },
    { label: "Complaints", value: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ===== Profile Card ===== */}
      <ProfileCard profileData={profileData} setProfileData={setProfileData} />

      {/* ===== Stats Cards ===== */}
      <StatsCard stats={stats} />

      {/* ===== Extra Info / Subscription ===== */}
      <ExtraInfoCard title="Subscription Info">
        <p>Premium Plan: Active</p>
        <p>Next Billing Date: 31 Dec 2025</p>
      </ExtraInfoCard>
    </div>
  );
};

export default ProfileStatus;
