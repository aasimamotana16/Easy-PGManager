import React, { useEffect, useState } from "react"; // Added useEffect and useState
import CButton from "../../../components/cButton";
import { getUserProfile } from "../../../api/api"; // Adjust path to your api.js

const Profile = () => {
  // 1. Declare the user state (Fixes the 'user' is not defined error)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the data from your backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.data.success) {
          setUser(res.data.data); // Stores the user object in state
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="space-y-8">
      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-8">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* PROFILE CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-full bg-primarySoft flex items-center justify-center text-2xl font-semibold text-primary">
                {/* Dynamically show first letter [cite: 2026-01-01] */}
                {user?.fullName?.charAt(0) || "U"}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-primary">
                  Welcome back, {user?.fullName || "Guest"}
                </h2>
                <p className="text-sm text-gray-500">{user?.role || "Tenant"}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                {/* Ensure your schema uses phone (camelCase) [cite: 2026-01-01] */}
                <p className="text-sm text-gray-400">{user?.phone || "No Phone"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <CButton className="bg-primary px-4 py-2 text-sm">
                Upload Picture
              </CButton>
              <CButton className="border px-4 py-2 text-sm">
                Remove Picture
              </CButton>
            </div>
          </div>

          {/* PROFILE COMPLETION */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold mb-4">Profile Completion</h3>
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-[8px] border-gray-200" />
              <div className="absolute inset-0 rounded-full border-[8px] border-primary border-t-transparent rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {user?.profileCompletion || 0}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Complete your profile to unlock all features
            </p>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <CButton className="bg-primary px-4 py-2 text-sm">Edit Info</CButton>
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

        {/* EMERGENCY CONTACT */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            <CButton className="bg-primary px-4 py-2 text-sm">Edit Info</CButton>
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