import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";

const AddRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get PG data from navigation state
  const pgData = location.state?.propertyData;
  const pgId = location.state?.pgId;

  const [roomData, setRoomData] = useState({
    roomType: "",
    totalRooms: "",
    bedsPerRoom: "",
    description: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  /* IMAGE HANDLERS */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setRoomData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setRoomData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const viewImage = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  const handleSaveRoom = async () => {
    // Validation
    if (!roomData.roomType.trim()) {
      Swal.fire("Warning!", "Room Type is required", "warning");
      return;
    }
    if (!roomData.totalRooms) {
      Swal.fire("Warning!", "Total Rooms is required", "warning");
      return;
    }
    if (!roomData.bedsPerRoom) {
      Swal.fire("Warning!", "Beds Per Room is required", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        Swal.fire("Error!", "Please login to add rooms", "error");
        return;
      }

      const dataToSend = {
        roomType: roomData.roomType,
        totalRooms: parseInt(roomData.totalRooms),
        bedsPerRoom: parseInt(roomData.bedsPerRoom),
        description: roomData.description,
      };

      console.log("Sending room data:", dataToSend);

      const response = await axios.post(
        "http://localhost:5000/api/owner/add-room",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Room response:", response.data);

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Room added successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/owner/dashboard/pgManagment/roomPrice", {
            state: { pgId: pgId }
          });
        });
      }
    } catch (error) {
      console.error("Error saving room:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to save room",
        icon: "error",
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* PAGE HEADER */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-primary">
          Add Rooms
        </h1>
        <p className="text-gray-500 mt-1">
          Adding rooms for <span className="font-semibold">{pgData?.name || 'PG Property'}</span>
        </p>
      </div>

      {/* FORM CARD */}
      <CFormCard className="max-w-5xl mx-auto border border-gray-300">

        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Room Details
        </h2>

        <div className="space-y-5">

          <CInput
            label="Room Type"
            name="roomType"
            value={roomData.roomType}
            onChange={handleChange}
            placeholder="e.g., Single Room, Double Room, Deluxe Room"
          />

          <CInput
            label="Total Rooms"
            type="number"
            name="totalRooms"
            value={roomData.totalRooms}
            onChange={handleChange}
          />

          <CInput
            label="Beds Per Room"
            type="number"
            name="bedsPerRoom"
            value={roomData.bedsPerRoom}
            onChange={handleChange}
          />

          {/* TEXTAREA USING CINPUT */}
          <CInput
            label="Room Description"
            type="textarea"
            name="description"
            value={roomData.description}
            onChange={handleChange}
            placeholder="Room facilities, furniture, special notes"
          />

          {/* IMAGE UPLOAD */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Upload Room Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>

          {/* IMAGE LIST */}
          {roomData.images.length > 0 && (
            <div className="space-y-2 mt-4">
              {roomData.images.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border p-2 rounded-md bg-gray-50"
                >
                  <span className="flex-1 text-gray-700 text-sm truncate">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => viewImage(file)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ACTION */}
          <div className="text-center mt-8">
            <CButton size="lg" onClick={handleSaveRoom}>
              Save Room & Continue
            </CButton>
          </div>

        </div>
      </CFormCard>
    </div>
  );
};

export default AddRooms;
