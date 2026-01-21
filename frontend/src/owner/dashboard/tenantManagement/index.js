import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaPlus, FaUsers } from "react-icons/fa";
import axios from "axios";
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton";

const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
  { id: 3, name: "Metro Living" },
];

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedPG, setSelectedPG] = useState("all");
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/owner/my-tenants",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setTenants(res.data.data);
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
    } catch {
      alert("Failed to save tenant");
    }
  };

  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "-";

  const filteredTenants =
    selectedPG === "all"
      ? tenants
      : tenants.filter((t) => t.pgId === parseInt(selectedPG));

  const searchedTenants = filteredTenants.filter((t) => {
    const pgName = getPGName(t.pgId).toLowerCase();
    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      pgName.includes(search.toLowerCase())
    );
  });

  const groupedRooms = Object.values(
    searchedTenants.reduce((acc, t) => {
      const key = `${t.pgId}-${t.room}`;
      if (!acc[key]) acc[key] = { pgId: t.pgId, room: t.room, persons: [] };
      acc[key].persons.push(t);
      return acc;
    }, {})
  );

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaUsers className="text-gray-800 text-xl md:text-3xl lg:text-2xl" />
          <div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold text-primary">
              Tenants
            </h1>
            <p className="text-xs md:text-xl lg:text-2xl text-gray-500">
              View and manage tenants across PGs
            </p>
          </div>
        </div>

        <CButton onClick={() => setShowAddTenant(true)}>
          <FaPlus className="mr-2" /> Add Tenant
        </CButton>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 md:p-4 rounded-md shadow flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search tenant or PG name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 w-full md:flex-1 text-sm"
        />

        <select
          value={selectedPG}
          onChange={(e) => setSelectedPG(e.target.value)}
          className="border rounded-md px-3 py-2 md:w-60 text-sm"
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
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left hidden md:table-cell">Phone</th>
              <th className="p-3 text-left hidden md:table-cell">PG</th>
              <th className="p-3 text-left">Room</th>
              <th className="p-3 text-center hidden md:table-cell">Persons</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {groupedRooms.length ? (
              groupedRooms.map((room, idx) => {
                const firstTenant = room.persons[0];
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3">{firstTenant.name}</td>

                    <td className="px-3 py-3 hidden md:table-cell">
                      {firstTenant.phone}
                    </td>

                    <td className="px-3 py-3 hidden md:table-cell">
                      {getPGName(firstTenant.pgId)}
                    </td>

                    <td className="px-3 py-3">{firstTenant.room}</td>

                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      {room.persons.length}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="text-xs md:text-sm text-green-700">
                        {firstTenant.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <FaEye
                          className="cursor-pointer text-gray-600 hover:text-gray-800"
                          title="View"
                          size={22}
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
                        />
                        <FaEdit
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          title="Edit"
                          size={22}
                          onClick={() => alert("Edit coming soon")}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No tenants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
