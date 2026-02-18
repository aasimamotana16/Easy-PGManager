import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FaHistory, FaDownload, FaWallet, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import PayNowButton from '../../../components/payNowButton';
import Swal from "sweetalert2";

const Payments = () => {
  const [paymentData, setPaymentData] = useState({ nextPayment: null, totalPaid: 0, history: [], lateFine: 0 });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stayStatus, setStayStatus] = useState(null);
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [extensionApproved, setExtensionApproved] = useState(false);
  const location = useLocation();
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
      const res = await fetch('http://localhost:5000/api/users/agreement', { headers: { Authorization: `Bearer ${token}` } });
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
      const response = await fetch("http://localhost:5000/api/payments/user-stats", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setPaymentData({ 
          nextPayment: data.nextPayment, 
          totalPaid: data.totalPaid, 
          history: data.history, 
          lateFine: data.lateFine || 0 
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // Derived Logic for UI
  const today = new Date();
  const agreementEnd = agreementInfo && agreementInfo.endDate ? new Date(agreementInfo.endDate) : null;
  const agreementExpired = agreementEnd ? agreementEnd < today : false;
  
  // Logic: Use intent amount (from link) or calculated due amount
  const baseDue = paymentData.nextPayment?.amount || 0;
  const totalDue = (intentAmount != null ? intentAmount : baseDue) + (paymentData.lateFine || 0);

  let showPayNow = false;
  let showExtendStay = false;

  if (agreementExpired) {
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

  const monthLabel = paymentData.nextPayment?.month || 'Current Cycle';
  const dueDateLabel = paymentData.nextPayment?.dueDate || 'N/A';
  const statusLabel = stayStatus ? stayStatus.toUpperCase() : 'UNKNOWN';

  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen space-y-6">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Payments & Invoices</h1>
        <p style={{ color: colors.textSecondary }}>Track your rent cycle and receipts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Due Card */}
        <div className="md:col-span-2 p-8 rounded-md shadow-lg border-b-4 flex flex-col justify-between" style={{ backgroundColor: colors.backgroundDark, borderColor: colors.primary }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold uppercase text-xs" style={{ color: colors.primary }}>Current Due</p>
              <h2 className="text-5xl font-black mt-1 text-white">₹{totalDue}</h2>
              {paymentData.lateFine > 0 && (
                <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1">
                  <FaExclamationTriangle /> Includes Late Fine: ₹{paymentData.lateFine}
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
                  intentType={intentType || (stayStatus === 'Active' ? "MONTHLY_RENT" : "MOVE_IN_PAYMENT")} 
                  className="px-8 py-3 rounded-md font-bold text-white shadow-lg transition-transform active:scale-95"
                  style={{ backgroundColor: colors.primary }}
                  onSuccess={() => { fetchPaymentDetails(); fetchAgreementStatus(); }}
                >
                  {isProcessing ? "PROCESSING..." : "PAY NOW"}
                </PayNowButton>
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
                  intentType="MOVE_IN_PAYMENT"
                  className="px-8 py-3 rounded-md font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                  onSuccess={() => { fetchPaymentDetails(); fetchAgreementStatus(); }}
                >
                  {stayStatus === 'Pending' ? "AWAITING CONFIRMATION" : "PAY & MOVE-IN"}
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
          <h2 className="font-bold">Payment History</h2>
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
                      <button onClick={() => window.print()} style={{ color: colors.primary }} className="p-2 hover:bg-orange-50 rounded-full transition-all">
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