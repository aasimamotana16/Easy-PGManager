import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaEdit, FaCrown, FaCalendarAlt, FaEnvelope, FaPhoneAlt, 
  FaMapMarkerAlt, FaUser, FaBuilding, FaShieldAlt, FaTrash 
} from "react-icons/fa";

import Navbar from "../../../components/navbar"; 
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";

const ProfileStatus = () => {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // personal, portfolio, security
  
  const [profileData, setProfileData] = useState({
    name: "Tester", role: "Owner", email: "tester@gmail.com", phone: "+91 98765 43210", 
    address: "Nadiad, Gujarat", profileImage: "/images/profileImages/profile1.jpg",
    registrationDate: "01 Jan 2024"
  });

  const [tempData, setTempData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5000/api/owner/profile", config);
      if (res.data.success) {
        setProfileData(res.data.data);
        setTempData(res.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/owner/update-profile", tempData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProfileData(res.data.data);
        setEditMode(false);
        alert("Profile Updated Successfully!");
      }
    } catch (error) {
      alert("Update failed.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar/>

      <main className="flex-grow flex max-w-[1400px] mx-auto w-full gap-8 p-6 md:p-12">
        
        {/* LEFT SIDEBAR - Matches User Profile Style */}
        <aside className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group">
              <img 
                src={profileData.profileImage} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-primary p-1" 
              />
              <button className="absolute bottom-2 right-2 bg-black text-white p-2 rounded-md border-2 border-white">
                <FaEdit size={12} />
              </button>
            </div>
            
            <h2 className="mt-4 text-2xl   uppercase  text-gray-900">{profileData.name}</h2>
            <p className="text-gray-500  text-xl  ">{profileData.email}</p>
            
            <button className="mt-6 w-full py-3 border-2 border-orange-500 text-orange-500  rounded-xl uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">
              Change Photo
            </button>
          </div>

          {/*<div className="bg-black rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">Account Strength</p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black">100%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[100%]"></div>
              </div>
            </div>
          </div>*/}
        </aside>

        {/* RIGHT CONTENT AREA */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 uppercase ">Profile Settings</h1>
              <p className="text-gray-500 text-xl  uppercase tracking-widest mt-1">Owner Identity Management</p>
            </div>
            <CButton 
              className="bg-primary  text-base"
              onClick={editMode ? handleSave : () => setEditMode(true)}
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </CButton>
          </div>

          {/* TABS MENU */}
          <div className="flex gap-4 mb-8">
            {[
              { id: "personal", label: "Personal", icon: <FaUser /> },
              { id: "portfolio", label: "Portfolio", icon: <FaBuilding /> },
              { id: "security", label: "Security", icon: <FaShieldAlt /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md  uppercase tracking-widest text-[10px] transition-all ${
                  activeTab === tab.id ? "bg-primary text-white" : "bg-white text-gray-500 border border-gray-100"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT - Structured grid like User Profile */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 min-h-[500px]">
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <label className="text-[10px]  uppercase text-gray-500 ">Full Name</label>
                  {editMode ? (
                    <input className="w-full border-b-2 border-gray-100 py-2  outline-none focus:border-primary" value={tempData.name} onChange={e => setTempData({...tempData, name: e.target.value})} />
                  ) : (
                    <p className="text-lg  text-gray-800 uppercase">{profileData.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px]  uppercase text-gray-500 ">Phone Number</label>
                  {editMode ? (
                    <input className="w-full border-b-2 border-gray-100 py-2  outline-none focus:border-primary" value={tempData.phone} onChange={e => setTempData({...tempData, phone: e.target.value})} />
                  ) : (
                    <p className="text-lg  text-gray-800 uppercase">{profileData.phone}</p>
                  )}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px]  uppercase text-gray-500 ">Address</label>
                  {editMode ? (
                    <input className="w-full border-b-2 border-gray-100 py-2  outline-none focus:border-primary" value={tempData.address} onChange={e => setTempData({...tempData, address: e.target.value})} />
                  ) : (
                    <p className="text-lg  text-gray-800 uppercase">{profileData.address}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px]  uppercase text-gray-500 ">Email Address</label>
                  <p className="text-lg  text-gray-800 uppercase">{profileData.email}</p>
                </div>
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="space-y-8">
                <div className="bg-orange-50 p-6 rounded-md border border-orange-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-4 rounded-md text-white shadow-lg shadow-orange-100"><FaCrown size={24}/></div>
                    <div>
                      <h4 className=" uppercase  text-gray-900">Premium Owner</h4>
                      <p className="text-gray-400 text-[10px]  uppercase tracking-widest">Renewal: 31 Dec 2026</p>
                    </div>
                  </div>
                  <span className="bg-green-500 text-white text-[9px]  px-4 py-2 rounded-md uppercase tracking-widest">Active</span>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                 <div className="p-6 border border-red-100 rounded-md bg-red-50 flex justify-between items-center">
                    <div>
                      <h4 className=" text-red-600 uppercase ">Danger Zone</h4>
                      <p className="text-red-400 text-[10px]  uppercase tracking-widest">Deleting your account is permanent.</p>
                    </div>
                    <button className="flex items-center gap-2 text-red-600  uppercase text-[10px] tracking-widest border-2 border-red-200 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                      <FaTrash /> Delete Account
                    </button>
                 </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileStatus;