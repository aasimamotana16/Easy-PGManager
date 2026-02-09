import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaCamera, FaCheckCircle, FaBuilding,
  FaPhoneSquareAlt, FaTrash, FaShieldAlt, FaMapMarkerAlt
} from "react-icons/fa";

import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5000/api/owner/profile", config);
      if (res.data.success) {
        setProfileData(res.data.data);
        setTempData(res.data.data);
      }
    } catch (error) {
      setTempData(profileData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.put("http://localhost:5000/api/owner/update-profile", tempData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProfileData(res.data.data);
        setEditMode(false);
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your information is now up to date.',
          confirmButtonColor: '#D97706'
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update profile.' });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary animate-pulse font-medium">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:py-16">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1C1C1C] uppercase tracking-tighter">Account Settings</h1>
            <p className="text-[#4B4B4B] font-medium mt-2">Manage your public profile and property owner identity</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <CButton 
              className={`${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primaryDark'} text-white py-3 px-8 rounded-xl shadow-lg transition-all w-full md:w-auto font-medium`}
              onClick={editMode ? handleSave : () => setEditMode(true)}
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </CButton>
            {editMode && (
              <CButton 
                className="bg-white text-[#4B4B4B] border border-[#E5E0D9] font-medium py-3 px-8 rounded-xl w-full md:w-auto"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </CButton>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: IDENTITY CARD */}
          <aside className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl p-8 border border-[#E5E0D9] shadow-sm text-center sticky top-24">
              <div className="relative group mx-auto w-48 h-48 mb-6">
                <img 
                  src={profileData.profileImage} 
                  className="w-full h-full rounded-full object-cover border-4 border-[#FEF3C7] p-1.5 shadow-inner" 
                  alt="Profile"
                />
                <button 
                  className="absolute bottom-2 right-2 bg-primary p-3 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaCamera size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              </div>

              <div className="inline-flex items-center gap-2 bg-[#FEF3C7] px-4 py-1.5 rounded-full mb-4">
                <FaShieldAlt className="text-primary" size={12}/>
                <span className="text-xs font-bold uppercase text-primary tracking-widest">
                  {profileData.isVerified ? "Verified Owner" : "Pending Verification"}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#1C1C1C] uppercase tracking-tight">{profileData.name}</h2>
              <p className="text-[#4B4B4B] text-sm mb-6">{profileData.email}</p>
              
              <div className="pt-6 border-t border-[#E5E0D9] flex justify-around">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Since</p>
                  <p className="text-sm font-medium text-[#1C1C1C]">{profileData.memberSince}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Type</p>
                  <p className="text-sm font-medium text-[#1C1C1C]">Owner</p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: FORM FIELDS */}
          <section className="flex-1 space-y-8">
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E5E0D9] shadow-sm">
              <h3 className="text-2xl font-medium text-[#1C1C1C] mb-10 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                <InputField 
                  label="Full Name" 
                  value={editMode ? tempData.name : profileData.name} 
                  onChange={e => setTempData({...tempData, name: e.target.value})} 
                  editMode={editMode}
                  uppercase
                />
                <InputField 
                  label="Phone Number" 
                  value={editMode ? tempData.phone : profileData.phone} 
                  onChange={e => setTempData({...tempData, phone: e.target.value})} 
                  editMode={editMode}
                  icon={<FaPhoneSquareAlt className="text-primary/70" />}
                />
                <InputField 
                  label="Business Name" 
                  value={editMode ? tempData.businessName : profileData.businessName} 
                  onChange={e => setTempData({...tempData, businessName: e.target.value})} 
                  editMode={editMode}
                  placeholder="e.g. Dream PG Rentals"
                  icon={<FaBuilding className="text-primary/70" />}
                />
                <InputField 
                  label="Emergency Contact" 
                  value={editMode ? tempData.emergencyPhone : profileData.emergencyPhone} 
                  onChange={e => setTempData({...tempData, emergencyPhone: e.target.value})} 
                  editMode={editMode}
                  placeholder="Backup phone number"
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Residential Address" 
                    value={editMode ? tempData.address : profileData.address} 
                    onChange={e => setTempData({...tempData, address: e.target.value})} 
                    editMode={editMode}
                    icon={<FaMapMarkerAlt className="text-primary/70" />}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-red-600 font-bold uppercase text-xs tracking-widest">Permanent Actions</h4>
                <p className="text-red-400 text-sm mt-1 font-medium">Deleting your account will remove all property listings and data.</p>
              </div>
              <CButton 
                onClick={() => Swal.fire('Protected', 'Please contact support to delete account', 'warning')}
                className="!bg-white !text-red-500 border border-red-200 hover:!bg-red-500 hover:!text-white flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold shadow-sm"
              >
                <FaTrash size={12}/> DELETE ACCOUNT
              </CButton>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

/* --- REUSABLE INPUT COMPONENT --- */
const InputField = ({ label, value, onChange, editMode, placeholder, icon, uppercase }) => (
  <div className="space-y-2.5">
    {/* Label: Size increased to text-xs, font changed to medium for a cleaner look */}
    <label className="text-xs uppercase text-[#4B4B4B] font-medium tracking-wider flex items-center gap-2">
      {icon} {label}
    </label>
    
    {editMode ? (
      <input 
        className={`w-full bg-white border border-[#E5E0D9] rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-[#FEF3C7] transition-all text-[#1C1C1C] font-normal ${uppercase ? 'uppercase' : ''}`}
        value={value || ""} 
        onChange={onChange} 
        placeholder={placeholder}
      />
    ) : (
      /* Value: font-bold removed, using font-medium for premium feel */
      <p className={`text-lg text-[#1C1C1C] font-medium min-h-[1.5rem] px-1 ${uppercase ? 'uppercase' : ''}`}>
        {value || "—"}
      </p>
    )}
  </div>
);

export default ProfileStatus;