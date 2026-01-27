import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaFileContract, 
  FaUpload, 
  FaHeadset, 
  FaHome, 
  FaWallet, 
  FaUserCheck,
  FaBed,
  FaHistory,
  FaDownload
} from "react-icons/fa";
import CButton from "../../../components/cButton";
import { getUserProfile } from "../../../api/api";
import axios from "axios";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for the Recent Payments table
  const recentPayments = [
    { id: 1, month: "December 2025", amount: 8500, status: "Paid", date: "02 Dec" },
    { id: 2, month: "November 2025", amount: 8500, status: "Paid", date: "05 Nov" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getUserProfile();
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleViewAgreement = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/users/documents",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.data.rentalAgreement?.fileUrl) {
        window.open(`http://localhost:5000${data.data.rentalAgreement.fileUrl}`, "_blank");
      } else {
        alert("Agreement not found");
      }
    } catch {
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  const pgName = user?.bookedPgName || "No PG Booked";
  const roomNo = user?.roomNo || "N/A";
  const monthlyRent = user?.monthlyRent ? user.monthlyRent.toLocaleString() : "0";
  const bookingStatus = user?.bookingStatus || "Inactive";
  const nextPaymentDate = user?.paymentDueDate || "05 Jan 2026";
  const completionPercentage = user?.profileCompletion || 0;

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-5 sm:space-y-8">
      
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800">
          User Dashboard
        </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
          Welcome back, <span className="text-primary font-medium">{user?.fullName}</span>
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="PG Name" value={pgName} icon={<FaHome />} />
        <StatCard title="Room No" value={roomNo} icon={<FaBed />} />
        <StatCard title="Status" value={bookingStatus} icon={<FaUserCheck />} live={bookingStatus === "Active"} />
        <StatCard title="Rent" value={`₹${monthlyRent}`} icon={<FaWallet />} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm sm:text-lg md:text-4xl lg:text-xl font-bold text-gray-700 uppercase tracking-tight">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          <ActionButton label="Agreement" icon={<FaFileContract />} onClick={handleViewAgreement} />
          <ActionButton label="Documents" icon={<FaUpload />} onClick={() => navigate("/user/dashboard/documents")} />
          <ActionButton label="Support" icon={<FaHeadset />} onClick={() => navigate("/user/dashboard/owner-contact")} />
        </div>
      </div>

      {/* RECENT PAYMENTS & PROFILE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Recent Payments Table (Matches Owner Chart Layout) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-md shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-lg md:text-4xl lg:text-xl font-bold text-gray-700">
              Payment History
            </h2>
            <FaHistory className="text-gray-300 md:text-3xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] sm:text-xs md:text-2xl lg:text-sm uppercase text-gray-400 font-bold">
                  <th className="py-3 px-2">Month</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm md:text-2xl lg:text-base">
                {recentPayments.map((pay) => (
                  <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2 font-medium">{pay.month}</td>
                    <td className="py-4 px-2">₹{pay.amount}</td>
                    <td className="py-4 px-2">
                      <span className="text-green-500 font-bold">{pay.status}</span>
                    </td>
                    <td className="py-4 px-2">
                      <button className="text-orange-500 hover:text-orange-700"><FaDownload /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROFILE COMPLETION & DUE INFO */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="bg-white p-6 rounded-md border border-gray-100 flex flex-col items-center">
            <p className="text-[10px] sm:text-xs md:text-2xl lg:text-sm font-bold text-gray-400 uppercase w-full mb-4">Profile Completion</p>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-32 lg:h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-orange-500" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl md:text-4xl lg:text-2xl font-black">{completionPercentage}%</span>
              </div>
            </div>
          </div>
          
          <SummaryCard title="Next Due Date" value={nextPaymentDate} icon={<FaFileContract />} />
          
          <div className="bg-black text-white p-4 sm:p-6 rounded-md shadow-md">
            <p className="text-[10px] sm:text-xs md:text-2xl lg:text-sm text-gray-300 uppercase font-bold mb-1">Rent Due</p>
            <p className="text-2xl sm:text-3xl md:text-5xl lg:text-3xl font-black text-orange-500 mb-4">₹{monthlyRent}</p>
            <CButton className="bg-primary  text-white w-full py-3 md:py-6 md:text-3xl lg:py-3 lg:text-base font-bold">
              PAY NOW
            </CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

/* REUSABLE COMPONENTS */
const ActionButton = ({ label, icon, onClick }) => (
  <CButton
    onClick={onClick}
    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] sm:text-sm md:text-3xl lg:text-lg py-4 px-2 w-full font-bold transition-all border border-gray-200 hover:border-orange-500"
  >
    <span className="text-lg sm:text-xl md:text-4xl lg:text-xl text-while">{icon}</span>
    {label}
  </CButton>
);

const StatCard = ({ title, value, icon, live }) => (
  <div className="bg-black text-white p-3 sm:p-5 rounded-md flex flex-col justify-between shadow-md relative overflow-hidden min-h-[100px] md:min-h-[180px] lg:min-h-[120px]">
    <div className="flex justify-between items-start">
      <p className="text-[9px] sm:text-xs md:text-2xl lg:text-xs text-gray-300 uppercase font-bold tracking-wider">{title}</p>
      <div className="text-orange-500 text-base sm:text-2xl md:text-4xl lg:text-2xl">{icon}</div>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <p className="text-sm sm:text-xl md:text-3xl lg:text-lg font-black truncate max-w-full">{value}</p>
      {live && (
        <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[7px] sm:text-[9px] md:text-lg lg:text-[10px] px-1.5 py-0.5 rounded-full border border-green-500/30">
          <span className="w-1 h-1 bg-green-400 rounded-full animate-ping"></span> LIVE
        </span>
      )}
    </div>
  </div>
);

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-black text-white p-4 sm:p-6 rounded-md flex justify-between items-center shadow-md">
    <div className="space-y-1">
      <p className="text-[10px] sm:text-xs md:text-2xl lg:text-sm text-gray-300 uppercase font-bold tracking-widest">{title}</p>
      <p className="text-lg sm:text-2xl md:text-4xl lg:text-xl font-black">{value}</p>
    </div>
    <div className="text-primary text-xl sm:text-3xl md:text-5xl lg:text-3xl">{icon}</div>
  </div>
);

export default DashboardHome;