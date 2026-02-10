import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye, FaImage, FaDoorOpen } from "react-icons/fa";
import Swal from "sweetalert2";

const AddRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // --- BULLETPROOF SCROLL FIX ---
  useEffect(() => {
    const handleWheel = (e) => {
      // Check if the scrolled element is a number input and currently focused
      if (e.target.type === "number" && document.activeElement === e.target) {
        e.preventDefault();
      }
    };

    // 'passive: false' is required to allow e.preventDefault()
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setRoomData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
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
      const dataToSend = {
        roomType: roomData.roomType,
        totalRooms: parseInt(roomData.totalRooms),
        bedsPerRoom: parseInt(roomData.bedsPerRoom),
        description: roomData.description,
        pgId: pgId 
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
          confirmButtonColor: "#D97706",
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
        confirmButtonColor: "#D97706",
      });
    }
  };

  return (
    <div className="p-4 md:p-10 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C]">Add Rooms</h1>
        <p className="text-[#4B4B4B] mt-2">
          Adding rooms for <span className="font-bold text-[#D97706]">{pgData?.name || 'Your Property'}</span>
        </p>
      </div>

      {/* FORM CARD */}
      <CFormCard className="max-w-5xl mx-auto bg-white border border-[#E5E0D9] shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9] bg-[#FEF3C7]/40">
          <h2 className="text-h2-sm lg:text-h2 font-bold text-[#1C1C1C] flex items-center gap-2">
            <FaDoorOpen className="text-[#D97706]" /> Room Specifications
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <CInput
                label="Room Type"
                name="roomType"
                value={roomData.roomType}
                onChange={handleChange}
                placeholder="e.g., Single Sharing, Deluxe Double"
              />
              {errors.roomType && <p className="text-red-500 text-xs mt-1 font-bold">{errors.roomType}</p>}
            </div>

            <div>
              <CInput
                label="Total Rooms"
                type="number"
                name="totalRooms"
                value={roomData.totalRooms}
                onChange={handleChange}
                placeholder="0"
              />
              {errors.totalRooms && <p className="text-red-500 text-xs mt-1 font-bold">{errors.totalRooms}</p>}
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
              {errors.bedsPerRoom && <p className="text-red-500 text-xs mt-1 font-bold">{errors.bedsPerRoom}</p>}
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
              <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                Upload Room Images
              </label>
              <div className="p-10 bg-gray-50 rounded-xl border-2 border-dashed border-[#E5E0D9] hover:border-[#D97706] transition-all text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="room-img"
                />
                <label htmlFor="room-img" className="cursor-pointer group">
                  <FaImage className="mx-auto text-4xl text-gray-300 mb-3 group-hover:text-[#D97706] transition-colors" />
                  <span className="text-[#D97706] font-bold">Click to upload room photos</span>
                  <p className="text-xs text-[#4B4B4B] mt-1">PNG, JPG or JPEG</p>
                </label>
              </div>
              {errors.images && <p className="text-red-500 text-xs mt-2 font-bold">{errors.images}</p>}
            </div>
          </div>

          {/* IMAGE PREVIEW LIST */}
          {roomData.images.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roomData.images.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-[#E5E0D9] rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-[#FEF3C7] p-2 rounded-md"><FaImage className="text-[#D97706]" /></div>
                    <span className="text-sm font-medium text-[#1C1C1C] truncate">{file.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => viewImage(file)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all"><FaEye /></button>
                    <button onClick={() => removeImage(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="mt-12 border-t pt-8">
            <CButton 
              onClick={handleSaveRoom}
              className="w-full md:w-auto px-12 py-4 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-lg shadow-lg transition-all"
            >
              Save Room & Continue
            </CButton>
          </div>
        </div>
      </CFormCard>
    </div>
  );
};

export default AddRooms;