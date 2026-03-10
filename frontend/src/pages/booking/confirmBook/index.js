import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";
import {
  CheckCircleIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

const ConfirmBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCancelling, setIsCancelling] = useState(false);

  const bookingData = location.state?.bookingData;

  const bookingIdentifier = useMemo(() => {
    // Prefer DB booking id from state, fallback to route param.
    return String(bookingData?._id || bookingData?.bookingId || id || "").trim();
  }, [bookingData, id]);

  useEffect(() => {
    if (!bookingData) {
      navigate(`/book/${id}`, { replace: true });
    }
  }, [bookingData, id, navigate]);

  if (!bookingData) return null;

  const checkInLabel = bookingData.stayDetails?.checkIn || bookingData.checkInDate || "N/A";
  const checkOutLabel = bookingData.stayDetails?.checkOut || bookingData.checkOutDate || "Long Term";
  const membersCount = bookingData.members?.length || bookingData.seatsBooked || 1;
  const rentLabel = bookingData.totalRent || bookingData.rentAmount || 0;

  const bookingStatusRaw = String(
    bookingData.status || bookingData.bookingStatus || bookingData.state || ""
  );
  const bookingStatus = bookingStatusRaw.toLowerCase();
  const isBookingConfirmed =
    bookingStatus.includes("confirmed") ||
    bookingStatus.includes("active") ||
    bookingStatus.includes("approved") ||
    bookingData.isConfirmed === true;

  const cancelStatus = String(bookingData?.cancelRequest?.status || "").trim();
  const cancelRequested = Boolean(bookingData?.cancelRequest?.requested);
  const isCancelPending = cancelRequested && cancelStatus.toLowerCase() === "pending";
  const isCancelled = String(bookingData?.status || "") === "Cancelled";

  const handleCancelBooking = async () => {
    if (!bookingIdentifier) {
      Swal.fire({
        title: "Booking Missing",
        text: "Booking id not found. Please open the booking from your dashboard and try again.",
        icon: "warning",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      Swal.fire({
        title: "Session Expired",
        text: "Please login again.",
        icon: "warning",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    let estimateNoteHtml = '';
    try {
      const estimateResp = await fetch(
        `http://localhost:5000/api/bookings/${encodeURIComponent(bookingIdentifier)}/cancellation-estimate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const estimateJson = await estimateResp.json();
      if (estimateResp.ok && estimateJson?.success && estimateJson?.data) {
        const est = estimateJson.data;
        const refundable = Number(est.refundableAmount || 0);
        const nonRefundableCommission = Number(est.nonRefundableCommissionAmount || 0);
        const noShowDeduction = Number(est.noShowDeductionAmount || 0);
        estimateNoteHtml = `
          <div style="margin-top:10px;padding:10px;border:1px dashed #D97706;border-radius:8px;background:#FEF3C7;">
            <div style="font-size:12px;font-weight:700;color:#1C1C1C;">Estimated Refund</div>
            <div style="font-size:12px;color:#4B4B4B;margin-top:4px;">Refundable: <b>₹${refundable.toLocaleString()}</b></div>
            <div style="font-size:11px;color:#4B4B4B;margin-top:4px;">Non-refundable commission: ₹${nonRefundableCommission.toLocaleString()}</div>
            ${noShowDeduction > 0 ? `<div style="font-size:11px;color:#4B4B4B;margin-top:4px;">No-show deduction: ₹${noShowDeduction.toLocaleString()}</div>` : ''}
            ${est.refundRule ? `<div style="font-size:11px;color:#4B4B4B;margin-top:6px;">Rule: <b>${String(est.refundRule)}</b></div>` : ''}
          </div>
        `;
      }
    } catch (_) {
      // ignore estimate failures
    }

    const result = await Swal.fire({
      title: "Cancel Booking?",
      html: `
        <div style="text-align:left;">
          <label style="font-size:12px;font-weight:600;">Reason</label>
          <select id="cancel-reason" class="swal2-input" style="width:100%;">
            <option value="">Select reason</option>
            <option value="Change of plans">Change of plans</option>
            <option value="Found another PG">Found another PG</option>
            <option value="Budget issue">Budget issue</option>
            <option value="Other">Other</option>
          </select>
          <label style="font-size:12px;font-weight:600;display:block;margin-top:10px;">Other reason (optional)</label>
          <textarea id="cancel-other" class="swal2-textarea" placeholder="Write a short note (optional)"></textarea>
          <p style="font-size:11px;color:#4B4B4B;margin-top:10px;">This will send a cancellation request to the owner for approval.</p>
          ${estimateNoteHtml}
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Send Request",
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      preConfirm: () => {
        const reason = String(document.getElementById("cancel-reason")?.value || "").trim();
        const otherReason = String(document.getElementById("cancel-other")?.value || "").trim();
        if (!reason) {
          Swal.showValidationMessage("Please select a reason");
          return null;
        }
        return { reason, otherReason };
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      setIsCancelling(true);
      const resp = await fetch(`http://localhost:5000/api/bookings/${encodeURIComponent(bookingIdentifier)}/request-cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(result.value)
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || "Failed to request cancellation");
      }
      Swal.fire({
        title: "Request Sent",
        text: data?.message || "Cancellation request sent to owner for approval.",
        icon: "success",
        confirmButtonColor: "#D97706"
      }).then(() => navigate("/Home"));
    } catch (e) {
      Swal.fire({
        title: "Failed",
        text: e?.message || "Unable to request cancellation right now.",
        icon: "error",
        confirmButtonColor: "#D97706"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircleIcon className="h-10 w-10 md:h-12 md:w-12 text-primary animate-bounce-short" />
            <h1 className="text-h2-sm md:text-h2 font-bold text-textPrimary">
              {isBookingConfirmed ? "Booking Confirmed!" : "Request Sent!"}
            </h1>
          </div>
          <p className="text-textSecondary text-body-sm lg:text-body">
            {isBookingConfirmed ? (
              <>
                Pack your bags! Your stay at{" "}
                <span className="font-semibold text-textPrimary">{bookingData.pgName || "the PG"}</span> is all set.
              </>
            ) : (
              <>
                Your request has been sent. Please wait for booking confirmation for{" "}
                <span className="font-semibold text-textPrimary">{bookingData.pgName || "the PG"}</span>.
              </>
            )}
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="bg-primary px-6 py-4">
            <h2 className="text-textLight font-medium flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primarySoft" />
              Booking Summary
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <UserGroupIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Guests</p>
                  <p className="text-textPrimary font-medium">{membersCount} Member(s)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Total Rent</p>
                  <p className="text-textPrimary font-medium">Rs {rentLabel} / month</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2 border-t pt-4 border-border">
                <CalendarIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Stay Period</p>
                  <p className="text-textPrimary font-medium">
                    {checkInLabel} - {checkOutLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CButton
            text="Go to Home"
            className="w-full bg-primary hover:bg-primaryDark text-textLight shadow-md py-3"
            onClick={() => navigate("/Home")}
          />

          <div className="flex flex-col sm:flex-row gap-4">
          

            <button
              onClick={handleCancelBooking}
              disabled={isCancelling || isCancelPending || isCancelled}
              className="flex-1 py-3 px-4 border border-primarySoft rounded-md text-primaryDark hover:bg-primarySoft transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCancelled ? "Booking Cancelled" : isCancelPending ? "Cancellation Requested" : (isCancelling ? "Sending..." : "Cancel Booking")}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default ConfirmBooking;
