import React, { useState } from "react";
import CButton from "../../../../components/cButton";
import { 
  FaEdit, FaCog, FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter 
} from "react-icons/fa";

const ProfileCard = ({ profileData, setProfileData }) => {
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(profileData);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
  };

  const handleSave = () => {
    setProfileData(tempData);
    setEditMode(false);
    setSettingsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center gap-6 relative">
      <img 
        src={profileData.profileImage} 
        alt="Profile" 
        className="w-32 h-32 rounded-full object-cover" 
      />

      <div className="flex-1 w-full">
        <div className="flex justify-between items-center mb-2">
          {editMode ? (
            <input
              name="name"
              value={tempData.name}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
            />
          ) : (
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
          )}
          <FaCog 
            className="text-gray-500 text-xl cursor-pointer" 
            onClick={() => setSettingsOpen(true)} 
          />
        </div>

        <p className="text-gray-500 mb-2">{profileData.role}</p>
        <p className="text-gray-400 text-sm mb-2">Joined: {profileData.registrationDate}</p>

        <div className="space-y-1 text-gray-600 text-sm mb-4">
          {editMode ? (
            <>
              <input name="email" value={tempData.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
              <input name="phone" value={tempData.phone} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
              <input name="address" value={tempData.address} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </>
          ) : (
            <>
              <p>📧 {profileData.email}</p>
              <p>📞 {profileData.phone}</p>
              <p>🏢 {profileData.pgName}</p>
              <p>📍 {profileData.address}</p>
              <p>🆔 Member ID: {profileData.memberId}</p>
            </>
          )}
        </div>

        {!editMode && (
          <div className="flex gap-3 mb-4 text-primary">
            <a href={profileData.socialLinks.facebook}><FaFacebookF /></a>
            <a href={profileData.socialLinks.instagram}><FaInstagram /></a>
            <a href={profileData.socialLinks.linkedin}><FaLinkedinIn /></a>
            <a href={profileData.socialLinks.twitter}><FaTwitter /></a>
          </div>
        )}

        {editMode ? (
          <CButton onClick={handleSave}>Save Profile</CButton>
        ) : (
          <CButton icon={<FaEdit />} onClick={() => setEditMode(true)}>Edit Profile</CButton>
        )}

        {/* ===== Settings Modal ===== */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50">
            <div className="bg-white rounded-lg w-[90%] max-w-xl shadow-lg p-6 relative">
              <button 
                className="absolute top-4 right-4 text-gray-500 text-xl"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
              
              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b">
                <button 
                  className={`pb-2 ${activeTab === "profile" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button 
                  className={`pb-2 ${activeTab === "notifications" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  Notifications
                </button>
                <button 
                  className={`pb-2 ${activeTab === "billing" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
                  onClick={() => setActiveTab("billing")}
                >
                  Billing
                </button>
                <button 
                  className={`pb-2 ${activeTab === "security" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
                  onClick={() => setActiveTab("security")}
                >
                  Security
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === "profile" && (
                  <div>
                    <p className="font-bold mb-2">Update Profile Info</p>
                    <input name="name" value={tempData.name} onChange={handleChange} className="border rounded px-2 py-1 w-full mb-2" />
                    <input name="email" value={tempData.email} onChange={handleChange} className="border rounded px-2 py-1 w-full mb-2" />
                    <input name="phone" value={tempData.phone} onChange={handleChange} className="border rounded px-2 py-1 w-full mb-2" />
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <p className="font-bold mb-2">Notification Settings</p>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked /> Bookings Updates
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked /> Complaints Alerts
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" /> PG Updates
                    </label>
                  </div>
                )}

                {activeTab === "billing" && (
                  <div>
                    <p className="font-bold mb-2">Subscription Info</p>
                    <p>Plan: Premium</p>
                    <p>Next Billing: 31 Dec 2025</p>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <p className="font-bold mb-2">Security Settings</p>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" /> Enable Two-Factor Authentication
                    </label>
                    <button className="mt-2 text-red-600">Delete Account</button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <CButton onClick={handleSave}>Save Changes</CButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileCard;
