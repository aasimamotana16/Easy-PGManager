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
import { getUserProfile, getUserDashboard, getMyAgreement } from "../../../api/api";
import axios from "axios";
import Swal from "sweetalert2";

const formatDueDate = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return null;
  return dateValue.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getUpcomingDueDate = (rawDate) => {
  const parsed = rawDate ? new Date(rawDate) : null;
  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(parsed);
  due.setHours(0, 0, 0, 0);

  // If due date is already past, roll it month-by-month to the next upcoming cycle.
  while (due < today) {
    due.setMonth(due.getMonth() + 1);
  }

  return formatDueDate(due);
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      const profileRes = await getUserProfile();
      if (profileRes.data.success) {
        setUser(profileRes.data.data);
      }

      const dashboardRes = await getUserDashboard();
      if (dashboardRes.data.success) {
        setDashboardData(dashboardRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- RAZORPAY LOGIC ---
  const handleDirectPayment = async () => {
    const token = localStorage.getItem("userToken");
    const amountToPay = dashboardData?.currentBooking?.monthlyRent || user?.monthlyRent || 8500;
    const pgId = dashboardData?.currentBooking?.pgId || user?.bookedPgId || "64b1234567890";
    const month = "February 2026"; 

    if (!token || token === "null") {
      return Swal.fire({
        title: "Session Expired",
        text: "Please log in again.",
        icon: "warning",
        confirmButtonColor: "#f97316",
      });
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amountToPay, pgId }),
      });

      if (!orderResponse.ok) throw new Error("Failed to create order");
      const { order } = await orderResponse.json();

      const options = {
        key: "rzp_test_S9ZmF0zUNli8eT", 
        amount: order.amount,
        currency: "INR",
        name: "EasyPG Manager",
        description: `Rent for ${month}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amountPaid: amountToPay,
              month: month,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            Swal.fire({
              title: "Success!",
              text: "Rent payment received successfully.",
              icon: "success",
              confirmButtonColor: "#f97316",
            });
            loadData();
          }
        },
        theme: { color: "#f97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      Swal.fire({ title: "Error", text: "Could not initiate payment", icon: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewAgreement = async () => {
    try {
      const res = await getMyAgreement();
      if (res.data.success && res.data.data) {
        const agreement = res.data.data;
        
        Swal.fire({
          title: "<strong>Rental Agreement</strong>",
          icon: "info",
          html: `
            <div style="text-align: left; line-height: 2;">
              <p><b>PG Name:</b> ${agreement.pgName || "N/A"}</p>
              <p><b>Room No:</b> ${agreement.roomNo || "N/A"}</p>
              <p><b>Status:</b> <span style="color: #10b981; font-weight: bold;">${agreement.status}</span></p>
            </div>
          `,
          showCloseButton: true,
          showCancelButton: !!agreement.fileUrl,
          focusConfirm: false,
          confirmButtonText: "Close",
          confirmButtonColor: "#f97316",
          cancelButtonText: "View PDF",
          cancelButtonColor: "#f97316",
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel && agreement.fileUrl) {
            window.open(`http://localhost:5000${agreement.fileUrl}`, "_blank");
          }
        });
      } else {
        Swal.fire({
          title: "Not Found",
          text: "Agreement not found",
          icon: "warning",
          confirmButtonColor: "#f97316",
        });
      }
    } catch (err) {
      console.error("Error fetching agreement:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to load agreement",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  const pgName = dashboardData?.currentBooking?.pgName || user?.bookedPgName || "No PG Booked";
  const roomNo = dashboardData?.currentBooking?.roomNo || user?.roomNo || "N/A";
  const monthlyRent = dashboardData?.currentBooking?.monthlyRent || user?.monthlyRent || 0;
  const bookingStatus = dashboardData?.currentBooking?.status || user?.bookingStatus || "Inactive";
  const rawDueDate = dashboardData?.nextPayment?.dueDate || user?.paymentDueDate || null;
  const nextPaymentDate = getUpcomingDueDate(rawDueDate) || (monthlyRent > 0 ? "Due date not available" : "No due");
  const completionPercentage = dashboardData?.profileCompletion || user?.profileCompletion || 0;
  const recentPayments = dashboardData?.recentPayments || [];

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-200 min-h-screen space-y-5 sm:space-y-8">
      
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-[#1C1C1C]">
          User Dashboard
        </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-[#4B4B4B]">
          Welcome back, <span className="text-primary font-medium">{user?.fullName}</span>
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="PG Name" value={pgName} icon={<FaHome />} />
        <StatCard title="Room No" value={roomNo} icon={<FaBed />} />
        <StatCard title="Status" value={bookingStatus} icon={<FaUserCheck />} live={bookingStatus === "Active"} />
        <StatCard title="Rent" value={`₹${monthlyRent.toLocaleString()}`} icon={<FaWallet />} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm border border-primary space-y-4">
        <h2 className="text-base sm:text-xl text-gray-700 uppercase font-semibold">
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
        
        {/* Recent Payments Table */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-md shadow-sm border border-primary space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-lg md:text-4xl lg:text-xl font-semibold text-gray-700">
              Payment History
            </h2>
            <FaHistory className="text-gray-300 md:text-3xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] sm:text-xs md:text-2xl lg:text-sm uppercase text-gray-400 font-semibold">
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
          <div className="bg-white p-6 rounded-md border border-primary flex flex-col items-center">
            <p className="text-[10px] sm:text-xs md:text-2xl lg:text-sm font-medium text-gray-400 uppercase w-full mb-4">Profile Completion</p>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-32 lg:h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-orange-500" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl md:text-4xl lg:text-2xl">{completionPercentage}%</span>
              </div>
            </div>
          </div>
          
          <SummaryCard title="Next Due Date" value={nextPaymentDate} icon={<FaFileContract />} />
          
          <div className="bg-black text-white p-4 sm:p-6 rounded-md shadow-md">
            <p className="text-[10px] sm:text-xs md:text-2xl lg:text-sm text-white uppercase font-medium mb-1">Rent Due</p>
            <p className="text-2xl sm:text-3xl md:text-5xl lg:text-3xl text-orange-500 mb-4">₹{monthlyRent.toLocaleString()}</p>
            <CButton
              onClick={handleDirectPayment}
              disabled={isProcessing || (monthlyRent <= 0)}
              className="w-full"
            >
              {isProcessing ? "INITIALIZING..." : "PAY NOW"}
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
    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] sm:text-sm md:text-3xl lg:text-lg py-4 px-2 w-full transition-all border-2 border-primary/30 hover:border-primary"
  >
    <span className="text-lg sm:text-xl md:text-4xl lg:text-xl">{icon}</span>
    {label}
  </CButton>
);

const StatCard = ({ title, value, icon, live }) => (
  <div className="bg-black text-white p-3 sm:p-5 rounded-md flex flex-col justify-between shadow-md  relative overflow-hidden min-h-[100px] md:min-h-[180px] lg:min-h-[120px]">
    <div className="flex justify-between items-start">
      <p className="text-[9px] sm:text-xs md:text-2xl lg:text-xs text-white uppercase tracking-wider">{title}</p>
      <div className="text-orange-500 text-base sm:text-2xl md:text-4xl lg:text-2xl">{icon}</div>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <p className="text-sm sm:text-xl md:text-3xl text-white lg:text-lg truncate max-w-full">{value}</p>
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
      <p className="text-lg sm:text-2xl md:text-4xl text-white lg:text-xl font-black">{value}</p>
    </div>
    <div className="text-primary text-xl sm:text-3xl md:text-5xl lg:text-3xl">{icon}</div>
  </div>
);

export default DashboardHome;
