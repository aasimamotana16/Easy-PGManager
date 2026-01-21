import React, { useState, useEffect } from "react"; // Added hooks
import CButton from "../../../components/cButton";
import { getOwnerContactData } from "../../../api/api"; // Ensure this matches your API file [cite: 2026-01-06]

const OwnerContact = () => {
  // Use state to store backend data, starting with your placeholder look
  const [ownerData, setOwnerData] = useState({
    name: "Loading...",
    phone: "",
    email: "",
    pgName: "",
    address: "",
  });

  // Fetch data on component load [cite: 2026-01-07]
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const res = await getOwnerContactData();
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          // Map backend response fields to your existing UI labels [cite: 2026-01-06, 2026-01-07]
          setOwnerData({
            name: d.ownerName || "Not Assigned",
            phone: d.phone || "Not Set",
            email: d.email || "Not Set",
            pgName: d.pgName || "No PG Booked",
            address: d.pgAddress || "Not Set",
          });
        }
      } catch (error) {
        console.error("Error fetching owner contact:", error);
        setOwnerData(prev => ({ ...prev, name: "Error loading data" }));
      }
    };

    fetchOwnerDetails();
  }, []);

  return (
    <div className="bg-dashboard-gradient flex flex-col rounded-2xl items-center p-8 space-y-8">
      {/* Header - No Changes */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-primary mt-3">Owner Contact</h2>
        <span className="px-8 py-1 text-xs font-medium rounded-full bg-white text-green-700">
          Verified
        </span>
      </div>

    {/* Action Buttons - Pure Logic, No Alerts */}
<div className="flex flex-wrap gap-4 w-full max-w-3xl">
  <CButton
    className="px-6 py-2"
    onClick={() => {
      // Directly opens the phone dialer [cite: 2026-01-01]
      window.location.href = `tel:${ownerData.phone}`; 
    }}
  >
    Call Owner
  </CButton>

  <CButton
    className="px-6 py-2"
    onClick={() => {
      // Directly opens the default email client [cite: 2026-01-01]
      window.location.href = `mailto:${ownerData.email}`;
    }}
  >
    Email Owner
  </CButton>
</div>
      {/* Info Fields Card - Logic kept identical [cite: 2026-01-07] */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <Info label="Owner Name" value={ownerData.name} />
          <Info label="Phone" value={ownerData.phone} />
          <Info label="Email" value={ownerData.email} />
          <Info label="PG Name" value={ownerData.pgName} />
          <Info label="PG Address" value={ownerData.address} className="md:col-span-2" />
        </div>
      </div>
    </div>
  );
};

// Info component - Kept identical
const Info = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default OwnerContact;