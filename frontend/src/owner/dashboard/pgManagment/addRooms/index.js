import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye } from "react-icons/fa";

const AddRooms = () => {
  const navigate = useNavigate();

  /* TEMP PG CONTEXT (FRONTEND ONLY) */
  const pgName = "Green View PG";

  const [roomData, setRoomData] = useState({
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

  const handleSaveRoom = () => {
    console.log("ROOM DATA 👉", roomData);
    alert("Room saved successfully (frontend)");
    navigate("/owner/dashboard/pgManagment/roomPrice");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* PAGE HEADER */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-primary">
          Add Rooms
        </h1>
        <p className="text-gray-500 mt-1">
          Adding rooms for <span className="font-semibold">{pgName}</span>
        </p>
      </div>

      {/* FORM CARD */}
      <CFormCard className="max-w-5xl mx-auto border border-gray-300">

        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Room Details
        </h2>

        <div className="space-y-5">

          

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
