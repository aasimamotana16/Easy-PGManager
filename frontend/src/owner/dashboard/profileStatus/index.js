import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2"; 
import { 
  FaCamera, FaCheckCircle, FaBuilding, 
  FaPhoneSquareAlt, FaTrash, FaShieldCheck 
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
          text: 'Changes saved successfully!',
          confirmButtonColor: '#E67E22' 
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update profile.' });
    }
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
      }
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar/>

      <main className="flex-grow flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full gap-8 p-4 md:p-12">
        
        {/* SIDEBAR CARD */}
        <aside className="w-full lg:w-80">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img 
                src={profileData.profileImage} 
                className="w-44 h-44 rounded-full object-cover border-4 border-orange-500 p-1" 
                alt="Profile"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white" size={24} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            </div>
            
            <h2 className="mt-4 text-2xl font-bold uppercase text-gray-900">{profileData.name}</h2>
            <p className="text-gray-500 text-sm lowercase">{profileData.email}</p>
            
            <div className="mt-2 bg-orange-50 px-4 py-1 rounded-full">
               <p className="text-[10px] font-bold text-orange-600 uppercase">Member Since: {profileData.memberSince}</p>
            </div>
            
            {/* CBUTTON USED HERE */}
            <CButton 
              onClick={() => fileInputRef.current.click()}
              className="mt-6 w-full !bg-white !text-primary border-2 border-primary hover:!bg-primary hover:!text-white transition-all font-bold uppercase text-xs py-3"
            >
              Change Photo
            </CButton>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <section className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#1A202C] uppercase">Profile Settings</h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Owner Identity Management</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {/* VERIFICATION BADGE */}
              {profileData.isVerified && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full shadow-sm">
                  <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Verified Identity</span>
                  <FaCheckCircle className="text-green-500" size={14}/>
                </div>
              )}
              <CButton 
                className="bg-primary text-white font-bold"
                onClick={editMode ? handleSave : () => setEditMode(true)}
              >
                {editMode ? "Save Changes" : "Edit Profile"}
              </CButton>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Full Name</label>
                {editMode ? (
                  <input className="w-full border-b border-gray-200 py-2 outline-none focus:border-orange-500 uppercase" value={tempData.name} onChange={e => setTempData({...tempData, name: e.target.value})} />
                ) : (
                  <p className="text-lg text-gray-800 font-medium uppercase">{profileData.name}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Phone Number</label>
                {editMode ? (
                  <input className="w-full border-b border-gray-200 py-2 outline-none focus:border-orange-500" value={tempData.phone} onChange={e => setTempData({...tempData, phone: e.target.value})} />
                ) : (
                  <p className="text-lg text-gray-800 font-medium">{profileData.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest flex items-center gap-2">
                    <FaBuilding size={12}/> Business / Company Name
                </label>
                {editMode ? (
                  <input className="w-full border-b border-gray-200 py-2 outline-none focus:border-orange-500" value={tempData.businessName} onChange={e => setTempData({...tempData, businessName: e.target.value})} placeholder="e.g. Dream PG Rentals" />
                ) : (
                  <p className="text-lg text-gray-800 font-medium uppercase">{profileData.businessName || "Individual Owner"}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest flex items-center gap-2">
                    <FaPhoneSquareAlt size={12}/> Emergency Number
                </label>
                {editMode ? (
                  <input className="w-full border-b border-gray-200 py-2 outline-none focus:border-orange-500" value={tempData.emergencyPhone} onChange={e => setTempData({...tempData, emergencyPhone: e.target.value})} placeholder="Backup Phone Number" />
                ) : (
                  <p className="text-lg text-gray-800 font-medium uppercase">{profileData.emergencyPhone || "Not Added"}</p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Residential Address</label>
                {editMode ? (
                  <input className="w-full border-b border-gray-200 py-2 outline-none focus:border-orange-500 uppercase" value={tempData.address} onChange={e => setTempData({...tempData, address: e.target.value})} placeholder="Add Your Address" />
                ) : (
                  <p className="text-lg text-gray-800 font-medium uppercase">{profileData.address || "Add Your Address"}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Primary Email</label>
                <p className="text-lg text-gray-500 font-medium lowercase">{profileData.email}</p>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="mt-20 p-8 border border-red-100 rounded-3xl bg-red-50/30 flex justify-between items-center">
              <div>
                <h4 className="text-red-600 font-black uppercase text-sm tracking-widest">Danger Zone</h4>
                <p className="text-red-400 text-[10px] uppercase font-bold mt-1">Deleting your account is permanent and cannot be reversed.</p>
              </div>
              <CButton 
                onClick={handleDeleteAccount}
                className="!bg-white !text-red-500 border border-red-200 hover:!bg-red-500 hover:!text-white flex items-center gap-2 px-6 py-2 text-xs font-bold"
              >
                <FaTrash size={12}/> Delete Account
              </CButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileStatus;