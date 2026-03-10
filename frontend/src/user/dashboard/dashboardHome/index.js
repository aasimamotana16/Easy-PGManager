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
  FaStar
} from "react-icons/fa";
import CButton from "../../../components/cButton";
import PayNowButton from '../../../components/payNowButton';
import { getUserProfile, getUserDashboard, getMyAgreement, createReview } from "../../../api/api";
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
  while (due <= today) {
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const formatInr = (value) => {
    const n = Number(value || 0);
    return `₹${Number.isFinite(n) ? n.toLocaleString("en-IN") : "0"}`;
  };

  const formatEstimateHtml = (estimatePayload) => {
    const summary = estimatePayload?.summary || {};
    const refundable = Number(summary.refundableAmount || 0);
    const commission = Number(summary.nonRefundableCommissionAmount || 0);
    const noShowDeduction = Number(summary.noShowDeductionAmount || 0);
    const grossPaid = Number(summary.grossPaidAmount || estimatePayload?.totalPaidAmount || 0);
    const rule = String(summary.refundRule || "");
    const note = String(summary.note || "");

    return `
      <div style="text-align:left; font-size: 14px; line-height: 1.6;">
        <p><b>Paid so far:</b> ${formatInr(grossPaid)}</p>
        <p><b>Estimated refundable:</b> <span style="color:#059669; font-weight:700;">${formatInr(refundable)}</span></p>
        <p><b>Non-refundable commission:</b> ${formatInr(commission)}</p>
        ${noShowDeduction > 0 ? `<p><b>No-show deduction:</b> ${formatInr(noShowDeduction)}</p>` : ""}
        ${rule ? `<hr style="border:0;border-top:1px solid #E5E0D9; margin: 10px 0;" /><p><b>Rule:</b> ${rule}</p>` : ""}
        ${note ? `<p style="color:#4B4B4B;"><small>${note}</small></p>` : ""}
        <small>Note: This is an estimate. Actual refunds depend on owner approval and payment processing.</small>
      </div>
    `;
  };

  const handleRequestCancellation = async () => {
    const token = localStorage.getItem("userToken");
    const bookingIdentifier = dashboardData?.currentBooking?.bookingDbId;
    if (!token || token === "null") {
      return Swal.fire({
        title: "Session Expired",
        text: "Please log in again.",
        icon: "warning",
        confirmButtonColor: "#f97316",
      });
    }

    if (!bookingIdentifier) {
      return Swal.fire({
        title: "No Active Booking",
        text: "Could not find an active booking to cancel.",
        icon: "info",
        confirmButtonColor: "#f97316",
      });
    }

    try {
      let estimateHtml = "";
      try {
        const estimateRes = await fetch(
          `http://localhost:5000/api/bookings/${encodeURIComponent(bookingIdentifier)}/cancellation-estimate`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const estimateJson = await estimateRes.json();
        if (estimateRes.ok && estimateJson?.success) {
          estimateHtml = formatEstimateHtml(estimateJson.data);
        }
      } catch (_) {
        estimateHtml = "";
      }

      const result = await Swal.fire({
        title: "Request Cancellation?",
        html: `
          ${estimateHtml || "<p style='text-align:left;'>Refund estimate is not available right now.</p>"}
          <hr style="border:0;border-top:1px solid #E5E0D9; margin: 12px 0;" />
          <div style="text-align:left;">
            <label style="font-size:12px;font-weight:600;">Reason</label>
            <textarea id="cancel-reason" class="swal2-textarea" placeholder="Reason for cancellation (optional)"></textarea>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Send Request",
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#4B4B4B",
        preConfirm: () => {
          const reason = document.getElementById("cancel-reason")?.value || "";
          return { reason: String(reason).trim() };
        },
      });

      if (!result.isConfirmed) return;
      const reason = result.value?.reason || "";

      const resp = await fetch(`http://localhost:5000/api/bookings/${encodeURIComponent(bookingIdentifier)}/request-cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || "Cancellation requested", otherReason: "" }),
      });

      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.message || "Failed to request cancellation");
      }

      await Swal.fire({
        title: "Cancellation Requested",
        text: "Your cancellation request has been sent to the owner for approval.",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
      loadData();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || "Failed to request cancellation.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

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

  useEffect(() => {
    if (!reviewSuccess) return undefined;
    const timer = setTimeout(() => setReviewSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [reviewSuccess]);

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
          } else {
            Swal.fire({
              title: "Verification Failed",
              text: String(result?.message || "Payment could not be verified."),
              icon: "error",
              confirmButtonColor: "#f97316",
            });
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

  const handleReviewSubmit = async () => {
    const comment = String(reviewText || "").trim();
    if (!comment) {
      setReviewError("Please write your review before submitting.");
      return;
    }
    if (!rating || rating < 1) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const payload = {
        userId: user?._id || localStorage.getItem("userId") || null,
        userName: user?.fullName || localStorage.getItem("userName") || "User",
        userEmail: user?.email || localStorage.getItem("userEmail") || "",
        userRole: "tenant",
        comment,
        rating,
      };

      await createReview(payload);
      setShowReviewModal(false);
      setReviewText("");
      setRating(0);
      setHoverRating(0);
      setReviewSuccess("Review submitted successfully and published on home page.");
    } catch (err) {
      console.error("User review submit failed", err);
      setReviewError(err?.response?.data?.message || "Could not submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const pgName = dashboardData?.currentBooking?.pgName || user?.bookedPgName || "No PG Booked";
  const roomType = dashboardData?.currentBooking?.roomType || user?.roomType || "N/A";
  const monthlyRent = dashboardData?.currentBooking?.monthlyRent || user?.monthlyRent || 0;
  const bookingStatusRaw = dashboardData?.currentBooking?.status || user?.bookingStatus || "Inactive";
  const bookingStatus = ["Active", "Pending Move-In Approval"].includes(String(bookingStatusRaw))
    ? "Active Tenant"
    : bookingStatusRaw;

  const cancelStatus = String(dashboardData?.currentBooking?.cancelRequest?.status || "").trim().toLowerCase();
  const cancelRequested = Boolean(dashboardData?.currentBooking?.cancelRequest?.requested);
  const isCancelPending = cancelRequested && (cancelStatus === "pending" || !cancelStatus);
  const isCancelled = String(dashboardData?.currentBooking?.bookingState || "").trim().toLowerCase() === "cancelled";
  const rawDueDate = dashboardData?.nextPayment?.dueDate || user?.paymentDueDate || null;
  const nextPaymentDate = getUpcomingDueDate(rawDueDate) || (monthlyRent > 0 ? "Due date not available" : "No due");
  const dueAmount = Number(dashboardData?.nextPayment?.amount || monthlyRent || 0);
  const canPayNow = Boolean(dashboardData?.nextPayment?.canPayNow) && dueAmount > 0;
  const moveOutCompleted = Boolean(dashboardData?.moveOutCompleted);
  const completionPercentage = dashboardData?.profileCompletion || user?.profileCompletion || 0;
  const recentPayments = dashboardData?.recentPayments || [];

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-200 min-h-screen space-y-5 sm:space-y-8">
      
      {/* HEADER */}
      <div className="px-1">
        <h2 className="font-bold text-textPrimary">
          User Dashboard
        </h2>
        <h3 className=" text-[#4B4B4B]">
          Welcome back, <span className="text-primary font-medium">{user?.fullName}</span>
        </h3>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="PG Name" value={pgName} icon={<FaHome />} />
        <StatCard title="Room Type" value={roomType} icon={<FaBed />} />
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
            <p className="text-2xl sm:text-3xl md:text-5xl lg:text-3xl text-orange-500 mb-4">₹{dueAmount.toLocaleString()}</p>
            {moveOutCompleted ? (
              <CButton disabled className="w-full !opacity-80 !cursor-not-allowed">
                MOVE-OUT COMPLETED
              </CButton>
            ) : canPayNow ? (
              <PayNowButton amount={dueAmount} pgId={dashboardData?.currentBooking?.pgId || user?.bookedPgId} intentType="MONTHLY_RENT" className="w-full" onSuccess={() => loadData()}>
                {isProcessing ? "INITIALIZING..." : "PAY NOW"}
              </PayNowButton>
            ) : (
              <CButton disabled className="w-full !opacity-80 !cursor-not-allowed">
                PAID FOR THIS CYCLE
              </CButton>
            )}

            {Boolean(dashboardData?.currentBooking?.bookingDbId) && !moveOutCompleted && !isCancelled && (
              <div className="mt-3">
                {isCancelPending ? (
                  <CButton disabled className="w-full !opacity-80 !cursor-not-allowed">
                    CANCELLATION REQUESTED
                  </CButton>
                ) : (
                  <CButton onClick={handleRequestCancellation} className="w-full bg-gray-900 hover:bg-black">
                    REQUEST CANCELLATION
                  </CButton>
                )}
              </div>
            )}
          </div>
          <div className="bg-primarySoft border border-primary p-4 sm:p-5 rounded-md shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full text-primary shadow-sm">
                <FaStar size={16} />
              </div>
              <p className="font-bold text-textPrimary text-sm sm:text-base">Enjoying EasyPG?</p>
            </div>
            <p className="text-xs text-textSecondary leading-tight">
              Your feedback helps us make PG management better for everyone.
            </p>
            <button
              onClick={() => {
                setReviewError("");
                setShowReviewModal(true);
              }}
              className="w-full bg-primary text-white py-2 rounded-md text-xs font-bold hover:bg-primaryDark transition-colors shadow-sm"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-md p-6 w-full max-w-md border border-primary shadow-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-textPrimary">Share Your Experience</h2>
              <p className="text-sm text-textSecondary">How would you rate our platform?</p>
              <div className="flex justify-center gap-2 py-2">
                {[...Array(5)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <FaStar
                      key={i}
                      size={30}
                      className={`cursor-pointer transition-colors ${val <= (hoverRating || rating) ? "text-primary" : "text-gray-300"}`}
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  );
                })}
              </div>
              <textarea
                className="w-full border border-border rounded-md p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Tell us what you like or what we can improve..."
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              {reviewError && <p className="text-xs text-red-600 text-left">{reviewError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setReviewError("");
                    setShowReviewModal(false);
                  }}
                  className="flex-1 py-2 text-sm font-bold text-textSecondary hover:bg-gray-100 rounded-md transition-colors"
                >
                  Later
                </button>
                <CButton
                  className="flex-1"
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  text={reviewSubmitting ? "Submitting..." : "Submit"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {reviewSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-md shadow-sm z-[1000]">
          {reviewSuccess}
        </div>
      )}
    </div>
  );
};

/* REUSABLE COMPONENTS */
const ActionButton = ({ label, icon, onClick }) => (
  <CButton
    onClick={onClick}
    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] sm:text-sm md:text-3xl lg:text-lg py-4 px-2 w-full transition-all border border-primary/30 hover:border-primary"
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
