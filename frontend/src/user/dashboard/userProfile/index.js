import React, { useEffect, useState, useRef } from "react";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import {
  getUserProfile,
  updateProfilePicture,
  removeProfilePicture,
  updateUserProfile,
} from "../../../api/api";
import { 
  FaUserEdit, FaCamera, FaTrash, FaCheckCircle, 
  FaUserShield, FaUserAlt, FaBriefcase, FaCreditCard, FaWallet
} from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.data.success) setUser(res.data.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

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
      ...user,
      emergencyContact: { ...user?.emergencyContact },
      bankDetails: { ...user?.bankDetails },
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
    <div className="flex flex-col min-h-screen bg-gray-50 font-poppins">
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {/* --- LEFT SIDEBAR --- */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-r border-gray-100 p-6 lg:p-8 lg:h-screen lg:sticky lg:top-0">
          <div className="flex flex-row lg:flex-col items-center gap-6 lg:gap-0">
            <div className="relative group">
              <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-3xl lg:text-5xl font-black text-white uppercase">
                    {user?.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <button onClick={handleUploadClick} className="absolute bottom-0 right-0 bg-black text-white p-2 lg:p-3 rounded-full hover:bg-primary transition-colors">
                <FaCamera size={12} />
              </button>
            </div>
            
            <div className="flex-1 lg:mt-6 text-left lg:text-center">
              <h2 className="text-2xl lg:text-xl font-black uppercase text-gray-800 ">{user?.fullName || "User"}</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1 truncate max-w-[150px] lg:max-w-full">{user?.email}</p>
              <button onClick={handleRemove} className="mt-2 text-red-500 text-xs font-black uppercase hover:underline lg:hidden">Remove Photo</button>
            </div>
          </div>

          <div className="hidden lg:block">
              <CButton onClick={handleRemove} className="mt-6 w-full bg-gray-50 py-3 text-[10px] uppercase text-gray-600">
                  <FaTrash className="inline mr-2" /> Remove Photo
              </CButton>
              <div className="w-full mt-10 bg-black rounded-3xl p-6 text-white">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase ">Profile Strength</span>
                      <span className="text-orange-500 font-black">{user?.profileCompletion || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full transition-all duration-1000" style={{width: `${user?.profileCompletion || 0}%`}}></div>
                  </div>
              </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 p-4 lg:p-10 max-w-6xl w-full mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-black uppercase text-gray-800 ">Profile Settings</h1>
              <p className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Verified Identity Management</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <FaCheckCircle className="text-green-500" />
              <span className="text-[10px] lg:text-xs font-black uppercase text-green-700">Verified User</span>
            </div>
          </div>

          {/* TAB NAVIGATION + EDIT BUTTON (AS PER SCREENSHOT) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                {id: 'personal', label: 'Personal', icon: <FaUserAlt size={14}/>},
                {id: 'professional', label: 'Academic', icon: <FaBriefcase size={14}/>},
                {id: 'emergency', label: 'Emergency', icon: <FaUserShield size={14}/>},
                {id: 'payment', label: 'Payments', icon: <FaWallet size={14}/>}
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-md text-[11px] font-black uppercase transition-all whitespace-nowrap border ${
                    activeTab === tab.id 
                    ? "bg-primary text-white border-primary shadow-md" 
                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* THE RIGHT-SIDE EDIT BUTTON */}
            <CButton onClick={openEditModal} className="text-white rounded-md text-[11px] uppercase px-6 py-2.5 flex items-center gap-2 shadow-sm">
              <FaUserEdit size={16} /> Edit
            </CButton>
          </div>

          {/* DATA CARD */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-10 relative">
            <h3 className="text-lg font-black uppercase text-gray-800 mb-8 border-b border-gray-50 pb-4">
               {activeTab} Info
            </h3>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                      <Info label="Full Name" value={user?.fullName} />
                      <Info label="Phone" value={user?.phone} />
                      <Info label="Age" value={user?.age} />
                      <Info label="Blood Group" value={user?.bloodGroup} />
                      <Info label="City" value={user?.city} />
                      <Info label="State" value={user?.state} />
                      <Info label="Email" value={user?.email} className="sm:col-span-2 border-t pt-8 mt-4" />
                  </div>
              )}
              {activeTab === 'professional' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Info label="Status" value={user?.occupationType} className="capitalize" />
                      <Info label="Qualification" value={user?.education} />
                      {user?.occupationType === 'student' ? (
                          <>
                              <Info label="College" value={user?.collegeName} />
                              <Info label="Year" value={user?.collegeYear} />
                              <Info label="Address" value={user?.collegeAddress} className="sm:col-span-2" />
                          </>
                      ) : (
                          <>
                              <Info label="Company" value={user?.companyName} />
                              <Info label="Work Address" value={user?.companyAddress} className="sm:col-span-2" />
                          </>
                      )}
                  </div>
              )}
              {activeTab === 'emergency' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Info label="Guardian Name" value={user?.emergencyContact?.contactName} />
                      <Info label="Relationship" value={user?.emergencyContact?.relationship} />
                      <Info label="Guardian Phone" value={user?.emergencyContact?.phoneNumber} className="sm:col-span-2" />
                  </div>
              )}
              {activeTab === 'payment' && (
                  <div className="space-y-8">
                      <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                          <p className="text-[10px] font-black uppercase text-primary mb-6 flex items-center gap-2">
                             <FaCreditCard /> Settlement Bank
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <Info label="Holder" value={user?.bankDetails?.holderName} />
                              <Info label="Bank" value={user?.bankDetails?.bankName} />
                              <Info label="IFSC" value={user?.bankDetails?.ifsc} />
                              <Info label="Account" value={user?.bankDetails?.accountNumber ? `XXXXXX${user.bankDetails.accountNumber.slice(-4)}` : "Not Set"} />
                          </div>
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* --- MODAL (Kept same logic, updated styling) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8 border-b bg-white">
              <h3 className="text-xl lg:text-2xl font-black uppercase text-primary leading-none">Update Profile</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Identity Sync Engine</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
               {/* Modal content remains same as your logic... */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 text-sm font-black text-gray-700 uppercase border-b border-gray-100 pb-2 flex items-center gap-3">
                  <FaUserAlt className="text-primary" /> <span>1. Identity Info</span>
                </div>
                <CInput label="Full Name" value={formData.fullName} onChange={(val) => setFormData({...formData, fullName: val})} />
                <CInput label="Phone" value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} />
                <CInput label="Age" type="number" value={formData.age} onChange={(val) => setFormData({...formData, age: val})} />
                <CInput label="Blood Group" value={formData.bloodGroup} onChange={(val) => setFormData({...formData, bloodGroup: val})} />
                <CInput label="City" value={formData.city} onChange={(val) => setFormData({...formData, city: val})} />
                <CInput label="State" value={formData.state} onChange={(val) => setFormData({...formData, state: val})} />

                <div className="md:col-span-2 text-sm font-black text-gray-700 uppercase border-b border-gray-100 pb-2 mt-4 flex items-center gap-3">
                  <FaBriefcase className="text-primary" /> <span>2. Professional / Student</span>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                   {['student', 'professional'].map(type => (
                     <button 
                       key={type} 
                       onClick={() => setFormData({...formData, occupationType: type})} 
                       className={`py-3 rounded-md font-black uppercase text-[10px] border-2 transition-all ${
                         formData.occupationType === type 
                         ? "border-primary bg-orange-50 text-primary" 
                         : "border-gray-100 text-gray-400"
                       }`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
                {/* ... Rest of inputs ... */}
                <CInput label="Qualification" value={formData.education} onChange={(val) => setFormData({...formData, education: val})} />
                {formData.occupationType === 'student' ? (
                  <>
                    <CInput label="College Name" value={formData.collegeName} onChange={(val) => setFormData({...formData, collegeName: val})} />
                    <CInput label="Year" value={formData.collegeYear} onChange={(val) => setFormData({...formData, collegeYear: val})} />
                    <CInput label="College Address" className="md:col-span-2" value={formData.collegeAddress} onChange={(val) => setFormData({...formData, collegeAddress: val})} />
                  </>
                ) : (
                  <>
                    <CInput label="Company Name" value={formData.companyName} onChange={(val) => setFormData({...formData, companyName: val})} />
                    <CInput label="Work Address" className="md:col-span-2" value={formData.companyAddress} onChange={(val) => setFormData({...formData, companyAddress: val})} />
                  </>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
              <CButton onClick={handleSaveInfo} className="flex-1">Save Changes</CButton>
              <CButton onClick={() => setIsModalOpen(false)} className="flex-1 bg-white !text-gray-400 border border-gray-200">Cancel</CButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="text-sm font-black text-gray-800 break-words leading-tight uppercase">{value || "NOT SET"}</p>
  </div>
);

export default Profile;