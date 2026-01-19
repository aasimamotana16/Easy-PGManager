import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileContract, FaUpload, FaHeadset } from "react-icons/fa";
import CButton from "../../../components/cButton";
import { getUserProfile } from "../../../api/api"; 
import axios from "axios";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getUserProfile(); 
        if (res.data.success) {
          setUser(res.data.data); 
        }
      } catch (err) {
        console.error("Using fallback mock name", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Button Logic Handlers ---

  const handleViewAgreement = async () => {
    try {
      const token = localStorage.getItem("token");
      // Connect to backend to get the live rentalAgreement URL [cite: 2026-01-06]
      const { data } = await axios.get("http://localhost:5000/api/users/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Using camelCase for variable names as requested [cite: 2026-01-01]
      if (data.success && data.data.rentalAgreement?.fileUrl) {
        window.open(`http://localhost:5000${data.data.rentalAgreement.fileUrl}`, "_blank");
      } else {
        alert("Agreement file not found. Please upload it in the Documents section.");
      }
    } catch (err) {
      console.error("Error fetching agreement", err);
      alert("Failed to connect to server.");
    }
  };

  const handleUploadNavigation = () => {
    navigate("/user/dashboard/documents"); // Navigates to your document management UI
  };

  const handleSupportNavigation = () => {
    navigate("/user/dashboard/owner-contact");
   // navigate("/user/owner-contact"); // Navigates to contact/support page
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const pgName = user?.bookedPgName || "No PG Booked"; 
  const roomNo = user?.roomNo || "N/A";
  const monthlyRent = user?.monthlyRent ? user.monthlyRent.toLocaleString() : "0";
  const bookingStatus = user?.bookingStatus || "Inactive";
  const nextPaymentDate = user?.paymentDueDate || "05 Jan 2026";
  const completionPercentage = user?.profileCompletion || 0;

  return (
    <div className="space-y-8 p-6 rounded-2xl bg-dashboard-gradient">
      
      {/* Welcome & Profile Completion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border">
          <h1 className="text-2xl font-semibold text-primary">
            Welcome back, {user?.name || "Guest"} 👋
          </h1>
          <p className="text-buttonDEFAULT mt-1">
            Manage your PG stay, payments, and support from one place.
          </p>
          {completionPercentage < 100 && (
            <p className="mt-2 text-sm text-red-500 font-medium">
              Your profile is incomplete. Please update your personal information.
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold mb-2">Profile Completion</h3>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-orange-500" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{completionPercentage}%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Complete your profile to unlock all features</p>
        </div>
      </div>

      {/* Booking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border">
          <div className="flex items-center gap-2 font-semibold mb-4">🏠 Current Booking</div>
          <p className="font-medium text-lg">{pgName}</p>
          <p className="text-gray-500">Room: {roomNo}</p>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${bookingStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {bookingStatus}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border">
          <div className="flex items-center gap-2 font-semibold mb-2">📅 Next Payment</div>
          <p className="font-bold text-2xl text-orange-500">₹{monthlyRent}</p>
          <p className="text-gray-500">Due on {nextPaymentDate}</p>
          <CButton className="mt-3 bg-orange-500 text-white">Next Payment</CButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="PG Name" value={pgName} />
        <StatCard title="Room No" value={roomNo} />
        <StatCard title="Monthly Rent" value={`₹${monthlyRent}`} />
        <StatCard title="Status" value={bookingStatus} highlight />
      </div>

      {/* Quick Actions - Updated with onClick handlers */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-lg font-semibold text-primaryDark mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <CButton 
            className="bg-orange-500 text-white" 
            icon={<FaFileContract className="mr-2" />}
            onClick={handleViewAgreement}
          >
            View Agreement
          </CButton>
          <CButton 
            className="bg-orange-500 text-white" 
            icon={<FaUpload className="mr-2" />}
            onClick={handleUploadNavigation}
          >
            Upload Documents
          </CButton>
          <CButton 
            className="bg-orange-500 text-white" 
            icon={<FaHeadset className="mr-2" />}
            onClick={handleSupportNavigation}
          >
            Contact Support
          </CButton>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 border">
    <p className="text-gray-400 text-sm">{title}</p>
    <p className={`text-lg font-bold mt-1 ${highlight ? "text-primary" : "text-orange-500"}`}>{value}</p>
  </div>
);

export default DashboardHome;