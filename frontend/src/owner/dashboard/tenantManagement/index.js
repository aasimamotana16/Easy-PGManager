import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaPlus, FaUsers } from "react-icons/fa";
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
    // Force show sample data immediately for testing
    console.log('Force showing sample tenant data');
    setTenants([
      {
        _id: '1',
        name: 'Rahul Sharma',
        phone: '9876543210',
        email: 'rahul.sharma@email.com',
        pgId: 1,
        room: '101',
        joiningDate: '2026-01-15',
        status: 'Active'
      },
      {
        _id: '2',
        name: 'Priya Patel',
        phone: '9876543211',
        email: 'priya.patel@email.com',
        pgId: 2,
        room: '201',
        joiningDate: '2026-01-20',
        status: 'Active'
      },
      {
        _id: '3',
        name: 'Amit Kumar',
        phone: '9876543212',
        email: 'amit.kumar@email.com',
        pgId: 1,
        room: '102',
        joiningDate: '2026-02-01',
        status: 'Active'
      },
      {
        _id: '4',
        name: 'Sneha Reddy',
        phone: '9876543213',
        email: 'sneha.reddy@email.com',
        pgId: 2,
        room: '202',
        joiningDate: '2026-02-10',
        status: 'Active'
      },
      {
        _id: '5',
        name: 'Vikram Singh',
        phone: '9876543214',
        email: 'vikram.singh@email.com',
        pgId: 3,
        room: '301',
        joiningDate: '2026-03-01',
        status: 'Active'
      }
    ]);
    
    // Try API in background (but don't wait for it)
    try {
      console.log('Trying tenants API in background...');
      const token = localStorage.getItem("userToken"); // Fixed: use userToken
      const res = await axios.get(
        "http://localhost:5000/api/owner/my-tenants",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Tenants API Response status:', res.status);
      console.log('Tenants API Response data:', res.data);
      
      if (res.data.success && res.data.data.length > 0) {
        // Use real data if available
        setTenants(res.data.data);
        console.log('Using real tenant data:', res.data.data.length);
      }
    } catch (error) {
      console.log('Tenants API failed, keeping sample data');
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAddTenant = async (tenantData) => {
    try {
      const token = localStorage.getItem("userToken"); // Fixed: use userToken
      const res = await axios.post(
        "http://localhost:5000/api/owner/add-tenant",
        tenantData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setShowAddTenant(false);
        fetchTenants();
        // Show success popup
        Swal.fire({
          icon: 'success',
          title: 'Tenant Added!',
          text: `${tenantData.name} has been successfully added to ${getPGName(tenantData.pgId)}`,
          confirmButtonColor: '#f97316',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error("Error adding tenant:", error);
      // Show error popup
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Tenant',
        text: 'Please try again or check your connection',
        confirmButtonColor: '#f97316'
      });
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
                      <div className="flex justify-center gap-2">
                        <FaEye
                          className="cursor-pointer text-gray-600 hover:text-gray-800"
                          title="View Details"
                          size={22}
                          onClick={() => {
                            const tenantDetails = room.persons.map(
                              (p, index) =>
                                `Tenant ${index + 1}:\n` +
                                `Name: ${p.name}\n` +
                                `Phone: ${p.phone}\n` +
                                `Email: ${p.email}\n` +
                                `PG: ${getPGName(p.pgId)}\n` +
                                `Room: ${p.room}\n` +
                                `Status: ${p.status}\n` +
                                `Joined: ${p.joiningDate}`
                            ).join("\n\n");
                            
                            Swal.fire({
                              icon: 'info',
                              title: 'Tenant Details',
                              html: `<pre style="text-align: left; white-space: pre-wrap; font-family: monospace; font-size: 14px;">${tenantDetails}</pre>`,
                              confirmButtonColor: '#f97316',
                              confirmButtonText: 'Close',
                              width: '600px'
                            });
                          }}
                        />
                        <FaEdit
                          className="cursor-pointer text-orange-600 hover:text-orange-800"
                          title="Edit Tenant"
                          size={22}
                          onClick={() => {
                            // Get the first tenant for editing
                            const tenant = room.persons[0];
                            Swal.fire({
                              title: 'Edit Tenant',
                              html: `
                                <div style="text-align: left;">
                                  <div style="margin-bottom: 8px;">
                                    <label style="display: block; margin-bottom: 3px; font-weight: bold; font-size: 13px;">Name:</label>
                                    <input type="text" id="edit-name" value="${tenant.name}" class="swal2-input" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                                  </div>
                                  <div style="margin-bottom: 8px;">
                                    <label style="display: block; margin-bottom: 3px; font-weight: bold; font-size: 13px;">Phone:</label>
                                    <input type="text" id="edit-phone" value="${tenant.phone}" class="swal2-input" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                                  </div>
                                  <div style="margin-bottom: 8px;">
                                    <label style="display: block; margin-bottom: 3px; font-weight: bold; font-size: 13px;">Email:</label>
                                    <input type="email" id="edit-email" value="${tenant.email}" class="swal2-input" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                                  </div>
                                  <div style="margin-bottom: 8px;">
                                    <label style="display: block; margin-bottom: 3px; font-weight: bold; font-size: 13px;">Room:</label>
                                    <input type="text" id="edit-room" value="${tenant.room}" class="swal2-input" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                                  </div>
                                  <div style="margin-bottom: 8px;">
                                    <label style="display: block; margin-bottom: 3px; font-weight: bold; font-size: 13px;">Status:</label>
                                    <select id="edit-status" class="swal2-input" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                                      <option value="Active" ${tenant.status === 'Active' ? 'selected' : ''}>Active</option>
                                      <option value="Inactive" ${tenant.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                    </select>
                                  </div>
                                </div>
                              `,
                              confirmButtonColor: '#f97316',
                              showCancelButton: true,
                              confirmButtonText: 'Save',
                              cancelButtonText: 'Cancel',
                              width: '400px', // Smaller width
                              padding: '1rem', // Reduced padding
                              preConfirm: async (result) => {
                                console.log('Edit tenant preConfirm called');
                                console.log('Tenant ID:', tenant._id);
                                console.log('Tenant ID type:', typeof tenant._id);
                                
                                // Get the updated values
                                const updatedData = {
                                  name: document.getElementById('edit-name').value,
                                  phone: document.getElementById('edit-phone').value,
                                  email: document.getElementById('edit-email').value,
                                  room: document.getElementById('edit-room').value,
                                  status: document.getElementById('edit-status').value
                                };
                                
                                console.log('Updated data:', updatedData);
                                
                                // Validate required fields
                                if (!updatedData.name || !updatedData.phone || !updatedData.email) {
                                  Swal.showValidationMessage('Please fill all required fields');
                                  return false;
                                }
                                
                                try {
                                  console.log('Attempting API call...');
                                  const token = localStorage.getItem("userToken");
                                  console.log('Token exists:', !!token);
                                  console.log('Token:', token?.substring(0, 20) + '...');
                                  
                                  // Convert tenant ID to string if it's an object
                                  const tenantId = typeof tenant._id === 'object' ? tenant._id.toString() : tenant._id;
                                  console.log('Final tenant ID:', tenantId);
                                  
                                  const response = await axios.put(
                                    `http://localhost:5000/api/owner/update-tenant/${tenantId}`,
                                    updatedData,
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  
                                  console.log('API Response:', response.data);
                                  
                                  if (response.data.success) {
                                    Swal.fire({
                                      icon: 'success',
                                      title: 'Tenant Updated!',
                                      text: `${updatedData.name} has been updated successfully.`,
                                      confirmButtonColor: '#f97316',
                                      timer: 2000,
                                      timerProgressBar: true
                                    });
                                    
                                    // Refresh the tenant list
                                    fetchTenants();
                                  } else {
                                    throw new Error(response.data.message || 'Update failed');
                                  }
                                } catch (error) {
                                  console.error('Error updating tenant:', error);
                                  console.log('Error details:', error.response?.data || error.message);
                                  console.log('Error status:', error.response?.status);
                                  console.log('Error URL:', error.config?.url);
                                  Swal.showValidationMessage(`Failed to update tenant: ${error.response?.data?.message || error.message}`);
                                  return false;
                                }
                              }
                            });
                          }}
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
