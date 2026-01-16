import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton"; // default import

const sampleAgreements = [
  {
    id: 1,
    tenant: "John Doe",
    property: "Sunshine PG",
    room: "101",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    rent: 5000,
    status: "Active",
  },
  {
    id: 2,
    tenant: "Jane Smith",
    property: "Green PG",
    room: "201",
    startDate: "2025-05-01",
    endDate: "2026-04-30",
    rent: 4500,
    status: "Expired",
  },
  {
    id: 3,
    tenant: "Michael Brown",
    property: "Sunshine PG",
    room: "102",
    startDate: "2026-02-01",
    endDate: "2027-01-31",
    rent: 5200,
    status: "Active",
  },
];

const AgreementPage = () => {
  const navigate = useNavigate();
  const [tenantSearch, setTenantSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  const filteredAgreements = sampleAgreements.filter(
    (ag) =>
      ag.tenant.toLowerCase().includes(tenantSearch.toLowerCase()) &&
      ag.property.toLowerCase().includes(propertySearch.toLowerCase())
  );

  return (
    <div className="p-6 bg-dashboard-gradient min-h-screen rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4 md:mb-0">
          Agreements
        </h2>
        <CButton
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
          onClick={() => navigate("/owner/dashboard")}
        >
          Add New Agreement
        </CButton>
      </div>

      {/* Search / Filter */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Tenant"
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
          value={tenantSearch}
          onChange={(e) => setTenantSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Property/Room"
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
          value={propertySearch}
          onChange={(e) => setPropertySearch(e.target.value)}
        />
        <CButton
          className="bg-amber-500 text-white px-5 py-2 rounded-md hover:bg-amber-600"
          onClick={() => {}}
        >
          Search
        </CButton>
      </div>

      {/* Agreements Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Tenant
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Property / Room
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Start Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                End Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Rent
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAgreements.length > 0 ? (
              filteredAgreements.map((ag) => (
                <tr key={ag.id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{ag.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{ag.tenant}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {ag.property} / {ag.room}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">{ag.startDate}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{ag.endDate}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">₹{ag.rent}</td>
                  <td
                    className={`px-4 py-2 text-sm font-semibold ${
                      ag.status === "Active" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {ag.status}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <CButton
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      onClick={() => navigate("/owner/dashboard")}
                    >
                      View
                    </CButton>
                    <CButton
                      className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                      onClick={() => navigate("/owner/dashboard")}
                    >
                      Download
                    </CButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No agreements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgreementPage;
