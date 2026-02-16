import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FaHistory, FaDownload, FaWallet, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import CButton from "../../../components/cButton";
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
        setPaymentData({ nextPayment: data.nextPayment, totalPaid: data.totalPaid, history: data.history, lateFine: data.lateFine || 0 });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    const token = localStorage.getItem("userToken");
    if (!token || token === "null") {
      return Swal.fire({ title: "Session Expired", text: "Please log in again.", icon: "warning", confirmButtonColor: colors.primary });
    }

    setIsProcessing(true);
    try {
      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          amount: ((intentAmount != null ? intentAmount : (paymentData.nextPayment?.amount || 8500)) + (paymentData.lateFine || 0)), 
          pgId: paymentData.nextPayment?.pgId || "", 
          type: intentType || (stayStatus === 'Active' ? "MONTHLY_RENT" : "MOVE_IN_PAYMENT") 
        })
      });

      if (!orderResponse.ok) throw new Error("Failed to create order");
      const { order } = await orderResponse.json();

      const options = {
        key: "rzp_test_S9ZmF0zUNli8eT",
        amount: order.amount,
        currency: "INR",
        name: "EasyPG Manager",
        description: `Rent payment for ${paymentData.nextPayment?.month || 'Current Month'}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ 
                razorpay_order_id: response.razorpay_order_id, 
                razorpay_payment_id: response.razorpay_payment_id, 
                razorpay_signature: response.razorpay_signature, 
                amountPaid: order.amount / 100 
              })
            });

            const result = await verifyRes.json();
            if (result.success) {
              Swal.fire({ 
                title: "Payment Successful!", 
                text: intentType === 'MOVE_IN_PAYMENT' ? "Move-in initiated! Waiting for owner confirmation." : (stayStatus === 'Active' ? "Rent updated." : "Payment successful."), 
                icon: "success", 
                confirmButtonColor: colors.primary 
              });
              fetchPaymentDetails();
              fetchAgreementStatus();
              
              if ((intentType || (stayStatus !== 'Active')) === 'MOVE_IN_PAYMENT') {
                await fetch('http://localhost:5000/api/users/move-in', { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
              }
            }
          } catch (err) {
            console.error('Verification error', err);
            Swal.fire({ title: "Error", text: "Verification failed", icon: "error" });
          }
        },
        theme: { color: colors.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      Swal.fire({ title: "Error", text: "Transaction failed", icon: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // Derived visibility logic
  const today = new Date();
  const agreementEnd = agreementInfo && agreementInfo.endDate ? new Date(agreementInfo.endDate) : null;
  const agreementExpired = agreementEnd ? agreementEnd < today : false;
  const dueAmount = paymentData.nextPayment?.amount || 0;

  let showPayNow = false;
  let showExtendStay = false;

  if (agreementExpired) {
    if (extensionApproved) {
      showPayNow = true;
      showExtendStay = false;
    } else if (dueAmount === 0) {
      showExtendStay = true;
      showPayNow = false;
    } else {
      showPayNow = true;
      showExtendStay = false;
    }
  } else if (stayStatus === 'Active') {
    showPayNow = true;
    showExtendStay = true;
  }

  const totalDue = (paymentData.nextPayment?.amount || 0) + (paymentData.lateFine || 0);
  const monthLabel = paymentData.nextPayment?.month || 'N/A';
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
        <div className="md:col-span-2 p-8 rounded-xl shadow-lg border-b-4" style={{ backgroundColor: colors.backgroundDark, borderColor: colors.primary }}>
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
              <p className="text-xs opacity-60 uppercase font-bold">Due Date: {dueDateLabel}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {showPayNow && (
                <CButton onClick={handlePayNow} disabled={isProcessing} className="bg-white text-black hover:bg-gray-200">
                  {isProcessing ? "PROCESSING..." : "PAY NOW"}
                </CButton>
              )}

              {showExtendStay && (
                <CButton onClick={() => Swal.fire({ title: 'Extend Stay', text: 'Request extension?', showCancelButton: true, confirmButtonColor: colors.primary })} style={{ backgroundColor: colors.primary }}>
                  EXTEND STAY
                </CButton>
              )}

              {!showPayNow && !showExtendStay && (
                <CButton onClick={handlePayNow} disabled={isProcessing || stayStatus === 'Pending'} style={{ backgroundColor: stayStatus === 'Pending' ? '#6B7280' : colors.primary }} className="w-full sm:w-64">
                  {stayStatus === 'Pending' ? "AWAITING CONFIRMATION" : (isProcessing ? "PROCESSING..." : "PAY & MOVE-IN")}
                </CButton>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-8 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: colors.border }}>
          <FaCheckCircle className="text-3xl mb-3" style={{ color: colors.primary }} />
          <p className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Lifetime Paid</p>
          <p className="text-3xl font-black" style={{ color: colors.textPrimary }}>₹{paymentData.totalPaid}</p>
          <div className="mt-4 px-4 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: colors.primary, color: colors.primary }}>
            STATUS: {statusLabel}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: colors.border }}>
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
              {paymentData.history.map((pay) => {
                const statusClass = (pay.status && String(pay.status).toLowerCase() === 'paid') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                return (
                  <tr key={pay.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-bold">{pay.month}</td>
                    <td className="p-5 text-sm" style={{ color: colors.textSecondary }}>{pay.date}</td>
                    <td className="p-5 font-black">₹{pay.amount}</td>
                    <td className="p-5">
                      <span className={"px-3 py-1 rounded text-[10px] font-bold uppercase " + statusClass}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => window.print()} style={{ color: colors.primary }} className="p-2 hover:bg-orange-50 rounded-full transition-all">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;