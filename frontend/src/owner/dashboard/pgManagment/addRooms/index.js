import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye, FaImage } from "react-icons/fa";
import Swal from "sweetalert2";

const AddRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get PG data from navigation state
  const pgData = location.state?.propertyData;
  const pgId = location.state?.pgId;

  const [errors, setErrors] = useState({});
  const [roomData, setRoomData] = useState({
    roomType: "",
    totalRooms: "",
    bedsPerRoom: "",
    description: "",
    images: [],
  });

  const validateForm = () => {
    let newErrors = {};
    if (!roomData.roomType.trim()) newErrors.roomType = "Room Type is required";
    if (!roomData.totalRooms) newErrors.totalRooms = "Total Rooms is required";
    if (!roomData.bedsPerRoom) newErrors.bedsPerRoom = "Beds per room is required";
    if (roomData.images.length === 0) newErrors.images = "At least one room image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  /* IMAGE HANDLERS */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setRoomData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
    setErrors(prev => ({ ...prev, images: null }));
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
    window.open(fileURL, "_blank");
  };

  const handleSaveRoom = async () => {
    if (!validateForm()) return;

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
        pgId: pgId // Ensure pgId is passed to associate the room
      };

      const response = await axios.post(
        "http://localhost:5000/api/owner/add-room",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Room added successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/owner/dashboard/pgManagment/roomPrice", {
            state: { pgId: pgId }
          });
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to save room",
        icon: "error",
      });
    }
  };

  const ErrorMsg = ({ name }) => (
    errors[name] ? <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors[name]}</p> : null
  );

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* PAGE HEADER */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
          Add Rooms
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Adding rooms for <span className="font-semibold text-gray-700">{pgData?.name || 'Your Property'}</span>
        </p>
      </div>

      {/* FORM CARD */}
      <CFormCard className="max-w-5xl mx-auto border-t-4 border-primary shadow-lg p-4 md:p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">
          Room Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <CInput
              label="Room Type"
              name="roomType"
              value={roomData.roomType}
              onChange={handleChange}
              placeholder="e.g., Single Room, Double Room"
            />
            <ErrorMsg name="roomType" />
          </div>

          <div>
            <CInput
              label="Total Rooms of This Type"
              type="number"
              name="totalRooms"
              value={roomData.totalRooms}
              onChange={handleChange}
              placeholder="0"
            />
            <ErrorMsg name="totalRooms" />
          </div>

          <div>
            <CInput
              label="Beds Per Room"
              type="number"
              name="bedsPerRoom"
              value={roomData.bedsPerRoom}
              onChange={handleChange}
              placeholder="0"
            />
            <ErrorMsg name="bedsPerRoom" />
          </div>

          <div className="md:col-span-2">
            <CInput
              label="Room Description"
              type="textarea"
              name="description"
              value={roomData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe facilities like Attached Washroom, Balcony, etc."
            />
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Upload Room Images
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 cursor-pointer
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-primary file:text-white 
                  file:cursor-pointer "
              />
              <ErrorMsg name="images" />
            </div>
          </div>
        </div>

        {/* IMAGE PREVIEW LIST */}
        {roomData.images.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomData.images.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 border border-primary p-3 rounded-md bg-orange-50"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FaImage className="text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700 text-xs font-medium truncate">
                    {file.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => viewImage(file)}
                    className="p-2 text-blue-600 hover:bg-white rounded-full transition-colors"
                    title="View Image"
                  >
                    <FaEye />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-red-600 hover:bg-white rounded-full transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="text-center mt-10">
          <CButton 
            size="lg" 
            onClick={handleSaveRoom}
            className="w-full md:w-auto px-12 py-3  text-white font-bold rounded-md shadow-md transition-all"
          >
            Save Room & Continue
          </CButton>
        </div>
      </CFormCard>
    </div>
  );
};

export default AddRooms;