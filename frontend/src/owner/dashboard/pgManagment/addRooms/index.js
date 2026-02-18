import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { FaTrash, FaEye, FaImage, FaDoorOpen, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

const AddRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pgData = location.state?.propertyData;
  const pgId = location.state?.pgId;
  const fromCreate = !!location.state?.fromCreate; // Boolean flag from Add Property

  // Debug: log navigation state to diagnose runtime issues
  useEffect(() => {
    try {
      console.log("[AddRooms] location.state:", location.state, "pgId:", pgId, "fromCreate:", fromCreate);
    } catch (e) {
      console.error("[AddRooms] error logging state", e);
    }
  }, [location.state, pgId, fromCreate]);

  const [errors, setErrors] = useState({});
  const [roomData, setRoomData] = useState({
    roomType: "",
    totalRooms: "",
    bedsPerRoom: "",
    description: "",
    mainImage: null,
    subImages: [],
  });

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.type === "number" && document.activeElement === e.target) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!String(roomData.roomType || "").trim()) newErrors.roomType = "Room Type is required";
    if (!roomData.totalRooms) newErrors.totalRooms = "Total Rooms is required";
    if (!roomData.bedsPerRoom) newErrors.bedsPerRoom = "Beds per room is required";
    
    // Main image is ONLY required if we are coming from "Create" flow
    if (fromCreate && !roomData.mainImage) {
      newErrors.mainImage = "Main room image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRoomData((prev) => ({ ...prev, mainImage: file }));
    setErrors(prev => ({ ...prev, mainImage: null }));
  };

  const handleSubImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Logic: If existing PG (not fromCreate), limit total gallery images to 3
    if (!fromCreate) {
      const currentCount = roomData.subImages.length;
      if (currentCount + files.length > 3) {
        Swal.fire({
          icon: 'warning',
          title: 'Limit Reached',
          text: 'You can only upload a maximum of 3 gallery images for existing properties.',
          confirmButtonColor: "#D97706",
        });
        e.target.value = "";
        return;
      }
    }

    setRoomData((prev) => ({ ...prev, subImages: [...prev.subImages, ...files] }));
    e.target.value = ""; 
  };

  const removeSubImage = (index) => {
    setRoomData((prev) => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index),
    }));
  };

  const viewImage = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  const handleSaveRoom = async () => {
    if (!validateForm()) return;

    try {
      // Instead of creating the room immediately, navigate user to pricing
      // flow where they must set a price. The actual room creation will
      // occur after pricing is saved. Pass the collected roomData so the
      // pricing page can pre-fill variant label and handle image upload.
      navigate("/owner/dashboard/pgManagment/roomPrice", { state: { pgId, fromCreate, roomData, createRoomFlow: true } });
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
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C]">Add Rooms</h1>
        <p className="text-[#4B4B4B] mt-2">
          Adding rooms for <span className="font-bold text-primary">{pgData?.name || 'Your Property'}</span>
        </p>
      </div>

      <CFormCard className="max-w-5xl mx-auto bg-white border border-[#E5E0D9] shadow-sm rounded-md overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9] bg-primarysoft/40">
          <h2 className="text-h2-sm lg:text-h2 font-bold text-[#1C1C1C] flex items-center gap-2">
            <FaDoorOpen className="text-primary" /> Room Specifications
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <CInput label="Room Type" name="roomType" value={roomData.roomType} onChange={handleChange} placeholder="e.g., Single Sharing" />
              {errors.roomType && <p className="text-red-500 text-xs mt-1 font-bold">{errors.roomType}</p>}
            </div>

            <CInput label="Total Rooms" type="number" name="totalRooms" value={roomData.totalRooms} onChange={handleChange} placeholder="0" />
            <CInput label="Beds Per Room" type="number" name="bedsPerRoom" value={roomData.bedsPerRoom} onChange={handleChange} placeholder="0" />

            <div className="md:col-span-2">
              <CInput label="Room Description" type="textarea" name="description" value={roomData.description} onChange={handleChange} rows={3} placeholder="Describe facilities..." />
            </div>

            {/* LOGIC: Show Main Image only if redirected from Add Property (fromCreate) */}
            {fromCreate && (
              <div className="md:col-span-2 border-t pt-6">
                <label className="block text-sm font-bold text-[#1C1C1C] mb-3 flex items-center gap-2">
                  <FaStar className="text-primary text-xs" /> Main Room Photo <span className="text-xs font-normal text-gray-500">(This will be shown first)</span>
                </label>
                
                {!roomData.mainImage ? (
                  <div className="p-8 bg-gray-50 rounded-md border border-dashed border-[#E5E0D9] hover:border-primary transition-all text-center">
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" id="main-img" />
                    <label htmlFor="main-img" className="cursor-pointer group">
                      <FaImage className="mx-auto text-3xl text-gray-300 mb-2 group-hover:text-primary" />
                      <span className="text-primary font-bold">Upload Main Image</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-primary rounded-md bg-primarySoft/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-primary p-2 rounded-md"><FaImage className="text-white" /></div>
                      <span className="text-sm font-bold text-[#1C1C1C] truncate">{roomData.mainImage.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => viewImage(roomData.mainImage)} className="p-2 text-blue-500"><FaEye /></button>
                      <button onClick={() => setRoomData(prev => ({...prev, mainImage: null}))} className="p-2 text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                )}
                {errors.mainImage && <p className="text-red-500 text-xs mt-2 font-bold">{errors.mainImage}</p>}
              </div>
            )}

            {/* SECTION 2: SUB IMAGES (GALLERY) */}
            <div className="md:col-span-2 border-t pt-6">
              <label className="block text-sm font-bold text-[#1C1C1C] mb-3">
                Room Gallery {!fromCreate && <span className="text-primary">(Max 3 photos)</span>}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roomData.subImages.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-[#E5E0D9] rounded-md bg-white shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-[#FEF3C7] p-2 rounded-md"><FaImage className="text-primary" /></div>
                      <span className="text-sm text-[#1C1C1C] truncate">{file.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => viewImage(file)} className="p-2 text-blue-500"><FaEye /></button>
                      <button onClick={() => removeSubImage(index)} className="p-2 text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                ))}

                {/* Hide Plus Button if limit reached for existing PGs */}
                {(!fromCreate && roomData.subImages.length < 3) || fromCreate ? (
                  <label htmlFor="sub-img" className="flex items-center justify-center p-4 border border-dashed border-[#E5E0D9] hover:border-[#D97706] rounded-md cursor-pointer transition-all group bg-gray-50">
                    <input type="file" accept="image/*" multiple onChange={handleSubImagesUpload} className="hidden" id="sub-img" />
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-400 group-hover:text-primary">+</span>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-primary">Add Gallery Photo</span>
                    </div>
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t pt-8">
            <CButton onClick={handleSaveRoom} className="w-full md:w-auto px-12 py-4 bg-primary hover:bg-primaryDark text-white font-bold rounded-md shadow-lg">
              Save Room & Continue
            </CButton>
          </div>
        </div>
      </CFormCard>
    </div>
  );
};

export default AddRooms;