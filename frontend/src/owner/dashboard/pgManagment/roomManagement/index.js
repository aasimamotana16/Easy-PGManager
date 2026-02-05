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

/* STATIC ROOM DATA (UI ONLY) */
const rooms = [
  {
    id: 1,
    roomNo: "101",
    type: "Deluxe",
    capacity: 4,
    occupied: 2,
    status: "Available",
  },
  {
    id: 2,
    roomNo: "102",
    type: "Standard",
    capacity: 3,
    occupied: 3,
    status: "Full",
  },
  {
    id: 3,
    roomNo: "201",
    type: "AC Room",
    capacity: 2,
    occupied: 1,
    status: "Maintenance",
  },
];

const RoomManagement = () => {
  const navigate = useNavigate();
  const { pgId } = useParams();
  const [pgData, setPgData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch PG and rooms data
  const fetchPgData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        Swal.fire("Error!", "Please login to view rooms", "error");
        return;
      }

      // Fetch PG details
      const pgResponse = await axios.get(`http://localhost:5000/api/owner/pg/${pgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (pgResponse.data.success) {
        setPgData(pgResponse.data.data);
        setRooms(pgResponse.data.data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching PG data:", error);
      // Use static data as fallback
    } finally {
      setLoading(false);
    }
  };

  // Handle view room details
  const handleViewRoom = (room) => {
    console.log("View room clicked:", room);
    
    const roomDetails = `
      Room Number: ${room.roomNo || 'N/A'}
      Type: ${room.type || 'N/A'}
      Capacity: ${room.capacity || 0} beds
      Occupied: ${room.occupied || 0} beds
      Status: ${room.status || 'N/A'}
      Description: ${room.description || 'No description available'}
    `;
    
    Swal.fire({
      title: `Room ${room.roomNo}`,
      html: `<pre style="text-align: left; font-size: 14px;">${roomDetails}</pre>`,
      icon: "info",
      confirmButtonText: "Close",
      width: 500
    });
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    console.log("Edit room clicked:", room);
    
    Swal.fire({
      title: `Edit Room ${room.roomNo}`,
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label>Room Type:</label>
            <input id="roomType" class="swal2-input" value="${room.type || ''}" placeholder="e.g., Deluxe Room">
          </div>
          <div style="margin-bottom: 15px;">
            <label>Capacity:</label>
            <input id="capacity" type="number" class="swal2-input" value="${room.capacity || ''}" placeholder="Number of beds">
          </div>
          <div style="margin-bottom: 15px;">
            <label>Occupied:</label>
            <input id="occupied" type="number" class="swal2-input" value="${room.occupied || ''}" placeholder="Currently occupied beds">
          </div>
          <div style="margin-bottom: 15px;">
            <label>Status:</label>
            <select id="status" class="swal2-input">
              <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Full" ${room.status === 'Full' ? 'selected' : ''}>Full</option>
              <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label>Description:</label>
            <textarea id="description" class="swal2-input" placeholder="Room details and amenities">${room.description || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      preConfirm: () => {
        const roomType = document.getElementById('roomType').value;
        const capacity = document.getElementById('capacity').value;
        const occupied = document.getElementById('occupied').value;
        const status = document.getElementById('status').value;
        const description = document.getElementById('description').value;

        if (!roomType || !capacity) {
          Swal.showValidationMessage('Please fill in required fields');
          return false;
        }

        return { roomType, capacity, occupied, status, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you would typically save to backend
        console.log('Updated room data:', result.value);
        Swal.fire('Success!', 'Room updated successfully', 'success');
        // Refresh the data
        fetchPgData();
      }
    });
  };

  useEffect(() => {
    if (pgId) {
      fetchPgData();
    } else {
      setLoading(false);
    }
  }, [pgId]);

  // Debug: Log the rooms data
  console.log("Current rooms data:", rooms);

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Room Management
          </h1>
          <p className="text-gray-500 mt-1">
            {pgData ? `Managing rooms for ${pgData.pgName}` : 'Room Management'}
          </p>
        </div>

        <CButton
          onClick={() => navigate("/owner/dashboard/pgManagment/addProperty")}
        >
          <FaPlus className="mr-2" />
          Add New Property
        </CButton>
      </div>

      {/* ROOM LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room, index) => {
          // Handle both static data and database data structure
          const roomData = {
            id: room.id || index,
            roomNo: room.roomNo || room.roomType || `Room ${index + 1}`,
            type: room.type || room.roomType || 'Standard',
            capacity: room.capacity || room.bedsPerRoom || 2,
            occupied: room.occupied || 0,
            status: room.status || 'Available',
            description: room.description || ''
          };
          
          return (
            <div
              key={roomData.id}
              className="bg-white rounded-md shadow p-5 flex flex-col"
            >
              {/* ROOM HEADER */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <FaBed className="text-orange-500" />
                  <h3 className="font-semibold text-gray-800">
                    Room {roomData.roomNo}
                  </h3>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    roomData.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : roomData.status === "Full"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {roomData.status}
                </span>
              </div>

              {/* ROOM DETAILS */}
              <p className="text-sm text-gray-500 mb-2">
                {roomData.type}
              </p>

              {/* CAPACITY VISUALIZATION */}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <FaUsers className="text-gray-500" />
                <span>
                  {roomData.occupied} / {roomData.capacity} Beds Occupied
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full ${
                    roomData.occupied === roomData.capacity
                      ? "bg-red-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    width: `${(roomData.occupied / roomData.capacity) * 100}%`,
                  }}
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => {
                    console.log("View button clicked for room:", roomData);
                    alert(`View button clicked for Room ${roomData.roomNo}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <FaRegEye /> View
                </button>

                <button
                  onClick={() => {
                    console.log("Edit button clicked for room:", roomData);
                    alert(`Edit button clicked for Room ${roomData.roomNo}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <FaEdit /> Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RoomManagement;
