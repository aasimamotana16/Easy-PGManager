import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye } from "react-icons/fa";

const AddRooms = () => {
  const navigate = useNavigate();

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

  /* ===== IMAGE HANDLERS ===== */
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

  const handleSaveRoom = () => {
    console.log("ROOM DATA 👉", roomData);
    alert("Room saved successfully (frontend)");
    // Navigate to Room Price page
    navigate("/owner/dashboard/pgManagment/roomPrice");
  };

  return (
    <div className="max-w-5xl mx-auto my-6 px-2">
      <h2 className="text-3xl font-bold text-center text-amber-600 mb-6">
        Add Rooms
      </h2>

      <CFormCard className="border border-gray-400 relative">
        <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
          Room Details
        </span>

        <div className="space-y-4 mt-4">
          <CInput
            label="Room Type"
            name="roomType"
            value={roomData.roomType}
            onChange={handleChange}
            placeholder="Single / Double / Triple"
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

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Room Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={roomData.description}
              onChange={handleChange}
              placeholder="Facilities, rules, room details"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">
              Upload Room Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>

          {/* Image List */}
          {roomData.images.length > 0 && (
            <div className="space-y-2 mt-4">
              {roomData.images.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border p-2 rounded"
                >
                  <span className="flex-1 text-gray-700 text-sm">
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

          {/* Action */}
          <div className="text-center mt-6">
            <CButton onClick={handleSaveRoom}>
              Save Room & Continue
            </CButton>
          </div>
        </div>
      </CFormCard>
    </div>
  );
};

export default AddRooms;
