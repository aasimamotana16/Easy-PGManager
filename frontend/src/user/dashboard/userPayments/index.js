import React from "react";

// Mock data (replace with API later)
const paymentData = {
  nextPayment: {
    month: "January 2026",
    amount: "₹8,500",
    dueDate: "05 Jan 2026",
    status: "Pending",
  },
  totalPaid: "₹18,500",
  history: [
    { month: "December 2025", amount: "₹6,000", status: "Paid" },
    { month: "November 2025", amount: "₹6,000", status: "Paid" },
    { month: "October 2025", amount: "₹6,500", status: "Paid" },
  ],
};

const Payments = () => {
  const { nextPayment, totalPaid, history } = paymentData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-2xl font-semibold mb-1">Payments</h2>
        <p className="text-buttonDEFAULT mb-4">
          Manage your rent and payment history
        </p>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <StatCard title="Next Payment" value={nextPayment.amount} highlight>
            <p className="text-sm text-gray-500">{nextPayment.month}</p>
            <p className="text-xs text-gray-400">Due: {nextPayment.dueDate}</p>
          </StatCard>
          <StatCard title="Total Paid" value={totalPaid} />
        </div>

        {/* Pay Button */}
        <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:opacity-90 transition mb-6">
          Pay Next Rent
        </button>

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Payment History</h3>
          {history.map((pay, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border"
            >
              <div>
                <p className="font-medium">{pay.month}</p>
                <p className="text-sm text-gray-500">Amount: {pay.amount}</p>
              </div>
              <StatusBadge status={pay.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Components ---------- */

const StatCard = ({ title, value, highlight, children }) => (
  <div className="bg-white rounded-2xl shadow p-5 border border-border">
    <p className="text-buttonDEFAULT text-sm">{title}</p>
    <p
      className={`text-lg font-semibold mt-1 ${
        highlight ? "text-green-600" : "text-primary"
      }`}
    >
      {value}
    </p>
    {children && <div className="mt-1">{children}</div>}
  </div>
);

const StatusBadge = ({ status }) => {
  const isPaid = status.toLowerCase() === "paid";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
};

export default Payments;