import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaPlus, FaUsers } from "react-icons/fa";
import axios from "axios";
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton";

const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
  { id: 3, name: "Metro Living" },
  { id: 4, name: "Girly hostel" },
];

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedPG, setSelectedPG] = useState("all");
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [search, setSearch] = useState("");

  /* -------- FETCH DATA (UNCHANGED) -------- */
  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/owner/my-tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAddTenant = async (tenantData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/owner/add-tenant",
        tenantData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setShowAddTenant(false);
        fetchTenants();
      }
    } catch (err) {
      alert("Failed to save tenant to database");
    }
  };

  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "";

  /* -------- FILTERING (UNCHANGED LOGIC) -------- */
  const filteredTenants =
    selectedPG === "all"
      ? tenants
      : tenants.filter((t) => t.pgId === parseInt(selectedPG));

  const searchedTenants = filteredTenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedRooms = Object.values(
    searchedTenants.reduce((acc, t) => {
      const key = `${t.pgId}-${t.room}`;
      if (!acc[key]) acc[key] = { pgId: t.pgId, room: t.room, persons: [] };
      acc[key].persons.push(t);
      return acc;
    }, {})
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative space-y-6">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-md shadow flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaUsers className="text-orange-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
        </div>

        <CButton
          onClick={() => setShowAddTenant(true)}
          className="flex items-center gap-2 bg-primary text-white"
        >
          <FaPlus /> Add Tenant
        </CButton>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white p-4 rounded-md shadow flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search tenant by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-4 py-2 flex-1"
        />

        <select
          className="border rounded-md px-4 py-2 md:w-64"
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

      {/* TABLE */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Phone</th>
              <th className="p-4 text-left font-semibold">PG / Hostel</th>
              <th className="p-4 text-left font-semibold">Room</th>
              <th className="p-4 text-center font-semibold">Persons</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {groupedRooms.length > 0 ? (
              groupedRooms.map((room, idx) => {
                const firstTenant = room.persons[0];
                return (
                  <tr key={idx} className="border-b last:border-none">
                    <td className="p-4">{firstTenant.name}</td>
                    <td className="p-4">{firstTenant.phone}</td>
                    <td className="p-4">{getPGName(firstTenant.pgId)}</td>
                    <td className="p-4">{firstTenant.room}</td>
                    <td className="p-4 text-center">{room.persons.length}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          firstTenant.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {firstTenant.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <CButton
                        className="px-3 py-1"
                        onClick={() =>
                          alert(
                            room.persons
                              .map(
                                (p) =>
                                  `Name: ${p.name}\nPhone: ${p.phone}\nEmail: ${p.email}\nStatus: ${p.status}`
                              )
                              .join("\n\n")
                          )
                        }
                        title="View All Persons"
                      >
                        <FaEye />
                      </CButton>

                      <CButton
                        className="px-3 py-1"
                        onClick={() => alert("Edit functionality coming soon")}
                        title="Edit Tenant"
                      >
                        <FaEdit />
                      </CButton>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No tenants found. Add your first tenant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD TENANT MODAL */}
      {showAddTenant && (
        <AddTenant
          onClose={() => setShowAddTenant(false)}
          onSave={handleAddTenant}
        />
      )}
    </div>
  );
};

export default Tenants;
