import React from "react";
import CButton from "../../../components/cButton";

const OwnerContact = () => {
  const ownerData = {
    name: "Mr. Rajesh Patel",
    phone: "+91 98765 12345",
    email: "rajesh.patel@example.com",
    pgName: "Shree Residency PG",
    address: "123, Ellis Bridge, Ahmedabad, Gujarat",
  };

  return (
    <div className=" bg-dashboard-gradient flex flex-col rounded-2xl items-center p-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-primary mt-3">Owner Contact</h2>
        <span className="px-8 py-1 text-xs font-medium rounded-full bg-white text-green-700">
          Verified
        </span>
      </div>

      {/* Action Buttons on gradient */}
      <div className="flex flex-wrap gap-4 w-full max-w-3xl">
        <CButton
          className="bg-primary  px-6 py-2"
          onClick={() => window.open(`tel:${ownerData.phone}`)}
        >
          Call Owner
        </CButton>

        <CButton
          className="bg-primary/20  border border-primary px-6 py-2 "
          onClick={() => window.open(`mailto:${ownerData.email}`)}
        >
          Email Owner
        </CButton>
      </div>

      {/* Info Fields Card */}
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

// Info component without box
const Info = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default OwnerContact;
