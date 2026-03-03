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
  
  const propertyId = pgId || location.state?.pgId || localStorage.getItem("currentPropertyId");
  
  const [pgData, setPgData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const toInt = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const fetchPgData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        navigate("/loginPage");
        return;
      }

      const pgResponse = await axios.get(
        `http://localhost:5000/api/owner/pg/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (pgResponse.data.success) {
        setPgData(pgResponse.data.data);
        setRooms(pgResponse.data.data.rooms || []);
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to load property details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Debug: log navigation and property id to help diagnose frontend errors
  useEffect(() => {
    try {
      console.log('[RoomManagement] location.state:', location.state, 'propertyId:', propertyId);
    } catch (e) {
      console.error('[RoomManagement] logging error', e);
    }
  }, [location.state, propertyId]);

  useEffect(() => {
    if (propertyId) fetchPgData();
  }, [propertyId]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'full': return 'bg-red-100 text-red-600 border-red-200';
      case 'maintenance': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  const handleViewRoom = (room) => {
    const totalRoomsCount = Math.max(0, toInt(room.totalRooms, 0));
    const bedsPerRoomCount = Math.max(1, toInt(room.bedsPerRoom, 1));
    const totalBeds = totalRoomsCount * bedsPerRoomCount;
    const occupiedBeds = Math.max(0, toInt(room.occupiedBeds, 0));
    Swal.fire({
      title: `<span style="color: #D97706">Room Details</span>`,
      html: `
        <div class="text-left space-y-3 p-2">
          <div class="flex justify-between border-b pb-2"><strong>Type:</strong> <span>${room.roomType}</span></div>
          <div class="flex justify-between border-b pb-2"><strong>Total Rooms:</strong> <span>${room.totalRooms}</span></div>
          <div class="flex justify-between border-b pb-2"><strong>Occupancy:</strong> <span>${occupiedBeds} / ${totalBeds} Beds</span></div>
          <div class="flex justify-between border-b pb-2"><strong>Status:</strong> <span class="uppercase font-bold">${room.status || 'Active'}</span></div>
          <p class="mt-2 text-gray-600"><strong>Description:</strong> ${room.description || 'N/A'}</p>
        </div>
      `,
      confirmButtonColor: "#D97706", 
    });
  };

  const handleEditRoom = (room, index) => {
    Swal.fire({
      title: 'Edit Room Details',
      customClass: {
        popup: 'max-w-[95%] sm:max-w-[450px] rounded-md',
      },
      html: `
        <div class="text-left px-2">
          <label class="block text-xs font-bold text-gray-700 mb-1">Room Type</label>
          <input id="swal-roomType" class="swal2-input !m-0 !w-full border-gray-300 !text-sm" placeholder="Single, Double, etc." value="${room.roomType || ''}">

          <div class="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Total Rooms</label>
              <input id="swal-totalRooms" type="number" class="swal2-input !m-0 !w-full !text-sm" value="${room.totalRooms || 0}">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Beds Per Room</label>
              <input id="swal-bedsPerRoom" type="number" class="swal2-input !m-0 !w-full !text-sm" value="${room.bedsPerRoom || 0}">
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 mt-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Status</label>
              <select id="swal-status" class="swal2-input !m-0 !w-full !text-sm">
                <option value="Active" ${room.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Full" ${room.status === 'Full' ? 'selected' : ''}>Full</option>
                <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              </select>
            </div>
          </div>

          <label class="block text-xs font-bold text-gray-700 mt-4 mb-1">Description</label>
          <textarea id="swal-description" class="swal2-textarea !m-0 !w-full !text-sm" placeholder="Add details..." rows="2">${room.description || ''}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#6B7280',
      preConfirm: () => {
        return {
          roomType: document.getElementById('swal-roomType').value,
          totalRooms: parseInt(document.getElementById('swal-totalRooms').value) || 0,
          bedsPerRoom: parseInt(document.getElementById('swal-bedsPerRoom').value) || 0,
          status: document.getElementById('swal-status').value,
          description: document.getElementById('swal-description').value,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          const updatedRooms = [...rooms];
          updatedRooms[index] = { ...updatedRooms[index], ...result.value };
          
          await axios.put(
            `http://localhost:5000/api/owner/pg/${propertyId}`,
            { rooms: updatedRooms },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Fetch updated PG and navigate back so PG Management reflects changes
          try {
            const pgResp = await axios.get(`http://localhost:5000/api/owner/pg/${propertyId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (pgResp.data && pgResp.data.success) {
              navigate('/owner/dashboard/pgManagment', { state: { updatedPg: pgResp.data.data } });
              return; // navigated away
            }
          } catch (e) {
            console.error('Failed to fetch updated PG after edit:', e);
          }

          setRooms(updatedRooms);
          Swal.fire("Success", "Room updated successfully", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to update room", "error");
        }
      }
    });
  };

  const handleDeleteRoom = async (index) => {
    const result = await Swal.fire({
      title: 'Delete Room?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("userToken");
        const updatedRooms = rooms.filter((_, i) => i !== index);
        await axios.put(
          `http://localhost:5000/api/owner/pg/${propertyId}`,
          { rooms: updatedRooms },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch updated PG and navigate back so PG Management reflects changes
        try {
          const pgResp = await axios.get(`http://localhost:5000/api/owner/pg/${propertyId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (pgResp.data && pgResp.data.success) {
            navigate('/owner/dashboard/pgManagment', { state: { updatedPg: pgResp.data.data } });
            return; // navigated away
          }
        } catch (e) {
          console.error('Failed to fetch updated PG after delete:', e);
        }

        setRooms(updatedRooms);
        Swal.fire("Deleted!", "Room has been removed.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete room.", "error");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className=" text-[#1C1C1C]">Room Management</h2>
            <p className="text-primary ">
              {pgData?.name ? `Property: ${pgData.name}` : 'Manage availability and status'}
            </p>
          </div>
          <CButton
            className="w-full md:w-auto bg-[#D97706] text-white flex items-center justify-center gap-2 px-8 py-3 rounded-md shadow-lg"
            onClick={() => navigate("/owner/dashboard/pgManagment/addRooms", { state: { pgId: propertyId } })}
          >
            <FaPlus /> Add New Room
          </CButton>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => {
              const totalRoomsCount = Math.max(0, toInt(room.totalRooms, 0));
              const bedsPerRoomCount = Math.max(1, toInt(room.bedsPerRoom, 1));
              const total = Math.max(1, totalRoomsCount * bedsPerRoomCount);
              const occupied = Math.max(0, toInt(room.occupiedBeds, 0));
              const occupancyRate = Math.min(100, (occupied / total) * 100);
              const status = room.status || (occupied >= total ? 'Full' : 'Active');

              return (
                <div 
                  key={index} 
                  className="bg-white rounded-md border shadow-sm overflow-hidden transition-shadow hover:shadow-md" 
                  style={{ 
                    border: '2px solid #E5E0D9', 
                    borderRadius: '1rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.border = '2px solid #D97706'}
                  onMouseLeave={(e) => e.currentTarget.style.border = '2px solid #E5E0D9'}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FEF3C7] p-2 rounded-md"><FaBed className="text-[#D97706]" /></div>
                        <div>
                          <h3 className="font-bold text-[#1C1C1C]">{room.roomType}</h3>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{room.totalRooms} Rooms Available</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(status)}`}>
                        {status}
                      </span>
                    </div>

                    <p className="text-sm text-[#4B4B4B] mb-4 line-clamp-1">{room.description || 'No description provided'}</p>

                    <div className="bg-[#F8F9FA] p-3 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-[#4B4B4B]">
                        <span>Bed Occupancy</span>
                        <span>{occupied} / {total} Beds</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-md h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${occupancyRate >= 100 ? 'bg-red-500' : 'bg-[#D97706]'}`} 
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
                      <button onClick={() => handleViewRoom(room)} className="p-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"><FaRegEye /></button>
                      <button onClick={() => handleEditRoom(room, index)} className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"><FaEdit /></button>
                      <button onClick={() => handleDeleteRoom(index)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
