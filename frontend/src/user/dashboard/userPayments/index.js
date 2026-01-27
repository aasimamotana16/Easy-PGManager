import React, { useState } from "react";
import { FaHistory, FaDownload, FaWallet, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import PayRent from "../payRent"; 
import Swal from "sweetalert2";

// Mock data (replace with API later)
const paymentData = {
  nextPayment: {
    month: "January 2026",
    amount: "8,500",
    dueDate: "05 Jan 2026",
    status: "Pending",
  },
  totalPaid: "18,500",
  history: [
    { id: 1, month: "December 2025", amount: "8,500", status: "Paid", date: "02 Dec" },
    { id: 2, month: "November 2025", amount: "8,500", status: "Paid", date: "05 Nov" },
    { id: 3, month: "October 2025", amount: "8,500", status: "Paid", date: "03 Oct" },
  ],
};

const Payments = () => {
  const { nextPayment, totalPaid, history } = paymentData;
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const handlePayment = (method) => {
    // Logic is handled inside the PayRent component's SweetAlert now, 
    // but we close the modal here.
    setIsPayModalOpen(false);
  };

  const handleDownloadReceipt = (month) => {
    Swal.fire({
      title: 'Downloading...',
      text: `Preparing receipt for ${month}`,
      timer: 1500,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
    });
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6 sm:space-y-10">
      
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800">
          Payments & Invoices
        </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
          Track your rent cycle and download payment receipts.
        </p>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Next Payment Card */}
        <div className="bg-black text-white p-6 rounded-md shadow-xl flex flex-col justify-between border-l-4 border-orange-500 min-h-[160px] md:min-h-[250px] lg:min-h-[180px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] md:text-2xl lg:text-xs text-orange-500 font-bold uppercase tracking-widest">
                Current Due
              </p>
              <p className="text-3xl md:text-6xl lg:text-4xl font-black mt-1">₹{nextPayment.amount}</p>
            </div>
            <FaWallet className="text-orange-500 text-2xl md:text-5xl lg:text-3xl" />
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p className="text-xs md:text-2xl lg:text-sm text-gray-300">Rent for {nextPayment.month}</p>
                <p className="text-[10px] md:text-xl lg:text-xs text-gray-400 font-bold">DUE BY: {nextPayment.dueDate}</p>
            </div>
            <CButton
              className="bg-primary text-white font-bold py-2 md:py-6 md:text-3xl lg:py-2 lg:text-base px-6 shadow-lg"
              onClick={() => setIsPayModalOpen(true)}
            >
              PAY NOW
            </CButton>
          </div>
        </div>

        {/* Total Paid Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-md shadow-sm flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-orange-50 rounded-full mb-3">
                <FaCheckCircle className="text-orange-500 text-xl md:text-5xl lg:text-2xl" />
            </div>
            <p className="text-[10px] md:text-2xl lg:text-xs text-gray-400 font-bold uppercase tracking-widest">Lifetime Paid</p>
            <p className="text-2xl md:text-5xl lg:text-3xl font-black text-black">₹{totalPaid}</p>
            <p className="text-[10px] md:text-xl lg:text-xs text-gray-400 mt-1 italic">Across all successful transactions</p>
        </div>
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm sm:text-lg md:text-4xl lg:text-xl font-bold text-gray-700 uppercase tracking-tight flex items-center gap-2">
            <FaHistory className="text-orange-500" /> Payment History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] sm:text-xs md:text-3xl lg:text-sm uppercase text-gray-400 font-bold">
                <th className="py-4 px-2">Month</th>
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm md:text-3xl lg:text-base">
              {history.map((pay) => (
                <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="py-5 px-2 font-bold text-gray-800">{pay.month}</td>
                  <td className="py-5 px-2 text-gray-500">{pay.date}</td>
                  <td className="py-5 px-2 font-black text-black">₹{pay.amount}</td>
                  <td className="py-5 px-2">
                    <StatusBadge status={pay.status} />
                  </td>
                  <td className="py-5 px-2 text-right">
                    <button 
                      onClick={() => handleDownloadReceipt(pay.month)}
                      className="text-orange-500 hover:text-orange-700 p-2 md:p-4 rounded-full hover:bg-orange-50 transition-all"
                    >
                      <FaDownload className="md:text-3xl lg:text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PayRent Modal Integration */}
      {isPayModalOpen && (
        <PayRent
          amount={nextPayment.amount}
          month={nextPayment.month}
          dueDate={nextPayment.dueDate}
          onPay={handlePayment}
          onClose={() => setIsPayModalOpen(false)}
        />
      )}
    </div>
  );
};

/* ---------- Reusable Sub-Components ---------- */

const StatusBadge = ({ status }) => {
  const isPaid = status.toLowerCase() === "paid";
  return (
    <span
      className={`px-3 py-1 md:px-6 md:py-2 rounded-full text-[9px] md:text-xl lg:text-xs font-black uppercase tracking-tighter ${
        isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {status}
    </span>
  );
};

export default Payments;