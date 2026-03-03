import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCamera, FaCheckCircle, FaBuilding,
  FaPhoneSquareAlt, FaTrash, FaShieldAlt, FaMapMarkerAlt
} from "react-icons/fa";
import { getProfileImageUrl } from "../../../utils/imageUtils";

import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { deleteOwnerAccount } from "../../../api/api";

const ProfileStatus = () => {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "Aasima Motana",
    role: "Property Owner",
    email: "amotana1607@gmail.com",
    phone: "7487857851",
    emergencyPhone: "",
    businessName: "",
    address: "",
    profileImage: "/images/profileImages/profile1.jpg",
    isVerified: true,
    memberSince: "Feb 2026"
  });

  const [tempData, setTempData] = useState({});

  const sanitizePhone10 = (value) => (value || "").toString().replace(/\D/g, "").slice(0, 10);
  const isValidPhone10 = (value) => /^\d{10}$/.test((value || "").toString());

  useEffect(() => {
    fetchData();
  }, []);

  const syncNavbarName = (updatedProfile) => {
    const freshName =
      updatedProfile?.name ||
      updatedProfile?.fullName ||
      tempData?.name ||
      tempData?.fullName ||
      profileData?.name ||
      profileData?.fullName;

    if (!freshName) return;

    try {
      const existingRaw = localStorage.getItem("user");
      let existingUser = {};
      if (existingRaw) {
        try {
          existingUser = JSON.parse(existingRaw) || {};
        } catch (e) {
          existingUser = {};
        }
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          fullName: freshName,
          name: freshName,
          email: updatedProfile?.email ?? existingUser?.email,
          phone: updatedProfile?.phone ?? existingUser?.phone,
        })
      );
      localStorage.setItem("userName", freshName);

      try {
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5000/api/owner/profile", config);
      if (res.data.success) {
        const incoming = res.data.data || {};
        const normalized = {
          ...incoming,
          name: incoming.name || incoming.fullName || profileData.name,
        };

        setProfileData(normalized);
        setTempData(normalized);

        // Ensure Navbar name isn't stale when landing here.
        syncNavbarName(normalized);
      }
    } catch (error) {
      setTempData(profileData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const cleanedPhone = sanitizePhone10(tempData?.phone);
    const cleanedEmergency = sanitizePhone10(tempData?.emergencyPhone);

    if (cleanedPhone && !isValidPhone10(cleanedPhone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits (numbers only).",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    if (cleanedEmergency && !isValidPhone10(cleanedEmergency)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Emergency Contact",
        text: "Emergency contact must be exactly 10 digits (numbers only).",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.put(
        "http://localhost:5000/api/owner/update-profile",
        { ...tempData, phone: cleanedPhone, emergencyPhone: cleanedEmergency },
        {
        headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data.success) {
        const incoming = res.data.data || {};
        const normalized = {
          ...incoming,
          name: incoming.name || incoming.fullName || tempData.name,
        };

        setProfileData(normalized);
        setTempData(normalized);
        setEditMode(false);

        // Update localStorage so the shared Navbar updates immediately
        syncNavbarName(normalized);

        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Owner identity synced successfully.',
          confirmButtonColor: '#D97706'
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update profile.', confirmButtonColor: '#D97706' });
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.put("http://localhost:5000/api/owner/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const incoming = res.data.data || {};
        const normalized = {
          ...incoming,
          name: incoming.name || incoming.fullName || profileData.name,
        };
        setProfileData(normalized);
        setTempData((prev) => ({ ...prev, profileImage: normalized.profileImage }));
        Swal.fire({
          icon: "success",
          title: "Profile Picture Updated",
          text: "Your owner profile photo has been changed.",
          confirmButtonColor: "#D97706",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Could not update profile picture.",
        confirmButtonColor: "#D97706",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete Account?",
      text: "This will permanently remove your account and all related owner data.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#DC2626"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteOwnerAccount();
      if (res?.data?.success) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("user");

        await Swal.fire({
          icon: "success",
          title: "Account Deleted",
          text: "Your owner account has been removed.",
          confirmButtonColor: "#D97706"
        });

        window.location.href = "/login";
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.response?.data?.message || "Could not delete account.",
        confirmButtonColor: "#D97706"
      });
    }
  };

  // --- Animation Variants ---
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-primary font-black uppercase tracking-tighter text-xl"
      >
        Authenticating Identity...
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      <Navbar />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVars}
        className="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:py-16"
      >
        
        {/* TOP HEADER SECTION */}
        <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none">Account Settings</h1>
            <p className="text-[#4B4B4B] font-medium mt-3">Manage your public profile and property owner identity</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <CButton 
              className={`${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primaryDark'} text-white py-3.5 px-8 rounded-md shadow-lg transition-all w-full md:w-auto font-bold uppercase text-[11px] tracking-wider`}
              onClick={editMode ? handleSave : () => setEditMode(true)}
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </CButton>
            {editMode && (
              <CButton 
              variant ="outlined"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </CButton>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: IDENTITY CARD */}
          <motion.aside variants={itemVars} className="w-full lg:w-1/3">
            <div className="bg-white rounded-md p-8 border border-primary shadow-xl text-center lg:sticky lg:top-24">
              <div className="relative group mx-auto w-48 h-48 mb-6">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  src={getProfileImageUrl(profileData.profileImage)}
                  onError={(e) => {
                    e.currentTarget.src = "/images/profileImages/profile1.jpg";
                  }}
                  className="w-full h-full rounded-full object-cover border-4 border-[#FEF3C7] p-1.5 shadow-inner" 
                  alt="Profile"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 bg-primary p-4 rounded-full text-white shadow-xl transition-colors hover:bg-[#B45309]"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaCamera size={18} />
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </div>

              <div className="inline-flex items-center gap-2 bg-primarySoft px-4 py-2 rounded-full mb-6">
                <FaShieldAlt className="text-primary" size={12}/>
                <span className="text-[10px] font-black uppercase text-primaryDark tracking-[0.15em]">
                  {profileData.isVerified ? "Verified Owner" : "Pending Verification"}
                </span>
              </div>

              <h3 className=" font- text-[#1C1C1C]  tracking-tighter">{profileData.name}</h3>
              <p className="text-[#4B4B4B] text-sm mb-8 font-medium">{profileData.email}</p>
              
              <div className="pt-8 border-t border-[#E5E0D9] flex justify-around">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Since</p>
                  <p className="text-sm font-bold text-[#1C1C1C] mt-1">{profileData.memberSince}</p>
                </div>
                <div className="w-[1px] h-8 bg-[#E5E0D9]"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-primary mt-1 uppercase">Owner</p>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* RIGHT COLUMN: FORM FIELDS */}
          <section className="flex-1 space-y-8">
            <motion.div variants={itemVars} className="bg-white rounded-md p-8 md:p-12 border border-[#E5E0D9] shadow-sm">
              <h3 className="text-2xl font-bold text-[#1C1C1C] mb-12 flex items-center gap-4">
                <motion.span 
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  className="w-1.5 bg-primary rounded-full"
                />
                Identity Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                <AnimatePresence mode="wait">
                  <InputField 
                    label="Full Name" 
                    value={editMode ? tempData.name : profileData.name} 
                    onChange={e => setTempData({...tempData, name: e.target.value})} 
                    editMode={editMode}
                    uppercase
                    key="name"
                  />
                  <InputField 
                    label="Phone Number" 
                    value={editMode ? tempData.phone : profileData.phone} 
                    onChange={e => setTempData({...tempData, phone: sanitizePhone10(e.target.value)})} 
                    editMode={editMode}
                    icon={<FaPhoneSquareAlt />}
                    key="phone"
                  />
                  <InputField 
                    label="Business Name" 
                    value={editMode ? tempData.businessName : profileData.businessName} 
                    onChange={e => setTempData({...tempData, businessName: e.target.value})} 
                    editMode={editMode}
                    placeholder="e.g. Dream PG Rentals"
                    icon={<FaBuilding />}
                    key="business"
                  />
                  <InputField 
                    label="Emergency Contact" 
                    value={editMode ? tempData.emergencyPhone : profileData.emergencyPhone} 
                    onChange={e => setTempData({...tempData, emergencyPhone: sanitizePhone10(e.target.value)})} 
                    editMode={editMode}
                    placeholder="Backup phone number"
                    key="emergency"
                  />
                  <div className="md:col-span-2">
                    <InputField 
                      label="Residential Address" 
                      value={editMode ? tempData.address : profileData.address} 
                      onChange={e => setTempData({...tempData, address: e.target.value})} 
                      editMode={editMode}
                      icon={<FaMapMarkerAlt />}
                      placeholder="Enter full address"
                      key="address"
                    />
                  </div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* DANGER ZONE */}
            <motion.div 
              variants={itemVars}
              whileHover={{ borderColor: "#FCA5A5" }}
              className="bg-red-50/30 rounded-md p-8 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="text-center md:text-left">
                <h4 className="text-red-600 font-black uppercase text-xs tracking-widest">Permanent Actions</h4>
                <p className="text-red-500/70 text-sm mt-1 font-medium">Deleting your account will remove all property listings permanently.</p>
              </div>
              <motion.div whileHover={{ x: 5 }}>
                <CButton 
                  onClick={handleDeleteAccount}
                  className="!bg-white !text-red-500 border border-red-200 hover:!bg-red-500 hover:!text-white flex items-center gap-2 px-8 py-3.5 rounded-md text-[10px] font-black tracking-widest transition-all shadow-sm"
                >
                  <FaTrash size={12}/> DELETE ACCOUNT
                </CButton>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

/* --- REUSABLE INPUT COMPONENT --- */
const InputField = ({ label, value, onChange, editMode, placeholder, icon, uppercase }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-3"
  >
    <label className="text-sm  text-[#4B4B4B] font-semibold tracking-widest flex items-center gap-2 opacity-60">
      <span className="text-primary">{icon}</span> {label}
    </label>
    
    <div className="min-h-[50px] flex items-center">
      {editMode ? (
        <motion.input 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`w-full bg-primarySoft/10 border border-[#E5E0D9] rounded-md px-5 py-4 outline-none focus:border-[#D97706] focus:ring-4 focus:ring-[#FEF3C7] transition-all text-[#1C1C1C] font-semibold ${uppercase ? 'uppercase' : ''}`}
          value={value || ""} 
          onChange={onChange} 
          placeholder={placeholder}
        />
      ) : (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-lg text-[#1C1C1C] font-bold tracking-tight px-1 `}
        >
          {value || "—"}
        </motion.p>
      )}
    </div>
  </motion.div>
);

export default ProfileStatus;
