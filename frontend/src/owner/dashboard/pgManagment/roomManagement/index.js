import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaBed,
  FaUsers,
  FaRegEye,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import CButton from "../../../../components/cButton";
import Swal from "sweetalert2";

const RoomManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pgId } = useParams();
  
  // Get pgId from params or location state (from addRooms flow)
  const propertyId = pgId || location.state?.pgId || localStorage.getItem("currentPropertyId");
  
  const [pgData, setPgData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch PG and rooms data
  const fetchPgData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        Swal.fire("Error!", "Please login to view rooms", "error");
        navigate("/loginPage");
        return;
      }

      if (!propertyId) {
        console.error("No PG ID found");
        setRooms([]);
        return;
      }

      console.log("Fetching PG data for ID:", propertyId);

      const pgResponse = await axios.get(
        `http://localhost:5000/api/owner/pg/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("PG Response:", pgResponse.data);

      if (pgResponse.data.success) {
        setPgData(pgResponse.data.data);
        setRooms(pgResponse.data.data.rooms || []);
        console.log("Rooms loaded:", pgResponse.data.data.rooms);
      }
    } catch (error) {
      console.error("Error fetching PG data:", error);
      Swal.fire("Error!", error.response?.data?.message || "Failed to load property details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPgData();
    } else {
      setLoading(false);
      console.warn("No PG ID available");
    }
  }, [propertyId]);

  const handleViewRoom = (room) => {
    Swal.fire({
      title: `<span class="text-orange-600">Room ${room.roomNo || room.roomType}</span>`,
      html: `
        <div class="text-left space-y-2 text-sm">
          <p><strong>Type:</strong> ${room.roomType || room.type || 'N/A'}</p>
          <p><strong>Total Rooms:</strong> ${room.totalRooms || room.capacity || 0}</p>
          <p><strong>Beds Per Room:</strong> ${room.bedsPerRoom || 0}</p>
          <p><strong>Description:</strong> ${room.description || 'No description provided'}</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#D97706", 
    });
  };

  const handleEditRoom = (room, index) => {
    Swal.fire({
      title: 'Edit Room Details',
      html: `
        <input id="swal-roomType" class="swal2-input" placeholder="Room Type" value="${room.roomType || ''}">
        <input id="swal-totalRooms" type="number" class="swal2-input" placeholder="Total Rooms" value="${room.totalRooms || 0}">
        <input id="swal-bedsPerRoom" type="number" class="swal2-input" placeholder="Beds Per Room" value="${room.bedsPerRoom || 0}">
        <textarea id="swal-description" class="swal2-input" placeholder="Description">${room.description || ''}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: "#D97706",
      preConfirm: () => {
        const roomType = document.getElementById('swal-roomType').value;
        const totalRooms = document.getElementById('swal-totalRooms').value;
        const bedsPerRoom = document.getElementById('swal-bedsPerRoom').value;
        const description = document.getElementById('swal-description').value;

        if (!roomType) {
          Swal.showValidationMessage('Room type is required');
          return false;
        }

        return { roomType, totalRooms: parseInt(totalRooms) || 0, bedsPerRoom: parseInt(bedsPerRoom) || 0, description };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          
          // Update the room in the rooms array
          const updatedRooms = [...rooms];
          updatedRooms[index] = { ...updatedRooms[index], ...result.value };
          
          // Update PG with new rooms array
          const response = await axios.put(
            `http://localhost:5000/api/owner/pg/${propertyId}`,
            { rooms: updatedRooms },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            setRooms(updatedRooms);
            Swal.fire("Updated!", "Room details updated successfully.", "success");
          }
        } catch (error) {
          console.error("Error updating room:", error);
          Swal.fire("Error!", error.response?.data?.message || "Failed to update room", "error");
        }
      }
    });
  };

  const handleDeleteRoom = async (index) => {
    Swal.fire({
      title: 'Delete Room?',
      text: 'Are you sure you want to delete this room?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          
          // Remove room from array
          const updatedRooms = rooms.filter((_, i) => i !== index);
          
          // Update PG with new rooms array
          const response = await axios.put(
            `http://localhost:5000/api/owner/pg/${propertyId}`,
            { rooms: updatedRooms },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            setRooms(updatedRooms);
            Swal.fire("Deleted!", "Room deleted successfully.", "success");
          }
        } catch (error) {
          console.error("Error deleting room:", error);
          Swal.fire("Error!", error.response?.data?.message || "Failed to delete room", "error");
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Room Management
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            {pgData ? `Managing rooms for ${pgData.pgName || pgData.name}` : 'Property Rooms Overview'}
          </p>
        </div>

        <CButton
          className="w-full sm:w-auto text-white flex items-center justify-center gap-2 px-6 shadow-md"
          onClick={() => navigate("/owner/dashboard/pgManagment/addRooms")}
        >
          <FaPlus /> Add New Room
        </CButton>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">Loading rooms...</div>
      ) : (
        /* ROOM LIST - Responsive Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms && rooms.length > 0 ? rooms.map((room, index) => {
            const displayRoom = {
              roomType: room.roomType || 'Standard',
              totalRooms: room.totalRooms || 1,
              bedsPerRoom: room.bedsPerRoom || 1,
              description: room.description || 'No description',
            };

            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <FaBed className="text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">
                        {displayRoom.roomType}
                        </h3>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{displayRoom.totalRooms} Room(s)</span>
                    </div>
                  </div>
                </div>

                {/* ROOM INFO */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>{displayRoom.bedsPerRoom} Bed(s) per room</span>
                    </div>
                    <p className="text-xs text-gray-500 italic">{displayRoom.description}</p>
                </div>

                {/* ACTIONS */}
                <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
                  <CButton
                    variant="outlined"
                    className="flex items-center justify-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2"
                    onClick={() => handleViewRoom(room)}
                  >
                    <FaRegEye size={14} /> View
                  </CButton>

                  <CButton
                    variant="outlined"
                    className="flex items-center justify-center gap-1 border-orange-600 text-orange-600 hover:bg-orange-50 text-sm py-2"
                    onClick={() => handleEditRoom(room, index)}
                  >
                    <FaEdit size={14} /> Edit
                  </CButton>

                  <CButton
                    variant="outlined"
                    className="flex items-center justify-center gap-1 border-red-400 text-red-600 hover:bg-red-50 text-sm py-2"
                    onClick={() => handleDeleteRoom(index)}
                  >
                    <FaTrash size={14} />
                  </CButton>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-500 mb-4">No rooms found.</p>
              <CButton onClick={() => navigate("/owner/dashboard/pgManagment/addRooms", { state: { pgId: propertyId } })}>
                <FaPlus /> Add First Room
              </CButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;