import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput"; // Added for Modal
import { FaHome, FaRegEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { getMyPgs } from "../../../api/api";
import { getImageUrl } from "../../../utils/imageUtils";

const PgManagement = () => {
  const navigate = useNavigate(); 
  const [myPgs, setMyPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toImageUrl = (imgPath) => getImageUrl(imgPath);

  // --- NEW MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPg, setEditingPg] = useState({ id: "", name: "", location: "" });
  const [editErrors, setEditErrors] = useState({});

  // Fetch PGs from backend
  const fetchMyPgs = async () => {
    try {
      const response = await getMyPgs();

      if (response.data.success) {
        const transformedPgs = response.data.data.map(pg => ({
          id: pg._id,
          name: pg.pgName,
          location: pg.location,
          status: pg.status.charAt(0).toUpperCase() + pg.status.slice(1),
          rooms: pg.totalRooms || 0,
          beds: pg.liveListings || 0,
          image: toImageUrl(pg.mainImage),
        }));
        setMyPgs(transformedPgs);
      }
    } catch (error) {
      console.error("Error fetching PGs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPgs();
  }, []);

  // --- NEW EDIT LOGIC ---
  const openEditModal = (pg) => {
    setEditingPg({ id: pg.id, name: pg.name, location: pg.location });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdatePg = async () => {
    if (!editingPg.name.trim()) {
      setEditErrors({ name: "Property name is required" });
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      await axios.put(`http://localhost:5000/api/owner/pg/${editingPg.id}`, 
        { pgName: editingPg.name, location: editingPg.location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsEditModalOpen(false);
      Swal.fire("Updated!", "Property info saved successfully.", "success");
      fetchMyPgs(); // Refresh list
    } catch (error) {
      Swal.fire("Error!", "Failed to update property.", "error");
    }
  };

  const handleDeletePg = async (pgId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#4B4B4B",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("userToken");
        await axios.delete(`http://localhost:5000/api/owner/pg/${pgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyPgs(prevPgs => prevPgs.filter(pg => pg.id !== pgId));
        Swal.fire("Deleted!", "Your PG has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting PG:", error);
      Swal.fire("Error!", "Failed to delete PG.", "error");
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-200 min-h-screen space-y-6 md:space-y-8">

      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black text-primary">
          PG Management
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-500">
          Manage your PG properties, rooms, and approvals
        </p>
      </div>

      {/* ADD NEW PROPERTY */}
      <div className="bg-white p-5 sm:p-8 rounded-md shadow border-2 border-primary flex flex-col items-center text-center max-w-4xl mx-auto">
        <FaHome size={42} className="text-orange-500 mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          Add New Property
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-6 max-w-md">
          Add a new PG to start managing rooms, tenants, and bookings.
        </p>
        <CButton
          className="w-full sm:w-auto px-10"
          size="lg"
          onClick={() => navigate("/owner/dashboard/pgManagment/addProperty")}
        >
          Add Property
        </CButton>
      </div>

      {/* MY UPLOADED PGs */}
      <div className="bg-white p-4 sm:p-6 border border-primary rounded-md shadow">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            My Uploaded PGs
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">
            View and manage all your PG properties
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {myPgs.map((pg) => (
            <div
              key={pg.id}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="aspect-video w-full overflow-hidden">
                 <img
                   src={pg.image}
                   alt={pg.name}
                   className="h-full w-full object-cover"
                   onError={(e) => {
                     const currentSrc = e.currentTarget.src || "";
                     if (currentSrc.includes("/uploads/pgImages/")) {
                       e.currentTarget.src = currentSrc.replace("/uploads/pgImages/", "/uploads/documents/");
                       return;
                     }
                     e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
                   }}
                 />
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 line-clamp-1">{pg.name}</h4>
                  <span className={`whitespace-nowrap text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-bold ${
                      pg.status === "Approved" ? "bg-green-100 text-green-700" :
                      pg.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-purple-200 text-purple-700"
                  }`}>
                    {pg.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 italic">{pg.location}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-medium text-gray-600">
                  <span>Rooms: <b className="text-gray-900">{pg.rooms}</b></span>
                  <span className="text-gray-300">|</span>
                  <span>Beds: <b className="text-gray-900">{pg.beds}</b></span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/owner/dashboard/pg/${pg.id}`)} className="text-blue-500 hover:text-blue-800 transition-colors" title="View PG">
                      <FaRegEye className="text-xl sm:text-2xl" />
                    </button>

                    {/* UPDATED EDIT BUTTON */}
                    <button 
                      onClick={() => openEditModal(pg)} 
                      className="text-gray-500 hover:text-primary transition-colors" 
                      title="Edit PG"
                    >
                      <FaEdit className="text-xl sm:text-2xl" />
                    </button>

                    <button onClick={() => handleDeletePg(pg.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete PG">
                      <FaTrash className="text-lg sm:text-xl" />
                    </button>
                  </div>

                  <CButton
                    size="sm"
                    className="ml-auto text-xs sm:text-sm px-4"
                    onClick={() => navigate(`/owner/dashboard/pgManagment/roomManagement/${pg.id}`)}
                  >
                    Manage Rooms
                  </CButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {myPgs.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-400">No properties found. Add your first PG above!</p>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL JSX --- */}
     {/* --- EDIT MODAL JSX --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Full Screen Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-xl shadow-2xl z-[100000] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">Edit PG Basic Info</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="hover:rotate-90 transition-transform duration-200"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <CInput 
                  label="PG Name *" 
                  value={editingPg.name} 
                  onChange={(e) => {
                    setEditingPg({...editingPg, name: e.target.value});
                    if(editErrors.name) setEditErrors({});
                  }}
                />
                {editErrors.name && <p className="text-red-600 text-[11px] font-bold mt-1">{editErrors.name}</p>}
              </div>
              
              <CInput 
                label="Location / Area" 
                value={editingPg.location} 
                onChange={(e) => setEditingPg({...editingPg, location: e.target.value})}
              />
              
              <div className="flex gap-3 pt-2">
                <CButton 
                  variant="outlined" 
                  className="flex-1 border-gray-300 text-gray-700" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </CButton>
                <CButton 
                  className="flex-1" 
                  onClick={handleUpdatePg}
                >
                  Save Changes
                </CButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PgManagement;
