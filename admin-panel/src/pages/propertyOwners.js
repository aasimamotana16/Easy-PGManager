import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { OwnerTable } from '../components';

const PropertyOwner = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  // GET: Fetch all owners from back-end
  const fetchOwners = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/owners');
      // Handle response whether it's a direct array or wrapped in a data property
      const data = response.data.data || response.data;
      setOwners(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setLoading(false);
    }
  }, []);

  // DELETE: Remove owner by ID
  const deleteOwnerHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/owner/${id}`);
        fetchOwners(); // Refresh list after deletion
      } catch (error) {
        alert("Failed to delete owner");
      }
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Property Owners</h1>
        <div className="flex space-x-3">
          <button className="bg-[#5ba4a4] text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-opacity-90 transition">
            + Add Owner
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50">
            ✏️ Edit
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50">
            🗑️ Delete
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading owners...</div>
      ) : (
        <OwnerTable 
          owners={owners} 
          onDeleteOwner={deleteOwnerHandler} 
          onEditOwner={(owner) => console.log("Edit:", owner)} 
        />
      )}
      
      {/* Pagination Footer - matching your image */}
      <div className="mt-6 flex justify-center items-center space-x-4 text-sm text-slate-500">
        <span>Page 1 of 5</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">Next &gt;&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyOwner;