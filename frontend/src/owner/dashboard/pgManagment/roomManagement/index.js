import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaUsers,
  FaRegEye,
  FaEdit,
} from "react-icons/fa";
import CButton from "../../../../components/cButton";

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Room Management
          </h1>
          <p className="text-gray-500 mt-1">
            Add, view, and manage rooms for your PG
          </p>
        </div>

        <CButton
          variant="contained"
          onClick={() =>
            navigate("/owner/dashboard/pgManagment/addRooms")
          }
        >
          + Add New Room
        </CButton>
      </div>

      {/* ROOM LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-md shadow p-5 flex flex-col"
          >
            {/* ROOM HEADER */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FaBed className="text-orange-500" />
                <h3 className="font-semibold text-gray-800">
                  Room {room.roomNo}
                </h3>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  room.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : room.status === "Full"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {room.status}
              </span>
            </div>

            {/* ROOM DETAILS */}
            <p className="text-sm text-gray-500 mb-2">
              {room.type}
            </p>

            {/* CAPACITY VISUALIZATION */}
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
              <FaUsers className="text-gray-500" />
              <span>
                {room.occupied} / {room.capacity} Beds Occupied
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full ${
                  room.occupied === room.capacity
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}
                style={{
                  width: `${(room.occupied / room.capacity) * 100}%`,
                }}
              />
            </div>

            {/* ACTIONS */}
            <div className="mt-auto flex gap-3">
              <CButton
                variant="outlined"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <FaRegEye /> View
              </CButton>

              <CButton
                variant="outlined"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <FaEdit /> Edit
              </CButton>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RoomManagement;
