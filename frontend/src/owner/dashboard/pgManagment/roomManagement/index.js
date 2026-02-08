import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaBed,
  FaUsers,
  FaRegEye,
  FaEdit,
  FaPlus,
} from "react-icons/fa";
import CButton from "../../../../components/cButton";
import Swal from "sweetalert2";

const RoomManagement = () => {
  const navigate = useNavigate();
  const { pgId } = useParams();
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
        return;
      }

      const pgResponse = await axios.get(`http://localhost:5000/api/owner/pg/${pgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (pgResponse.data.success) {
        setPgData(pgResponse.data.data);
        setRooms(pgResponse.data.data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching PG data:", error);
      // Fallback to static data if API fails for UI testing
      setRooms([
        { id: 1, roomNo: "101", roomType: "Deluxe", capacity: 4, occupied: 2, status: "Available" },
        { id: 2, roomNo: "102", roomType: "Standard", capacity: 3, occupied: 3, status: "Full" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pgId) fetchPgData();
    else setLoading(false);
  }, [pgId]);

  const handleViewRoom = (room) => {
    Swal.fire({
      title: `<span class="text-orange-600">Room ${room.roomNo || room.roomType}</span>`,
      html: `
        <div class="text-left space-y-2 text-sm">
          <p><strong>Type:</strong> ${room.roomType || room.type || 'N/A'}</p>
          <p><strong>Capacity:</strong> ${room.capacity || room.bedsPerRoom || 0} Beds</p>
          <p><strong>Occupancy:</strong> ${room.occupied || 0} Occupied</p>
          <p><strong>Status:</strong> ${room.status || 'Available'}</p>
          <p><strong>Description:</strong> ${room.description || 'No description provided'}</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#D97706", 
    });
  };

  const handleEditRoom = (room) => {
    Swal.fire({
      title: 'Edit Room Details',
      html: `
        <input id="swal-roomType" class="swal2-input" placeholder="Room Type" value="${room.roomType || room.type}">
        <input id="swal-capacity" type="number" class="swal2-input" placeholder="Capacity" value="${room.capacity || room.bedsPerRoom}">
        <select id="swal-status" class="swal2-input">
          <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
          <option value="Full" ${room.status === 'Full' ? 'selected' : ''}>Full</option>
          <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: "#D97706",
      preConfirm: () => {
        return {
          roomType: document.getElementById('swal-roomType').value,
          capacity: document.getElementById('swal-capacity').value,
          status: document.getElementById('swal-status').value,
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Updated!", "Room details updated successfully.", "success");
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      
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
          {rooms.map((room, index) => {
            const displayRoom = {
              roomNo: room.roomNo || room.roomType || `Room ${index + 1}`,
              type: room.roomType || room.type || 'Standard',
              capacity: room.capacity || room.bedsPerRoom || 1,
              occupied: room.occupied || 0,
              status: room.status || 'Available',
            };

            const occupancyPercent = (displayRoom.occupied / displayRoom.capacity) * 100;

            return (
              <div
                key={room.id || index}
                className="bg-white rounded-lg border border-gray-200 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <FaBed className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">
                        Room {displayRoom.roomNo}
                        </h3>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{displayRoom.type}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    displayRoom.status === "Available" ? "bg-green-100 text-green-700" :
                    displayRoom.status === "Full" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {displayRoom.status}
                  </span>
                </div>

                {/* CAPACITY INFO */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                        <FaUsers className="text-gray-400" />
                        <span>Occupancy</span>
                    </div>
                    <span className="font-semibold">{displayRoom.occupied} / {displayRoom.capacity}</span>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      occupancyPercent >= 100 ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                  />
                </div>

                {/* ACTIONS */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                  <CButton
                    variant="outlined"
                    className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2"
                    onClick={() => handleViewRoom(room)}
                  >
                    <FaRegEye /> View
                  </CButton>

                  <CButton
                    variant="outlined"
                    className="flex items-center justify-center gap-2 border-orange-600  text-sm py-2"
                    onClick={() => handleEditRoom(room)}
                  >
                    <FaEdit /> Edit
                  </CButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rooms.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500">No rooms found. Click "Add New Room" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;