import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";
import { requestExtension, requestMoveIn, requestMoveOut } from "../../../api/api";
import { API_BASE } from "../../../config/apiBaseUrl";
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
  const [currentBooking, setCurrentBooking] = useState(null);
  const [systemState, setSystemState] = useState("INACTIVE");
  
  // States for Stay Management
  // Possible statuses: "Reserved" (only deposit paid), "PendingConfirmation" (rent paid, waiting for owner), "Active"
  const [stayStatus, setStayStatus] = useState("Reserved"); 
  const [joiningDate, setJoiningDate] = useState(null);
  const [rentAmount, setRentAmount] = useState(0);
  const [hasPaidFirstRent, setHasPaidFirstRent] = useState(false);
  const [hasApprovedMoveIn, setHasApprovedMoveIn] = useState(false);
  const [hasRequestedMoveIn, setHasRequestedMoveIn] = useState(false);
  const [securityDepositAmount, setSecurityDepositAmount] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [lastPaymentDate, setLastPaymentDate] = useState(null);
  const [moveOutCompleted, setMoveOutCompleted] = useState(false);
  const authToken = localStorage.getItem("userToken");

  const hasActiveBooking = Boolean(
    currentBooking &&
    (currentBooking._id || currentBooking.bookingDbId || currentBooking.bookingId || currentBooking.pgId)
  );

  const cancelStatus = String(currentBooking?.cancelRequest?.status || "").trim().toLowerCase();
  const cancelRequested = Boolean(currentBooking?.cancelRequest?.requested);
  const isCancelPending = cancelRequested && (cancelStatus === "pending" || !cancelStatus);
  const isBookingCancelled = String(currentBooking?.bookingState || currentBooking?.status || "").trim().toLowerCase() === "cancelled";

  // Allow move-out request only after move-in is confirmed/approved.
  // This matches the product rule: move-out only from an active/approved stay.
  const canRequestMoveOut = hasPaidFirstRent && hasApprovedMoveIn;
  const disableMoveInPay = hasPaidFirstRent || !Number.isFinite(Number(rentAmount)) || Number(rentAmount) <= 0;
  const disableAllActions = moveOutCompleted;

  useEffect(() => {
    if (authToken) {
      fetchCheckInHistory();
      fetchStayDetails();
    }
  }, [authToken]);

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

  const fetchCancellationEstimate = async (bookingIdentifier) => {
    if (!bookingIdentifier) return null;
    try {
      const res = await axios.get(
        `${API_BASE}/bookings/${encodeURIComponent(bookingIdentifier)}/cancellation-estimate`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (res.data?.success) return res.data?.data;
      return null;
    } catch (_) {
      return null;
    }
  };

  const deriveSystemState = (bookingLike) => {
    const booking = bookingLike || {};
    const isMoveInApproved = Boolean(booking.hasApprovedMoveIn);
    const isDepositPaid = Boolean(booking.securityDepositPaid);
    const isRentPaid = Boolean(booking.initialRentPaid);
    const requestedMoveIn = Boolean(booking.hasRequestedMoveIn);

    const checkIn = booking.checkInDate ? new Date(booking.checkInDate) : null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const checkInStart = checkIn && !Number.isNaN(checkIn.getTime()) ? new Date(checkIn) : null;
    if (checkInStart) checkInStart.setHours(0, 0, 0, 0);

    const isNoShow =
      Boolean(checkInStart) &&
      todayStart.getTime() > checkInStart.getTime() &&
      !isMoveInApproved &&
      !requestedMoveIn;

    if (isMoveInApproved) return "ACTIVE_STAY";
    if (isNoShow) return "NO_SHOW";
    if (isDepositPaid && isRentPaid) return "MOVE_IN_PENDING";
    if (isDepositPaid && !isRentPaid) return "RESERVED";
    return "INACTIVE";
  };

  const fetchStayDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/dashboard-stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.data?.success || !res.data?.data) return;
      const data = res.data.data;
      const booking = data.currentBooking || {};
      const nextPayment = data.nextPayment || {};
      const isMoveOutCompleted = Boolean(data.moveOutCompleted);
      const bookingStatus = String(booking.status || "").toLowerCase();
      const bookingPaid = Boolean(
        booking.moveInDuesPaid ||
        (booking.initialRentPaid && booking.securityDepositPaid)
      );
      const moveInApproved = Boolean(booking.hasApprovedMoveIn);

      setCurrentBooking(booking);
      setMoveOutCompleted(isMoveOutCompleted);
      setHasRequestedMoveIn(Boolean(booking.hasRequestedMoveIn));
      setSecurityDepositAmount(Number(booking.securityDepositAmount || 0));
      setCheckInDate(booking.checkInDate ? new Date(booking.checkInDate) : null);
      setLastPaymentDate(booking.lastPaymentDate ? new Date(booking.lastPaymentDate) : null);

      const derivedRent = Number(nextPayment.amount || booking.monthlyRent || 0);
      setRentAmount(derivedRent);
      setHasPaidFirstRent(bookingPaid);
      setHasApprovedMoveIn(moveInApproved);

      setSystemState(isMoveOutCompleted ? "MOVED_OUT" : deriveSystemState(booking));

      if (isMoveOutCompleted) {
        setStayStatus("MovedOut");
      } else if (bookingStatus === "active") {
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

  const requestCancel = async (reasonLabel) => {
    const bookingLike = currentBooking || {};
    const identifier = bookingLike._id || bookingLike.bookingDbId;
    if (!identifier) {
      Swal.fire({
        title: "No Active Booking",
        text: "Could not find an active booking to cancel.",
        icon: "info",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    if (isBookingCancelled) {
      Swal.fire({
        title: "Already Cancelled",
        text: "This booking is already cancelled.",
        icon: "info",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    if (isCancelPending) {
      Swal.fire({
        title: "Cancellation Already Requested",
        text: "Your cancellation request is already pending owner approval.",
        icon: "info",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    try {
      const resp = await axios.put(
        `${API_BASE}/bookings/${identifier}/request-cancel`,
        { reason: reasonLabel, otherReason: "" },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (resp.data?.success) {
        Swal.fire({
          title: "Cancellation Requested",
          text: "Your cancellation request has been sent to the owner for approval.",
          icon: "success",
          confirmButtonColor: "#D97706"
        });
        fetchStayDetails();
      } else {
        Swal.fire({
          title: "Error",
          text: resp.data?.message || "Failed to request cancellation.",
          icon: "error",
          confirmButtonColor: "#D97706"
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to request cancellation.",
        icon: "error",
        confirmButtonColor: "#D97706"
      });
    }
  };

  const handleCancelReservation = async () => {
    const bookingLike = currentBooking || {};
    const identifier = bookingLike._id || bookingLike.bookingDbId;
    const estimate = await fetchCancellationEstimate(identifier);
    const estimateHtml = estimate ? formatEstimateHtml(estimate) : "<p style=\"text-align:left;\">Refund estimate is not available right now.</p>";

    const result = await Swal.fire({
      title: "Cancel Reservation?",
      html: estimateHtml,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancel Reservation",
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await requestCancel("Cancel Reservation");
    }
  };

  const handleCancelMoveIn = async () => {
    const bookingLike = currentBooking || {};
    const identifier = bookingLike._id || bookingLike.bookingDbId;
    const estimate = await fetchCancellationEstimate(identifier);
    const estimateHtml = estimate ? formatEstimateHtml(estimate) : "<p style=\"text-align:left;\">Refund estimate is not available right now.</p>";

    const result = await Swal.fire({
      title: "Cancel Move-In?",
      html: estimateHtml,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancel Move-In",
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await requestCancel("Cancel Move-In");
    }
  };

  const fetchCheckInHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/my-checkins`, {
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
      html: `You need to clear move-in dues of <b>Rs. ${rentAmount}</b> (rent/deposit as applicable) to activate your stay.<br><br><small>You will be redirected to the secure payment page.</small>`,
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
        // Disable the button immediately after requesting move-in
        setHasRequestedMoveIn(true);
        Swal.fire({
          title: "Move-In Requested",
          text: "Your move-in request is sent. Owner approval is required.",
          icon: "success",
          confirmButtonColor: "#D97706"
        });
        fetchStayDetails();
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
        text: "You can request move-out only after your move-in is confirmed by the owner.",
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
              {systemState === "MOVED_OUT"
                ? "Move-out completed by owner. Your current PG details are cleared."
                : systemState === "ACTIVE_STAY"
                ? "Move-In approved by owner."
                : systemState === "MOVE_IN_PENDING"
                  ? "Rent + deposit paid. Request move-in to proceed, or cancel move-in if needed."
                  : systemState === "RESERVED"
                    ? "Your room is reserved. Pay rent at move-in, or cancel reservation." 
                    : systemState === "NO_SHOW"
                      ? "No-show recorded (move-in not requested before check-in date)."
                      : "No active stay found."}
            </p>

            <div className="w-full max-w-4xl">
              {/* Mobile: stacked. Desktop: aligned horizontally. */}
              {systemState === "RESERVED" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <CButton
                    onClick={handleMoveIn}
                      disabled={disableAllActions || disableMoveInPay || !hasActiveBooking}
                      className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${(disableAllActions || disableMoveInPay || !hasActiveBooking) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""}`}
                  >
                    Pay Rent & Move-In
                  </CButton>
                  <CButton
                    onClick={handleCancelReservation}
                      disabled={disableAllActions || !hasActiveBooking}
                      className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${(disableAllActions || !hasActiveBooking) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""}`}
                  >
                    Cancel Reservation
                  </CButton>
                  <CButton
                    onClick={handleMoveOut}
                      disabled={disableAllActions || !hasActiveBooking || !canRequestMoveOut}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${
                        (disableAllActions || !hasActiveBooking || !canRequestMoveOut) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""
                    }`}
                  >
                    Request Move-Out
                  </CButton>
                </div>
              )}

              {systemState === "MOVE_IN_PENDING" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <CButton
                    onClick={handleRequestMoveIn}
                    disabled={disableAllActions || !hasActiveBooking || hasRequestedMoveIn}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${(disableAllActions || !hasActiveBooking) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""}`}
                  >
                    Request Move-In
                  </CButton>
                  <CButton
                    onClick={handleCancelMoveIn}
                    disabled={disableAllActions || !hasActiveBooking}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${(disableAllActions || !hasActiveBooking) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""}`}
                  >
                    Cancel Move-In
                  </CButton>
                  <CButton
                    onClick={handleMoveOut}
                    disabled={disableAllActions || !hasActiveBooking || !canRequestMoveOut}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${
                      (disableAllActions || !hasActiveBooking || !canRequestMoveOut) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""
                    }`}
                  >
                    Request Move-Out
                  </CButton>
                </div>
              )}

              {systemState !== "RESERVED" && systemState !== "MOVE_IN_PENDING" && systemState !== "ACTIVE_STAY" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <CButton
                    onClick={handleMoveIn}
                    disabled={disableAllActions || disableMoveInPay || !hasActiveBooking}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${(disableAllActions || disableMoveInPay || !hasActiveBooking) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""}`}
                  >
                    Pay Rent & Move-In
                  </CButton>
                  <CButton
                    onClick={handleMoveOut}
                    disabled={disableAllActions || !hasActiveBooking || !canRequestMoveOut}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${
                      (disableAllActions || !hasActiveBooking || !canRequestMoveOut) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""
                    }`}
                  >
                    Request Move-Out
                  </CButton>
                </div>
              )}

              {systemState === "ACTIVE_STAY" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <CButton
                    onClick={handleMoveOut}
                    disabled={disableAllActions || !hasActiveBooking || !canRequestMoveOut}
                    className={`w-full flex-1 py-4 lg:py-4 text-lg shadow-md ${
                      (disableAllActions || !hasActiveBooking || !canRequestMoveOut) ? "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed" : ""
                    }`}
                  >
                    Request Move-Out
                  </CButton>
                </div>
              )}

              <div className="mt-5 w-full rounded-md border border-[#E5E0D9] bg-gray-50 p-4 text-left">
                <p className="text-sm font-bold text-[#1C1C1C]">Note:</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-[#4B4B4B] space-y-1">
                  <li>If move-in is not completed before the check-in date, the booking will be marked as No-Show.</li>
                  <li>In No-Show cases, 15% of the security deposit will be deducted as a reservation fee.</li>
                  <li>The remaining 85% of the deposit will be refunded after booking cancellation processing.</li>
                </ul>
              </div>
            </div>
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





