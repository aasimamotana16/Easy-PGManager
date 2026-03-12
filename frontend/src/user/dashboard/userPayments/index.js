import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FaHistory, FaDownload, FaWallet, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import PayNowButton from '../../../components/payNowButton';
import Swal from "sweetalert2";
import { API_BASE } from "../../../config/apiBaseUrl";

const Payments = () => {
  const [paymentData, setPaymentData] = useState({ nextPayment: null, totalPaid: 0, history: [], lateFine: 0, moveOutCompleted: false });
  const [loading, setLoading] = useState(true);
  const [isProcessing] = useState(false);
  const [stayStatus, setStayStatus] = useState(null);
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [extensionApproved, setExtensionApproved] = useState(false);
  const location = useLocation();
  const queryBookingId = new URLSearchParams(location.search).get("bookingId");
  const [intentType, setIntentType] = useState(null);
  const [intentAmount, setIntentAmount] = useState(null);

  // Your specific color theme
  const colors = {
    primary: "#D97706",
    primaryDark: "#B45309",
    primarySoft: "#FEF3C7",
    backgroundDark: "#1F1F1F",
    textPrimary: "#1C1C1C",
    textSecondary: "#4B4B4B",
    border: "#E5E0D9"
  };

  useEffect(() => {
    fetchPaymentDetails();
    fetchAgreementStatus();
    if (location?.state?.type) {
      setIntentType(location.state.type);
      if (location.state.amount) setIntentAmount(location.state.amount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgreementStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/users/agreement`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data) {
        setStayStatus(data.data.status);
        setAgreementInfo(data.data);
        setExtensionApproved(Boolean(data.data.extensionApproved || data.data.extensionStatus === 'Approved'));
      }
    } catch (e) {
      console.error('Agreement fetch error', e);
    }
  };

  const fetchPaymentDetails = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const statsUrl = queryBookingId
        ? `${API_BASE}/payments/user-stats?bookingId=${encodeURIComponent(queryBookingId)}`
        : `${API_BASE}/payments/user-stats`;
      const response = await fetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setPaymentData({ 
          nextPayment: data.nextPayment, 
          totalPaid: data.totalPaid, 
          history: data.history, 
          lateFine: data.lateFine || 0,
          moveOutCompleted: Boolean(data.moveOutCompleted)
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token || !payment?.id) {
        Swal.fire({
          title: "Receipt Unavailable",
          text: "Payment receipt could not be generated.",
          icon: "warning",
          confirmButtonColor: colors.primary
        });
        return;
      }

      const response = await fetch(`${API_BASE}/payments/receipt/${payment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to download receipt");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeMonth = String(payment.month || "payment").replace(/\s+/g, "_");
      link.href = url;
      link.download = `Receipt_${safeMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        title: "Download Failed",
        text: "Unable to download receipt right now.",
        icon: "error",
        confirmButtonColor: colors.primary
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // Derived Logic for UI
  const today = new Date();
  const todayDateOnly = new Date(today);
  todayDateOnly.setHours(0, 0, 0, 0);
  const agreementEnd = agreementInfo && agreementInfo.endDate ? new Date(agreementInfo.endDate) : null;
  const agreementExpired = agreementEnd ? agreementEnd < today : false;
  
  // Logic: Use intent amount (from link) or calculated due amount
  const baseDue = Number(paymentData.nextPayment?.amount || 0);
  const selectedBaseDue = paymentData.moveOutCompleted ? 0 : (intentAmount != null ? Number(intentAmount) : baseDue);
  const totalDue = selectedBaseDue + Number(paymentData.lateFine || 0);
  const disablePayActions = !Number.isFinite(totalDue) || totalDue <= 0;

  const derivedMoveInIntentType = (() => {
    const rentDue = Number(paymentData.nextPayment?.rentDue || 0);
    const depositDue = Number(paymentData.nextPayment?.securityDepositDue || 0);
    if (depositDue > 0 && rentDue <= 0) return 'DEPOSIT_ONLY';
    if (rentDue > 0 && depositDue <= 0) return 'RENT_ONLY';
    if (rentDue > 0 && depositDue > 0) return 'RENT_AND_DEPOSIT';
    return 'MOVE_IN_PAYMENT';
  })();

  const isMoveInRentDueOnly =
    stayStatus !== 'Active' &&
    Number(paymentData.nextPayment?.rentDue || 0) > 0 &&
    Number(paymentData.nextPayment?.securityDepositDue || 0) <= 0;

  const payNowLabel = isMoveInRentDueOnly ? 'PAY RENT & MOVE-IN' : 'PAY NOW';

  let showPayNow = false;
  let showExtendStay = false;

  if (paymentData.moveOutCompleted) {
    // After owner confirms move-out: keep Pay Now visible but disabled with ₹0.
    showPayNow = true;
    showExtendStay = false;
  } else if (agreementExpired) {
    if (extensionApproved || totalDue > 0) {
      showPayNow = true;
    } else {
      showExtendStay = true;
    }
  } else if (stayStatus === 'Active') {
    if (totalDue > 0) showPayNow = true;
    showExtendStay = true;
  } else {
    // If not active and no specific logic, default to Move-in check
    showPayNow = totalDue > 0;
  }

  const currentMonthLabel = today.toLocaleString("en-US", { month: "short", year: "numeric" });
  const paidRecently = Array.isArray(paymentData.history)
    ? paymentData.history.some((p) => (
        String(p?.status || "").toLowerCase() === "paid" &&
        String(p?.month || "").trim() === currentMonthLabel
      ))
    : false;

  const dayMs = 24 * 60 * 60 * 1000;
  const dueDateMsRaw = paymentData.nextPayment?.dueDateMs;
  const dueDateMs = Number.isFinite(Number(dueDateMsRaw))
    ? Number(dueDateMsRaw)
    : (paymentData.nextPayment?.dueDate ? new Date(paymentData.nextPayment.dueDate).setHours(0, 0, 0, 0) : NaN);
  const extensionWindowStartMs = Number.isFinite(dueDateMs) ? (dueDateMs - 2 * dayMs) : NaN;
  const todayMs = todayDateOnly.getTime();
  const showPaymentExtensionRequest =
    !paymentData.moveOutCompleted &&
    stayStatus === 'Active' &&
    totalDue > 0 &&
    Number.isFinite(dueDateMs) &&
    todayMs <= dueDateMs;
  const enablePaymentExtensionRequest =
    showPaymentExtensionRequest &&
    Number.isFinite(extensionWindowStartMs) &&
    todayMs >= extensionWindowStartMs;

  const handleRequestPaymentExtension = async () => {
    if (!Number.isFinite(dueDateMs)) {
      Swal.fire({
        title: 'Unavailable',
        text: 'Due date not available for extension request.',
        icon: 'warning',
        confirmButtonColor: colors.primary
      });
      return;
    }

    const defaultDate = new Date(dueDateMs);
    const defaultYmd = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const minYmd = new Date(todayDateOnly.getTime() - todayDateOnly.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    const result = await Swal.fire({
      title: 'Request Payment Extension',
      html: `
        <div style="text-align:left;">
          <label style="font-size:12px;font-weight:600;">Extend till date</label>
          <input id="ext-date" type="date" min="${minYmd}" value="${defaultYmd}" class="swal2-input" />
          <label style="font-size:12px;font-weight:600;display:block;margin-top:10px;">Reason</label>
          <textarea id="ext-reason" class="swal2-textarea" placeholder="Reason (required)"></textarea>
          <p style="font-size:11px;color:#B45309;">Late fine is ₹100/day and will pause till selected date (subject to approval).</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      preConfirm: () => {
        const untilDate = document.getElementById('ext-date')?.value;
        const reason = String(document.getElementById('ext-reason')?.value || '').trim();
        if (!untilDate) {
          Swal.showValidationMessage('Please select extension date');
          return null;
        }
        if (!reason) {
          Swal.showValidationMessage('Please enter a reason');
          return null;
        }
        return { untilDate, reason };
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      const token = localStorage.getItem('userToken');
      const resp = await fetch(`${API_BASE}/users/request-extension`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(result.value)
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to request extension');
      }
      Swal.fire({
        title: 'Request Sent',
        text: data?.message || 'Extension request submitted',
        icon: 'success',
        confirmButtonColor: colors.primary
      });
      fetchPaymentDetails();
    } catch (e) {
      Swal.fire({
        title: 'Error',
        text: e?.message || 'Failed to request extension',
        icon: 'error',
        confirmButtonColor: colors.primary
      });
    }
  };

  const monthLabel = paymentData.nextPayment?.month || 'Current Cycle';
  const dueDateLabel = paymentData.nextPayment?.dueDate || 'N/A';
  const statusLabel = stayStatus ? stayStatus.toUpperCase() : 'UNKNOWN';

  return (
    <div className="p-4 sm:p-8 bg-gray-200 min-h-screen space-y-6">
      <header>
        <h2 className="" style={{ color: colors.textPrimary }}>Payments & Invoices</h2>
        <h3 style={{ color: colors.primary }}>Track your rent cycle and receipts.</h3>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Due Card */}
        <div className="md:col-span-2 p-8 rounded-md shadow-lg border-b-4 flex flex-col justify-between" style={{ backgroundColor: colors.backgroundDark, borderColor: colors.primary }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold uppercase text-xs" style={{ color: colors.primary }}>{paidRecently ? 'Next Due' : 'Current Due'}</p>
              <h2 className="text-5xl font-black mt-1 text-white">₹{totalDue}</h2>

              {paymentData.lateFine > 0 && (
                <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1">
                  <FaExclamationTriangle /> Includes Late Fine: â‚¹{paymentData.lateFine}
                </p>
              )}
              {Number(paymentData.nextPayment?.securityDepositDue || 0) > 0 && (
                <p className="text-orange-300 text-xs mt-1 font-bold">
                  Includes Security Deposit: â‚¹{Number(paymentData.nextPayment?.securityDepositDue || 0)}
                </p>
              )}
            </div>
            <FaWallet className="text-3xl" style={{ color: colors.primary }} />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="text-white">
              <p className="text-sm opacity-80">Rent for {monthLabel}</p>
              <p className="text-xs uppercase font-bold">Due Date: {dueDateLabel}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {showPayNow && (
                <PayNowButton 
                  amount={totalDue} 
                  pgId={paymentData.nextPayment?.pgId || ""} 
                  bookingId={queryBookingId || paymentData.nextPayment?.bookingId || ""}
                  intentType={intentType || (stayStatus === 'Active' ? "MONTHLY_RENT" : derivedMoveInIntentType)} 
                  disabled={disablePayActions}
                  className="px-8 py-3 rounded-md font-bold text-white shadow-lg transition-transform active:scale-95"
                  style={{ backgroundColor: colors.primary }}
                  onSuccess={() => { fetchPaymentDetails(); fetchAgreementStatus(); }}
                >
                  {isProcessing ? "PROCESSING..." : payNowLabel}
                </PayNowButton>
              )}

              {showPaymentExtensionRequest && (
                <CButton
                  onClick={handleRequestPaymentExtension}
                  disabled={!enablePaymentExtensionRequest}
                  className={`px-6 py-3 rounded-md font-bold shadow-lg transition-transform active:scale-95 ${
                    enablePaymentExtensionRequest
                      ? 'text-white'
                      : 'bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed text-white'
                  }`}
                  style={enablePaymentExtensionRequest ? { backgroundColor: colors.primary } : undefined}
                >
                  REQUEST EXTENSION
                </CButton>
              )}

              {showExtendStay && (
                <CButton 
                  onClick={() => Swal.fire({ 
                    title: 'Extend Stay', 
                    text: 'Would you like to request an extension for your stay?', 
                    icon: 'question',
                    showCancelButton: true, 
                    confirmButtonColor: colors.primary 
                  })} 
                  style={{ backgroundColor: totalDue > 0 ? 'transparent' : colors.primary, border: totalDue > 0 ? `1px solid ${colors.primary}` : 'none' }}
                  className={`px-8 py-3 rounded-md ${totalDue > 0 ? 'text-[#D97706]' : 'text-white'}`}
                >
                  EXTEND STAY
                </CButton>
              )}

              {!showPayNow && !showExtendStay && stayStatus !== 'Active' && (
                <PayNowButton 
                  amount={totalDue} 
                  pgId={paymentData.nextPayment?.pgId || ""} 
                  bookingId={queryBookingId || paymentData.nextPayment?.bookingId || ""}
                  intentType={derivedMoveInIntentType}
                  disabled={disablePayActions}
                  className="px-8 py-3 rounded-md font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                  onSuccess={() => { fetchPaymentDetails(); fetchAgreementStatus(); }}
                >
                  {stayStatus === 'Pending' ? "AWAITING CONFIRMATION" : (isMoveInRentDueOnly ? "PAY RENT & MOVE-IN" : "PAY & MOVE-IN")}
                </PayNowButton>
              )}
            </div>
          </div>
        </div>

        {/* Lifetime Stats Card */}
        <div className="bg-white p-8 rounded-md border flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: colors.border }}>
          <FaCheckCircle className="text-4xl mb-3" style={{ color: colors.primary }} />
          <p className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Lifetime Paid</p>
          <p className="text-3xl font-black" style={{ color: colors.textPrimary }}>₹{paymentData.totalPaid}</p>
          <div className="mt-4 px-4 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: colors.primary, color: colors.primary }}>
            STATUS: {statusLabel}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden" style={{ borderColor: colors.border }}>
        <div className="p-6 border-b flex items-center gap-2" style={{ borderColor: colors.border }}>
          <FaHistory style={{ color: colors.primary }} />
          <h3 className="font-bold">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold bg-gray-50 border-b" style={{ color: colors.textSecondary }}>
                <th className="p-5">Month</th>
                <th className="p-5">Date</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.history.length > 0 ? (
                paymentData.history.map((pay) => (
                  <tr key={pay.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-bold">{pay.month}</td>
                    <td className="p-5 text-sm" style={{ color: colors.textSecondary }}>{pay.date}</td>
                    <td className="p-5 font-black">₹{pay.amount}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                        pay.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => handleDownloadReceipt(pay)} style={{ color: colors.primary }} className="p-2 hover:bg-orange-50 rounded-full transition-all">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">No payment history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
