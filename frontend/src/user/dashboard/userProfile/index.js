import React, { useEffect, useState, useRef } from "react";
import CButton from "../../../components/cButton";
import {
  getUserProfile,
  updateProfilePicture,
  removeProfilePicture,
  updateUserProfile,
} from "../../../api/api";
import { FaUserEdit, FaCamera, FaTrash, FaCheckCircle, FaUserShield } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    try {
      setLoading(true);
      const res = await updateProfilePicture(formDataObj);
      if (res.data.success) await fetchProfile();
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm("Remove profile picture?")) {
      try {
        const res = await removeProfilePicture();
        if (res.data.success) await fetchProfile();
      } catch (err) {
        console.error("Remove failed", err);
      }
    }
  };

  const openEditModal = () => {
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      city: user?.city || "",
      state: user?.state || "",
      emergencyContact: {
        contactName: user?.emergencyContact?.contactName || "",
        relationship: user?.emergencyContact?.relationship || "",
        phoneNumber: user?.emergencyContact?.phoneNumber || "",
      },
    });
    setIsModalOpen(true);
  };

  const handleSaveInfo = async () => {
    try {
      setLoading(true);
      const res = await updateUserProfile(formData);
      if (res.data.success) {
        await fetchProfile();
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black uppercase animate-pulse">Syncing Profile...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50 min-h-screen space-y-8 lg:space-y-12">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-800">
            User Profile
          </h1>
          <p className="text-[10px] md:text-sm lg:text-lg text-gray-500 uppercase tracking-[0.2em] font-bold">
            Personal Identity & Security Settings
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm self-start">
          <FaCheckCircle className="text-green-500" />
          <span className="text-[10px] md:text-xs font-black uppercase text-green-700 tracking-tighter">
            {user?.role || "Tenant"} Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* 2. PROFILE PICTURE & COMPLETION CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl transition-transform group-hover:scale-105">
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-50 flex items-center justify-center text-4xl lg:text-6xl font-black text-orange-500">
                    {user?.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <button onClick={handleUploadClick} className="absolute bottom-2 right-2 bg-black text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
                <FaCamera size={16} />
              </button>
            </div>

            <h2 className="mt-6 text-xl lg:text-3xl font-black uppercase text-gray-800">{user?.fullName || "Guest"}</h2>
            <p className="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest">{user?.email}</p>
            
            <div className="flex gap-3 mt-8 w-full">
              <CButton onClick={handleRemove} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 hover:text-red-500 transition-all">
                <FaTrash className="inline mr-2" /> Remove
              </CButton>
            </div>
          </div>

          <div className="bg-black rounded-[2rem] p-8 text-white flex flex-col items-center">
             <h3 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] mb-6">Profile Strength</h3>
             <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-gray-800" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-orange-500" strokeDasharray={`${user?.profileCompletion || 0}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl lg:text-3xl font-black">{user?.profileCompletion || 0}%</span>
                </div>
             </div>
             <p className="text-[9px] lg:text-xs font-bold text-gray-400 mt-6 uppercase text-center leading-relaxed">
               Complete your data to <br/> unlock verified status
             </p>
          </div>
        </div>

        {/* 3. INFORMATION DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          {/* PERSONAL INFO */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight text-gray-800">Personal Data</h3>
              <CButton onClick={openEditModal} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">
                <FaUserEdit className="inline mr-2" /> Edit Info
              </CButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
              <Info label="Full Name" value={user?.fullName} />
              <Info label="Phone Number" value={user?.phone || "Not Set"} />
              <Info label="City" value={user?.city || "Not Set"} />
              <Info label="State" value={user?.state || "Not Set"} />
              <Info label="Email Address" value={user?.email} className="md:col-span-2 border-t pt-6" />
            </div>
          </div>

          {/* EMERGENCY INFO */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10">
            <div className="flex items-center gap-3 mb-10">
              <FaUserShield className="text-orange-500 text-xl" />
              <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight text-gray-800">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
              <Info label="Contact Person" value={user?.emergencyContact?.contactName} />
              <Info label="Relationship" value={user?.emergencyContact?.relationship} />
              <Info label="Emergency Phone" value={user?.emergencyContact?.phoneNumber} />
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 w-full max-w-2xl space-y-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div>
              <h3 className="text-2xl lg:text-4xl font-black uppercase text-primary tracking-tighter">Update Profile</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Changes reflect instantly on your ID</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Full Name</label>
                <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Phone</label>
                <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">City</label>
                <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">State</label>
                <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
              </div>

              <div className="md:col-span-2 pt-4 border-t">
                 <p className="text-xs font-black text-orange-500 uppercase mb-4 tracking-widest">Emergency Contact Data</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold outline-none" placeholder="Contact Name" value={formData.emergencyContact.contactName} onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, contactName: e.target.value}})} />
                    <input className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold outline-none" placeholder="Emergency Phone" value={formData.emergencyContact.phoneNumber} onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phoneNumber: e.target.value}})} />
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <CButton onClick={handleSaveInfo} className="flex-1 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all">Save Profile</CButton>
              <CButton onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest">Discard</CButton>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center pb-10">
        <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-300">
          Secure Identity Management Verified
        </span>
      </div>
    </div>
  );
};

const Info = ({ label, value, className = "" }) => (
  <div className={`flex flex-col gap-1.5 group transition-all ${className}`}>
    <div className="flex items-center gap-2 text-gray-400 group-hover:text-orange-500 transition-colors">
      <p className="text-[9px] md:text-[11px] lg:text-[12px] font-black uppercase tracking-widest">
        {label}
      </p>
    </div>
    <p className="text-sm md:text-lg lg:text-2xl font-black text-gray-900 break-words leading-tight uppercase">
      {value || "Not Set"}
    </p>
  </div>
);

export default Profile;