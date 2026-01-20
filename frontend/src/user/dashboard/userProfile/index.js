import React, { useEffect, useState, useRef } from "react"; 
import CButton from "../../../components/cButton";
import { 
  getUserProfile, 
  updateProfilePicture, 
  removeProfilePicture, 
  updateUserProfile // Added for Edit Info logic [cite: 2026-01-06]
} from "../../../api/api"; 

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATES FOR EDIT LOGIC ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the popup [cite: 2026-01-07]
  const [formData, setFormData] = useState({}); // Stores changes temporarily
  
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

  // --- BUTTON LOGIC START ---

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    try {
      setLoading(true);
      const res = await updateProfilePicture(formDataObj);
      if (res.data.success) {
        await fetchProfile();
      }
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        const res = await removeProfilePicture();
        if (res.data.success) {
          await fetchProfile();
        }
      } catch (err) {
        console.error("Remove failed", err);
      }
    }
  };

  // --- EDIT INFO LOGIC ---
  const openEditModal = () => {
    // Fill form with current user data [cite: 2026-01-07]
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      city: user?.city || "",
      state: user?.state || "",
      emergencyContact: {
        contactName: user?.emergencyContact?.contactName || "",
        relationship: user?.emergencyContact?.relationship || "",
        phoneNumber: user?.emergencyContact?.phoneNumber || ""
      }
    });
    setIsModalOpen(true);
  };

  const handleSaveInfo = async () => {
    try {
      setLoading(true);
      const res = await updateUserProfile(formData); // Sends to your new API [cite: 2026-01-06]
      if (res.data.success) {
        await fetchProfile(); // Refresh completion % and data [cite: 2026-01-07]
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON LOGIC END ---

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="space-y-8 relative"> {/* Added relative for modal positioning */}
      
      {/* 1. HIDDEN FILE INPUT */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* 2. EDIT MODAL (POPUP) - Does not affect main UI layout [cite: 2026-01-07] */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-primary">Edit Profile Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <input className="border p-2 rounded" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                <input className="border p-2 rounded" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
              </div>
              <p className="text-xs font-bold text-gray-400 mt-2">Emergency Contact</p>
              <input className="border p-2 rounded" placeholder="Name" value={formData.emergencyContact.contactName} onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, contactName: e.target.value}})} />
              <input className="border p-2 rounded" placeholder="Phone" value={formData.emergencyContact.phoneNumber} onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phoneNumber: e.target.value}})} />
            </div>
            <div className="flex gap-2 pt-2">
              <CButton onClick={handleSaveInfo} className="bg-primary flex-1 text-white py-2 rounded-lg">Save Changes</CButton>
              <CButton onClick={() => setIsModalOpen(false)} className="border flex-1 py-2 rounded-lg">Cancel</CButton>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN UI (UNCHANGED STRUCTURE) --- */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primarySoft flex items-center justify-center text-2xl font-semibold text-primary">
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">Welcome back, {user?.fullName || "Guest"}</h2>
                <p className="text-sm text-gray-500">{user?.role || "Tenant"}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-400">{user?.phone || "No Phone"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <CButton onClick={handleUploadClick} className="bg-primary px-4 py-2 text-sm">Upload Picture</CButton>
              <CButton onClick={handleRemove} className="border px-4 py-2 text-sm">Remove Picture</CButton>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold mb-4">Profile Completion</h3>
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-[8px] border-gray-200" />
              <div className="absolute inset-0 rounded-full border-[8px] border-primary border-t-transparent rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">{user?.profileCompletion || 0}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">Complete your profile to unlock all features</p>
          </div>
        </div>

        {/* PERSONAL INFORMATION SECTION */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <CButton onClick={openEditModal} className="bg-primary px-4 py-2 text-sm">Edit Info</CButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Info label="Full Name" value={user?.fullName} />
            <Info label="Email" value={user?.email} />
            <Info label="Phone" value={user?.phone || "Not Set"} />
            <Info label="City" value={user?.city || "Not Set"} />
            <Info label="State" value={user?.state || "Not Set"} />
            <Info label="Role" value={user?.role} />
          </div>
        </div>

        {/* EMERGENCY CONTACT SECTION */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            <CButton onClick={openEditModal} className="bg-primary px-4 py-2 text-sm">Edit Info</CButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Info label="Contact Name" value={user?.emergencyContact?.contactName || "Not Set"} />
            <Info label="Relationship" value={user?.emergencyContact?.relationship || "Not Set"} />
            <Info label="Phone Number" value={user?.emergencyContact?.phoneNumber || "Not Set"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-sm font-medium">{value || "---"}</p>
  </div>
);

export default Profile;