import React, { useState } from "react";
import CButton from "../../../components/cButton";

const Agreements = () => {
  const [showRules, setShowRules] = useState(false);

  // Example rules (you can fetch from backend later)
  const agreementRules = [
    "No smoking inside the PG.",
    "Guests allowed only between 8 AM - 10 PM.",
    "Maintain cleanliness in the room and common areas.",
    "No pets allowed.",
    "Any damage to property will be deducted from security deposit.",
    "Rent must be paid before the 5th of every month."
  ];

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">

        {/* AGREEMENT CARD */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              Rental Agreement
            </h2>

            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* AGREEMENT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="PG Name" value="Shree Residency PG" />
            <Info label="Room / Bed" value="A-203 / Bed 1" />
            <Info label="Agreement Period" value="01 Jan 2025 – 31 Dec 2025" />
            <Info label="Rent Amount" value="₹9,000 / month" />
            <Info label="Security Deposit" value="₹18,000" />
            <Info label="Agreement ID" value="AGR-PG-2031" />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pt-2">
            <CButton
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm"
              onClick={() => setShowRules(true)}
            >
              View Rules
            </CButton>

            <CButton className="border px-5 py-2 rounded-xl text-sm">
              Download PDF
            </CButton>
          </div>
        </div>
      </div>

      {/* RULES MODAL */}
      {showRules && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4 text-primary">
              Agreement Rules
            </h2>

            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              {agreementRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>

            <CButton
              onClick={() => setShowRules(false)}
              className="w-full mt-6 bg-primary text-white py-2 rounded-xl"
            >
              Close
            </CButton>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default Agreements;
