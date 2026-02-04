import React, { useState, useEffect } from "react";
import { FaHistory, FaDownload, FaWallet, FaCheckCircle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

const Payments = () => {
  const [paymentData, setPaymentData] = useState({
    nextPayment: null,
    totalPaid: 0,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Data from Backend on Load
  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    const token = localStorage.getItem("userToken");
    try {
      // Replace with your actual dashboard/stats endpoint
      const response = await fetch("http://localhost:5000/api/payments/user-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPaymentData({
          nextPayment: data.nextPayment, // Should contain { amount, month, dueDate, pgId }
          totalPaid: data.totalPaid,
          history: data.history,
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Razorpay Logic
  const handleDirectPayment = async () => {
    const token = localStorage.getItem("userToken");

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
      // Step A: Create Order on Backend
      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: paymentData.nextPayment?.amount || 8500,
          pgId: paymentData.nextPayment?.pgId || "64b1234567890",
        }),
      });

      if (!orderResponse.ok) throw new Error("Failed to create order");
      const { order } = await orderResponse.json();

      // Step B: Initialize Razorpay Checkout
      const options = {
        key: "rzp_test_S9ZmF0zUNli8eT", 
        amount: order.amount,
        currency: "INR",
        name: "EasyPG Manager",
        description: `Rent for ${paymentData.nextPayment?.month}`,
        order_id: order.id,
        handler: async (response) => {
          // Step C: Verify Payment on Backend
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
              amountPaid: paymentData.nextPayment?.amount,
              month: paymentData.nextPayment?.month,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            Swal.fire({
              title: "Payment Successful!",
              text: "Your rent history has been updated.",
              icon: "success",
              confirmButtonColor: "#f97316",
            });
            fetchPaymentDetails(); // Refresh the table and stats
          }
        },
        theme: { color: "#f97316" },
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

  const handleDownloadReceipt = (payment) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    const receiptHtml = `
      <html>
        <head><title>Receipt - ${payment.month}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h2 style="color: #f97316;">EasyPG Manager</h2>
          <hr/>
          <p><strong>Month:</strong> ${payment.month}</p>
          <p><strong>Amount:</strong> ₹${payment.amount}</p>
          <p><strong>Status:</strong> PAID</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>`;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6">
      <header className="px-1">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800">
          Payments & Invoices
        </h1>
        <p className="text-gray-500">Track your rent cycle and receipts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Payment Card */}
        <div className="bg-black text-white p-6 rounded-md shadow-xl border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-500 font-bold uppercase text-xs">Current Due</p>
              <p className="text-3xl font-black mt-1">₹{paymentData.nextPayment?.amount || "0"}</p>
            </div>
            <FaWallet className="text-orange-500 text-2xl" />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-gray-300 text-sm">Rent for {paymentData.nextPayment?.month}</p>
              <p className="text-gray-400 text-xs">DUE: {paymentData.nextPayment?.dueDate}</p>
            </div>
            <CButton
              className="bg-primary text-white font-bold py-2 px-6 shadow-lg"
              onClick={handleDirectPayment}
              disabled={isProcessing}
            >
              {isProcessing ? "PROCESSING..." : "PAY NOW"}
            </CButton>
          </div>
        </div>

        {/* Total Paid Card */}
        <div className="bg-white border p-6 rounded-md shadow-sm flex flex-col items-center justify-center">
          <FaCheckCircle className="text-orange-500 text-2xl mb-2" />
          <p className="text-gray-400 font-bold uppercase text-xs">Lifetime Paid</p>
          <p className="text-2xl font-black">₹{paymentData.totalPaid}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white p-6 rounded-md shadow-sm border">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-6">
          <FaHistory className="text-orange-500" /> Payment History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase font-bold border-b">
                <th className="py-4">Month</th>
                <th className="py-4">Date</th>
                <th className="py-4">Amount</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.history.map((pay) => (
                <tr key={pay.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-5 font-bold">{pay.month}</td>
                  <td className="py-5 text-gray-500">{pay.date}</td>
                  <td className="py-5 font-black">₹{pay.amount}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                      pay.status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <button onClick={() => handleDownloadReceipt(pay)} className="text-orange-500 hover:text-orange-700">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;