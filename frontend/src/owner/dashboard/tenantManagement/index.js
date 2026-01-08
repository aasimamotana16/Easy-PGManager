import React, { useState, useEffect } from "react"; // Added useEffect
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import axios from "axios"; // Added axios
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton";

const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
  { id: 3, name: "Metro Living" },
  { id: 4, name: "Girly hostel" }
];

const Tenants = () => {
  // 1. Start with an empty array
  const [tenants, setTenants] = useState([]);
  const [selectedPG, setSelectedPG] = useState("all");
  const [showAddTenant, setShowAddTenant] = useState(false);

  // 2. Fetch live data from backend
  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/owner/my-tenants", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTenants(res.data.data); // Data now comes from MongoDB
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  // 3. Load data on component mount
  useEffect(() => {
    fetchTenants();
  }, []);

  // 4. Update the save handler to use the back-end side
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
        fetchTenants(); // Refresh list to show new data
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save tenant to database");
    }
  };

  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "";

  const filteredTenants =
    selectedPG === "all"
      ? tenants
      : tenants.filter((t) => t.pgId === parseInt(selectedPG));

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <CButton onClick={() => setShowAddTenant(true)} className="flex items-center gap-2">
          <FaPlus /> Add Tenant
        </CButton>
      </div>

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
              const firstTenant = room.persons[0];
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
                    <CButton
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

      {showAddTenant && (
        <AddTenant onClose={() => setShowAddTenant(false)} onSave={handleAddTenant} />
      )}
    </div>
  );
};

export default Tenants;