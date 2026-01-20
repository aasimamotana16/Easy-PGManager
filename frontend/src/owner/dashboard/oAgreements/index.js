import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileContract } from "react-icons/fa";
import CButton from "../../../components/cButton";

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
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER (LIKE OTHER DASHBOARD PAGES) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaFileContract className="text-orange-500 text-3xl" />
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Agreements
            </h1>
            <p className="text-gray-500">
              View and manage tenant rental agreements
            </p>
          </div>
        </div>

        <CButton
          className="bg-primary text-white px-4 py-2 rounded-md"
          onClick={() => navigate("/owner/dashboard")}
        >
          Add New Agreement
        </CButton>
      </div>

      {/* SEARCH / FILTER CARD */}
      <div className="bg-white p-4 rounded-md shadow flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by Tenant"
          className="border rounded-md px-4 py-2 flex-1"
          value={tenantSearch}
          onChange={(e) => setTenantSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Property / Room"
          className="border rounded-md px-4 py-2 flex-1"
          value={propertySearch}
          onChange={(e) => setPropertySearch(e.target.value)}
        />
        <CButton className="bg-orange-500 text-white px-5 py-2">
          Search
        </CButton>
      </div>

      {/* AGREEMENTS TABLE */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white border-b">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Tenant</th>
              <th className="p-4 text-left font-semibold">Property / Room</th>
              <th className="p-4 text-left font-semibold">Start Date</th>
              <th className="p-4 text-left font-semibold">End Date</th>
              <th className="p-4 text-left font-semibold">Rent</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAgreements.length > 0 ? (
              filteredAgreements.map((ag) => (
                <tr key={ag.id} className="border-b last:border-none">
                  <td className="p-4">{ag.id}</td>
                  <td className="p-4">{ag.tenant}</td>
                  <td className="p-4">
                    {ag.property} / {ag.room}
                  </td>
                  <td className="p-4">{ag.startDate}</td>
                  <td className="p-4">{ag.endDate}</td>
                  <td className="p-4 font-semibold">
                    ₹{ag.rent}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        ag.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ag.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <CButton className="px-3 py-1">
                      View
                    </CButton>
                    <CButton className="px-3 py-1">
                      Download
                    </CButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
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
