import React, { useState } from "react";
import CButton from "../../../components/cButton";

// Mock data
const rebookData = {
  pgName: "Shree Residency PG",
  room: "A-203 / Bed 1",
  agreementEnd: "31 Dec 2025",
  rentAmount: "₹9,000 / month",
  securityDeposit: "₹18,000",
};

const Rebook = () => {
  const [isRebooked, setIsRebooked] = useState(false);

  const handleRebook = () => {
    // Here you can integrate backend API for rebooking
    setIsRebooked(true);
    alert("Rebooking request submitted successfully!");
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">

        {/* REBOOK CARD */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Rebook Your Stay</h2>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              isRebooked ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {isRebooked ? "Rebooked" : "Pending"}
            </span>
          </div>

          {/* Agreement Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="PG Name" value={rebookData.pgName} />
            <Info label="Room / Bed" value={rebookData.room} />
            <Info label="Agreement Ends" value={rebookData.agreementEnd} />
            <Info label="Rent Amount" value={rebookData.rentAmount} />
            <Info label="Security Deposit" value={rebookData.securityDeposit} />
          </div>

          {/* Action Button */}
          <CButton
            className={`px-5 py-2 rounded-xl text-sm ${
              isRebooked ? "bg-gray-300 cursor-not-allowed" : "bg-primary text-white hover:opacity-90"
            }`}
            onClick={handleRebook}
            disabled={isRebooked}
          >
            {isRebooked ? "Already Rebooked" : "Rebook / Extend Stay"}
          </CButton>
        </div>

      </div>
    </div>
  );
};

// Info component reused for consistency
const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Rebook;
