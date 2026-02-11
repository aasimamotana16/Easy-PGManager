import React, { useState, useEffect, useMemo } from "react";
import { FaEdit, FaPlus, FaSearch, FaFilter, FaUsers } from "react-icons/fa";
import axios from "axios";
import AddTenant from "./addTenant";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
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
      console.log('API failed, using sample data');
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
      title: 'Update Tenant',
      html: `
        <div style="text-align: left; font-family: inherit;">
          <label style="display: block; font-weight: bold; font-size: 14px; color: #1C1C1C; margin-bottom: 5px;">Room Number</label>
          <input id="swal-room" class="swal2-input" value="${tenant.room}" style="width: 100%; margin: 0 0 15px 0; border-radius: 8px; border: 1px solid #E5E0D9;">
          
          <label style="display: block; font-weight: bold; font-size: 14px; color: #1C1C1C; margin-bottom: 5px;">Occupancy Status</label>
          <select id="swal-status" class="swal2-input" style="width: 100%; margin: 0; border-radius: 8px; border: 1px solid #E5E0D9;">
            <option value="Active" ${tenant.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${tenant.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      `,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#D97706',
      showCancelButton: true,
      cancelButtonColor: '#4B4B4B',
      preConfirm: () => ({
        room: document.getElementById('swal-room').value,
        status: document.getElementById('swal-status').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          await axios.put(`http://localhost:5000/api/owner/update-tenant/${tenant._id}`, result.value, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire({ icon: 'success', title: 'Updated!', confirmButtonColor: '#D97706' });
          fetchTenants();
        } catch (e) {
          Swal.fire({ icon: 'error', title: 'Update failed', confirmButtonColor: '#D97706' });
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-10 bg-gray-100 min-h-screen">
      
      {/* HEADER SECTION - Matches Booking Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#1C1C1C]">Tenants</h1>
          <p className="text-[#4B4B4B] mt-2">Manage all residents across your properties</p>
        </div>
        <CButton 
          text="Add New Tenant"
          onClick={() => setShowAddTenant(true)}
          className="flex items-center gap-2"
        >
          <FaPlus /> Add New Tenant
        </CButton>
      </div>

      {/* SEARCH AND FILTER BAR - Matches Booking Style */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-primary">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or PG..." 
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#E5E0D9] focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CSelect 
          value={selectedPG}
          onChange={(e) => setSelectedPG(e.target.value)}
          options={PG_LIST.map(pg => ({ value: pg.id, label: pg.name }))}
          placeholder="All Properties"
        />
      </div>

      {/* TABLE CONTAINER - Matches Booking Style */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D9] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9]">
           <h2 className="text-h3-sm lg:text-h3 font-bold text-[#1C1C1C]">Current Residents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-primarySoft text-black text-sm uppercase ">
              <tr>
                <th className="p-5">Tenant Details</th>
                <th className="p-5">Property</th>
                <th className="p-5 text-center">Room No.</th>
                <th className="p-5">Joining Date</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D9]">
              {searchedTenants.length > 0 ? (
                searchedTenants.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-[#1C1C1C]">{t.name}</div>
                      <div className="text-xs text-[#4B4B4B] font-mono">{t.phone}</div>
                    </td>
                    <td className="p-5 text-[#4B4B4B] font-medium">
                      {getPGName(t.pgId)}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center">
                        <span className="px-3 py-1 rounded border border-primary text-primaryDark text-[10px] font-bold uppercase min-w-[60px] text-center">
                          {t.room}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-[#4B4B4B]">
                       {t.joiningDate}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleEditClick(t)}
                          className="p-2 text-[#4B4B4B] hover:text-primary hover:bg-primarySoft rounded-full transition-all group"
                          title="Edit Tenant"
                        >
                          <FaEdit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-primarySoft p-4 rounded-full text-primary">
                            <FaUsers size={32} />
                        </div>
                        <p className="text-[#4B4B4B] font-medium">No tenants found.</p>
                    </div>
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