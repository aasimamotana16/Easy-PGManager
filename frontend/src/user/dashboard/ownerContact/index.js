import React from "react";
import CButton from "../../../components/cButton";

const OwnerContact = () => {
  // Mock data (replace with API later)
  const ownerData = {
    name: "Mr. Rajesh Patel",
    phone: "+91 98765 12345",
    email: "rajesh.patel@example.com",
    pgName: "Shree Residency PG",
    address: "123, Ellis Bridge, Ahmedabad, Gujarat",
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">

        {/* OWNER CONTACT CARD */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Owner Contact</h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-1 text-green-2">
              Verified
            </span>
          </div>

          {/* Owner Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Owner Name" value={ownerData.name} />
            <Info label="Phone" value={ownerData.phone} />
            <Info label="Email" value={ownerData.email} />
            <Info label="PG Name" value={ownerData.pgName} />
            <Info label="PG Address" value={ownerData.address} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <CButton
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm"
              onClick={() => window.open(`tel:${ownerData.phone}`)}
            >
              Call Owner
            </CButton>

            <CButton
              className="border px-5 py-2 rounded-xl text-sm"
              onClick={() => window.open(`mailto:${ownerData.email}`)}
            >
              Email Owner
            </CButton>
          </div>

        </div>

      </div>
    </div>
  );
};

// Info component reused for consistency
const Info = ({ label, value }) => (
  <div className="bg-gray-2 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default OwnerContact;
