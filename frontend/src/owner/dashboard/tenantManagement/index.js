import React, { useState } from "react";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton"; // your default CButton

const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
];

const Tenants = () => {
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul@gmail.com",
      pgId: 1,
      room: "101",
      joiningDate: "2024-04-10",
      status: "Active",
    },
    {
      id: 2,
      name: "Aman Verma",
      phone: "8765432109",
      email: "aman@gmail.com",
      pgId: 2,
      room: "203",
      joiningDate: "2024-03-25",
      leavingDate: "2025-11-25",
      status: "Left",
    },
    {
      id: 3,
      name: "Rohit Singh",
      phone: "9876501234",
      email: "rohit@gmail.com",
      pgId: 1,
      room: "101",
      joiningDate: "2024-04-10",
      status: "Active",
    },
  ]);

  const [selectedPG, setSelectedPG] = useState("all");
  const [showAddTenant, setShowAddTenant] = useState(false);

  // Get PG name by ID
  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "";

  // Add tenant handler
  const handleAddTenant = (tenant) => {
    tenant.id = tenants.length + 1; // Auto ID
    setTenants([...tenants, tenant]);
    setShowAddTenant(false);
  };

  // Filter tenants by PG
  const filteredTenants =
    selectedPG === "all"
      ? tenants
      : tenants.filter((t) => t.pgId === parseInt(selectedPG));

  // Group tenants by PG + room
  const groupedRooms = Object.values(
    filteredTenants.reduce((acc, t) => {
      const key = `${t.pgId}-${t.room}`;
      if (!acc[key]) acc[key] = { pgId: t.pgId, room: t.room, persons: [] };
      acc[key].persons.push(t);
      return acc;
    }, {})
  );

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <CButton onClick={() => setShowAddTenant(true)} className="flex items-center gap-2">
          <FaPlus /> Add Tenant
        </CButton>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tenant..."
          className="border rounded-lg px-4 py-2 w-full"
        />
        <select
          className="border rounded-lg px-4 py-2"
          value={selectedPG}
          onChange={(e) => setSelectedPG(e.target.value)}
        >
          <option value="all">All PGs</option>
          {PG_LIST.map((pg) => (
            <option key={pg.id} value={pg.id}>
              {pg.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">PG / Hostel</th>
              <th className="p-3">Room Number</th>
              <th className="p-3">Persons in Room</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedRooms.map((room, idx) => {
              const firstTenant = room.persons[0]; // show first tenant in row
              return (
                <tr key={idx} className="border-t">
                  <td className="p-3">{firstTenant.name}</td>
                  <td className="p-3">{firstTenant.phone}</td>
                  <td className="p-3">{getPGName(firstTenant.pgId)}</td>
                  <td className="p-3">{firstTenant.room}</td>
                  <td className="p-3">{room.persons.length}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        firstTenant.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {firstTenant.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    {/* VIEW all tenants in the room */}
                    <CButton
                      onClick={() =>
                        alert(
                          room.persons
                            .map(
                              (p) =>
                                `Name: ${p.name}\nPhone: ${p.phone}\nEmail: ${p.email}\nJoining Date: ${p.joiningDate}\nLeaving Date: ${p.leavingDate}\nStatus: ${p.status}`
                            )
                            .join("\n\n")
                        )
                      }
                      title="View All Persons"
                    >
                      <FaEye />
                    </CButton>

                    <CButton
                      onClick={() => alert("Edit functionality coming soon")}
                      title="Edit Tenant"
                    >
                      <FaEdit />
                    </CButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD TENANT MODAL */}
      {showAddTenant && (
        <AddTenant onClose={() => setShowAddTenant(false)} onSave={handleAddTenant} />
      )}
    </div>
  );
};

export default Tenants;
