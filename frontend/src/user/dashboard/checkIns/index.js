import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";
import { requestExtension, requestMoveIn, requestMoveOut } from "../../../api/api";
import { 
  FaHistory, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaClock,
  FaCalendarCheck,
  FaMoneyCheckAlt
} from "react-icons/fa";

const CheckIns = () => {
  const navigate = useNavigate(); // Hook for redirection
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // States for Stay Management
  // Possible statuses: "Reserved" (only deposit paid), "PendingConfirmation" (rent paid, waiting for owner), "Active"
  const [stayStatus, setStayStatus] = useState("Reserved"); 
  const [joiningDate, setJoiningDate] = useState(null);
  const [rentAmount, setRentAmount] = useState(0);
  const [hasPaidFirstRent, setHasPaidFirstRent] = useState(false);
  const [hasApprovedMoveIn, setHasApprovedMoveIn] = useState(false);
  const authToken = localStorage.getItem("userToken");

  const canRequestMoveOut = hasPaidFirstRent && hasApprovedMoveIn;
  const disableMoveInPay = hasPaidFirstRent || !Number.isFinite(Number(rentAmount)) || Number(rentAmount) <= 0;

  useEffect(() => {
    if (authToken) {
      fetchCheckInHistory();
      fetchStayDetails();
    }
  }, [authToken]);

  const fetchStayDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/dashboard-stats", {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.data?.success || !res.data?.data) return;
      const data = res.data.data;
      const booking = data.currentBooking || {};
      const nextPayment = data.nextPayment || {};
      const bookingStatus = String(booking.status || "").toLowerCase();
      const bookingPaid = Boolean(booking.isPaid);
      const moveInApproved = Boolean(booking.hasApprovedMoveIn);

      const derivedRent = Number(nextPayment.amount || booking.monthlyRent || 0);
      setRentAmount(derivedRent);
      setHasPaidFirstRent(bookingPaid);
      setHasApprovedMoveIn(moveInApproved);

      if (bookingStatus === "active") {
        setStayStatus("Active");
      } else if (bookingStatus === "pending move-in approval") {
        setStayStatus("PendingConfirmation");
      } else if (bookingStatus === "awaiting payment") {
        setStayStatus("Reserved");
      } else if (bookingStatus === "pending approval") {
        setStayStatus("PendingConfirmation");
      } else {
        setStayStatus("Reserved");
      }

      const dueDate = nextPayment.dueDate ? new Date(nextPayment.dueDate) : null;
      if (dueDate && !Number.isNaN(dueDate.getTime())) {
        setJoiningDate(dueDate);
      }
    } catch (error) {
      console.error("Stay details fetch error:", error);
    }
  };

  const fetchCheckInHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/my-checkins", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data.success) setHistory(res.data.data);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: MOVE-IN (Redirect to Payment) ---
  const handleMoveIn = async () => {
    if (disableMoveInPay) {
      if (!hasPaidFirstRent) {
        Swal.fire({
          title: 'No Payment Due',
          text: "There's nothing to pay right now.",
          icon: 'info',
          confirmButtonColor: '#D97706'
        });
      }
      return;
    }

    const result = await Swal.fire({
      title: 'Complete Your Move-In',
      html: `You need to pay the first month's rent of <b>₹${rentAmount}</b> to activate your stay.<br><br><small>You will be redirected to the secure payment page.</small>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#D97706', // primary
      confirmButtonText: 'Go to Payment',
      cancelButtonText: 'Later'
    });

    if (result.isConfirmed) {
      navigate('/user/dashboard/payments', {
        state: {
          amount: rentAmount,
          type: 'MOVE_IN_PAYMENT',
          reason: 'Move-In Activation'
        }
      });
    }
  };

  const handleRequestMoveIn = async () => {
    try {
      const resp = await requestMoveIn();
      if (resp.data?.success) {
        Swal.fire({
          title: "Move-In Requested",
          text: "Your move-in request is sent. Owner approval is required.",
          icon: "success",
          confirmButtonColor: "#D97706"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: resp.data?.message || "Failed to request move-in",
          icon: "error",
          confirmButtonColor: "#D97706"
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to request move-in",
        icon: "error",
        confirmButtonColor: "#D97706"
      });
    }
  };
  // --- LOGIC: MOVE-OUT (notice date + long-term fine rule) ---
  const handleMoveOut = () => {
    if (!canRequestMoveOut) {
      Swal.fire({
        title: "Move-Out Not Allowed",
        text: "You can request move-out only after your move-in is completed.",
        icon: "warning",
        confirmButtonColor: "#D97706"
      });
      return;
    }
    Swal.fire({
      title: "Initiate Permanent Move-Out?",
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:10px;">Select your final move-out date.</p>
          <label style="font-size:12px;font-weight:600;">Move-out date</label>
          <input id="moveout-date" type="date" class="swal2-input" />
          <p style="font-size:11px;color:#B45309;">
            For long-term stays, less than 1-month notice can apply a fixed Rs 5,000 fine.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1C1C1C",
      cancelButtonColor: "#4B4B4B",
      confirmButtonText: "Confirm Move-Out",
      preConfirm: () => {
        const moveOutDate = document.getElementById("moveout-date")?.value;
        if (!moveOutDate) {
          Swal.showValidationMessage("Please select move-out date");
          return null;
        }
        return { moveOutDate };
      }
    }).then(async (result) => {
      if (!result.isConfirmed || !result.value) return;
      try {
        const resp = await requestMoveOut(result.value);
        if (resp.data?.success) {
          const fineApplied = Number(resp.data?.fineApplied || 0);
          const remainingPayable = Number(resp.data?.remainingPayable || 0);
          const fineHtml = fineApplied > 0
            ? `<br/><small>Notice fine: <b>Rs ${fineApplied}</b>${remainingPayable > 0 ? ` (Remaining payable: Rs ${remainingPayable})` : ""}</small>`
            : `<br/><small>No short-notice fine applied.</small>`;
          Swal.fire({
            title: "Request Sent",
            html: `${resp.data.message || "Move-out request sent to owner."}${fineHtml}`,
            icon: "success",
            confirmButtonColor: "#D97706"
          });
        } else {
          Swal.fire({ title: "Error", text: resp.data?.message || "Failed to move-out", icon: "error", confirmButtonColor: "#D97706" });
        }
      } catch (e) {
        console.error("Move-out API error", e);
        Swal.fire({ title: "Error", text: "Failed to request move-out", icon: "error", confirmButtonColor: "#D97706" });
      }
    });
  };
  const handleExtension = () => {
    Swal.fire({
      title: 'Request Extension',
      html: `
        <div style="text-align:left;">
          <label style="font-size:12px;font-weight:600;">Pause fine till date</label>
          <input id="ext-date" type="date" class="swal2-input" />
          <textarea id="ext-reason" class="swal2-textarea" placeholder="Reason (optional)"></textarea>
          <p style="font-size:11px;color:#B45309;">Late fine is ₹100/day and will pause till selected date.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      preConfirm: () => {
        const untilDate = document.getElementById("ext-date")?.value;
        const reason = document.getElementById("ext-reason")?.value || "";
        if (!untilDate) {
          Swal.showValidationMessage("Please select extension date");
          return null;
        }
        return { untilDate, reason };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          const apiRes = await requestExtension(res.value);
          Swal.fire({
            title: 'Request Sent',
            text: apiRes.data?.message || 'Extension request submitted',
            icon: 'success',
            confirmButtonColor: '#D97706'
          });
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Failed to request extension',
            icon: 'error',
            confirmButtonColor: '#D97706'
          });
        }
      }
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && joiningDate) {
      const dateStr = date.toISOString().split('T')[0];
      const joinStr = joiningDate.toISOString().split('T')[0];
      if (dateStr === joinStr) return "transparent-black-tile";
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-200 text-[#1C1C1C]">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="px-1 text-center md:text-left">
          <h2 className=" font-bold text-textPrimary">Stay Management</h2>
          <h3 className=" text-primary">Manage your move-in, move-out, and billing history</h3>
        </div>

        {/* --- MAIN ACTION CARD (OLD UI) --- */}
        <div className="grid grid-cols-1">
          <div className="bg-white rounded-md p-8 shadow-sm border border-[#E5E0D9] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#FEF3C7] text-[#D97706] rounded-full flex items-center justify-center mb-4">
              <FaMoneyCheckAlt size={30} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Activate Your Stay</h2>
            <p className="text-[#4B4B4B] mb-6 max-w-sm">
              {hasPaidFirstRent
                ? (hasApprovedMoveIn
                    ? "Move-In approved by owner."
                    : "Payment completed. Waiting for owner move-in approval.")
                : "Your room is reserved. Please pay the first month's rent to enable Move-In and notify the owner."}
            </p>
            <CButton
              onClick={handleMoveIn}
              disabled={disableMoveInPay}
              className={`max-w-md w-full py-4 text-lg font-bold shadow-md ${disableMoveInPay ? "bg-gray-400 hover:bg-gray-400 border-gray-400" : ""}`}
            >
              {hasPaidFirstRent ? "Payment Completed" : "Pay Rent & Move-In"}
            </CButton>
            {hasPaidFirstRent && !hasApprovedMoveIn && (
              <CButton
                onClick={handleRequestMoveIn}
                className="max-w-md w-full py-4 text-lg font-bold mt-3"
              >
                Request Move-In
              </CButton>
            )}
            <CButton
              onClick={handleMoveOut}
              disabled={!canRequestMoveOut}
              className={`max-w-md w-full py-4 text-lg font-bold mt-3 ${
                !canRequestMoveOut ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""
              }`}
            >
              Request Move-Out
            </CButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CALENDAR */}
          <div className="lg:col-span-7 bg-white rounded-md shadow-sm border border-primary p-4 sm:p-6">
            <h3 className="pb-4 font-bold text-lg uppercase text-[#4B4B4B] flex items-center gap-2">
               <FaCalendarCheck className=" text-lg text-[#D97706]"/> Stay Calendar
            </h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              className="w-full border-none"
            />
          </div>

          {/* HISTORY */}
          <div className="lg:col-span-5 bg-white rounded-md shadow-sm border border-primary flex flex-col h-[450px]">
            <div className="p-4 border-b border-[#E5E0D9] font-bold uppercase tracking-widest text-lg flex items-center gap-2">
              <FaHistory className=" text-lg text-[#D97706]" /> Previous Stay Records
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-grow custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-24">
                  <FaClock className="mx-auto text-[#E5E0D9] mb-2" size={40} />
                  <p className="text-[#4B4B4B] text-sm font-bold uppercase tracking-tighter">No History Found</p>
                </div>
              ) : (
                history.map((entry) => (
                   <div key={entry._id} className="border-l-4 border-[#1C1C1C] bg-gray-50 p-4 rounded-r-lg flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-md bg-[#FEF3C7] text-[#D97706]">
                            <FaClock size={12}/>
                         </div>
                         <div>
                            <p className="font-bold">{entry.pgName || "Nadiad PG"}</p>
                            <p className="text-[11px] text-[#4B4B4B]">{entry.title || "Stay Update"}</p>
                            <p className="text-sm text-[#4B4B4B]">{entry.date || "2026-02-15"}{entry.time ? `, ${entry.time}` : ""}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#E5E0D9]">
                        {entry.status || "Completed"}
                      </span>
                   </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar { width: 100% !important; border: none !important; font-family: inherit; }
        .transparent-black-tile { background: #D97706 !important; color: white !important; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E0D9; border-radius: 10px; }
        .react-calendar__tile--now { background: #FEF3C7 !important; color: #D97706 !important; font-weight: bold; border-radius: 8px; }
        .react-calendar__tile--active { background: #1C1C1C !important; color: #fff !important; border-radius: 8px; }
        .react-calendar__navigation button:enabled:hover { background-color: #FEF3C7; border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default CheckIns;





