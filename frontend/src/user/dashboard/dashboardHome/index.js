import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileContract, FaUpload, FaHeadset } from "react-icons/fa";
import CButton from "../../../components/cButton";
import { getUserProfile } from "../../../api/api"; 

const DashboardHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data restored to keep UI full
  const bookings = [{
    pgName: "Shree Residency PG",
    roomNo: "A-203",
    rent: "8,500",
    status: "Active",
    nextDue: "05 Jan 2026",
  }];
  const activeBooking = bookings[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getUserProfile(); // Backend connection kept [cite: 2026-01-06]
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.error("Using fallback mock name");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-8 p-6 rounded-2xl bg-dashboard-gradient">
      
      {/* Welcome & Profile Completion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border">
          <h1 className="text-2xl font-semibold text-primary">
            Welcome back, {user?.fullName || "Guest"} 👋
          </h1>
          <p className="text-buttonDEFAULT mt-1">
            Manage your PG stay, payments, and support from one place.
          </p>
          <p className="mt-2 text-sm text-red-500 font-medium">
            Your profile is incomplete. Please update your personal information.
          </p>
        </div>

        {/* RESTORED: Profile Completion Circle */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold mb-2">Profile Completion</h3>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-orange-500" strokeDasharray="80, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">80%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Complete your profile to unlock all features</p>
        </div>
      </div>

      {/* Booking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border">
          <div className="flex items-center gap-2 font-semibold mb-4">🏠 Current Booking</div>
          <p className="font-medium text-lg">{activeBooking.pgName}</p>
          <p className="text-gray-500">Room: {activeBooking.roomNo}</p>
          <span className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border">
          <div className="flex items-center gap-2 font-semibold mb-2">📅 Next Payment</div>
          <p className="font-bold text-2xl text-orange-500">₹{activeBooking.rent}</p>
          <p className="text-gray-500">Due on {activeBooking.nextDue}</p>
          <CButton className="mt-3 bg-orange-500 text-white">Next Payment</CButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="PG Name" value={activeBooking.pgName} />
        <StatCard title="Room No" value={activeBooking.roomNo} />
        <StatCard title="Monthly Rent" value={`₹${activeBooking.rent}`} />
        <StatCard title="Status" value={activeBooking.status} highlight />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-lg font-semibold text-primaryDark mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <CButton className="bg-orange-500 text-white" icon={<FaFileContract className="mr-2" />}>View Agreement</CButton>
          <CButton className="bg-orange-500 text-white" icon={<FaUpload className="mr-2" />}>Upload Documents</CButton>
          <CButton className="bg-orange-500 text-white" icon={<FaHeadset className="mr-2" />}>Contact Support</CButton>
        </div>
      </div>
    </div>
  );
};

/* --- Helpers --- */
const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 border">
    <p className="text-gray-400 text-sm">{title}</p>
    <p className={`text-lg font-bold mt-1 ${highlight ? "text-primary" : "text-orange-500"}`}>{value}</p>
  </div>
);

export default DashboardHome;