import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaUsers } from "react-icons/fa";
import axios from "axios";
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

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
    // Initial sample data
    const sampleData = [
      { _id: '1', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', pgId: 1, room: '101', joiningDate: '2026-01-15', status: 'Active' },
      { _id: '2', name: 'Priya Patel', phone: '9876543211', email: 'priya@email.com', pgId: 2, room: '201', joiningDate: '2026-01-20', status: 'Active' },
      { _id: '3', name: 'Amit Kumar', phone: '9876543212', email: 'amit@email.com', pgId: 1, room: '102', joiningDate: '2026-02-01', status: 'Active' }
    ];
    setTenants(sampleData);

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("http://localhost:5000/api/owner/my-tenants", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data.length > 0) {
        setTenants(res.data.data);
      }
    } catch (error) {
      console.log('API failed, showing sample data');
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const getPGName = (id) => PG_LIST.find((p) => p.id === id)?.name || "-";

  const searchedTenants = tenants.filter((t) => {
    const matchesPG = selectedPG === "all" || t.pgId === parseInt(selectedPG);
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          getPGName(t.pgId).toLowerCase().includes(search.toLowerCase());
    return matchesPG && matchesSearch;
  });

  const handleEditClick = (tenant) => {
    Swal.fire({
      title: 'Quick Edit',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <label style="font-weight: bold; font-size: 14px;">Room Number</label>
          <input id="swal-room" class="swal2-input" value="${tenant.room}" style="width: 85%; margin-bottom: 15px;">
          
          <label style="font-weight: bold; font-size: 14px;">Occupancy Status</label>
          <select id="swal-status" class="swal2-input" style="width: 85%;">
            <option value="Active" ${tenant.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${tenant.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      `,
      confirmButtonText: 'Update Tenant',
      confirmButtonColor: '#ef7e24',
      showCancelButton: true,
      preConfirm: () => {
        return {
          room: document.getElementById('swal-room').value,
          status: document.getElementById('swal-status').value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          await axios.put(`http://localhost:5000/api/owner/update-tenant/${tenant._id}`, result.value, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire('Updated!', 'Tenant details saved.', 'success');
          fetchTenants();
        } catch (e) {
          Swal.fire('Error', 'Update failed', 'error');
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8f9fa] min-h-screen">
      
      {/* HEADER SECTION - Updated as per your request */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
            Tenants
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500">
            View and manage tenants across PGs
          </p>
        </div>

        <CButton onClick={() => setShowAddTenant(true)} className="flex items-center gap-2 whitespace-nowrap mt-2">
          <FaPlus size={14} /> Add Tenant
        </CButton>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-t-4  border-primary flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name or PG..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#ef7e24]"
        />
        <select
          value={selectedPG}
          onChange={(e) => setSelectedPG(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none md:w-48"
        >
          <option value="all">All PGs</option>
          {PG_LIST.map((pg) => <option key={pg.id} value={pg.id}>{pg.name}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-100 border-b">
              <tr className="text-black text-sm uppercase tracking-wider font-bold">
                <th className="p-4">Name</th>
                <th className="p-4">PG Name</th>
                <th className="p-4">Room</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {searchedTenants.length > 0 ? (
                searchedTenants.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-700">{t.name}</div>
                      <div className="text-[10px] text-gray-400">{t.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{getPGName(t.pgId)}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-primary px-2 py-1 rounded text-xs font-bold">
                        {t.room}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{t.joiningDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(t)}
                        className="text-[#ef7e24] hover:bg-orange-50 p-2 rounded-lg transition-all"
                      >
                        <FaEdit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTenant && (
        <AddTenant onClose={() => setShowAddTenant(false)} onSave={fetchTenants} />
      )}
    </div>
  );
};

export default Tenants;