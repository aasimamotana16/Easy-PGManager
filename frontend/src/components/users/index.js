import React, { useEffect, useState } from "react";
import { getUserProfile } from "../../pages/services/api"; // Ensure this calls /api/users/me [cite: 2026-01-06]

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserProfile();
      // Ensure we target res.data.data based on your backend structure [cite: 2026-01-06]
      setUser(res.data.data); 
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    /* This is where you insert your Dashboard UI code */
    <div className="max-w-4xl mx-auto p-4">
      {/* 1. Header Section */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl font-bold text-amber-600">
          {user?.fullName?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">{user?.fullName}</h2>
          <p className="text-gray-500">{user?.role} / {user?.email}</p>
        </div>
      </div>

      {/* 2. Personal Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm mb-6">
         <div>
           <label className="text-xs text-gray-400">Full Name</label>
           <p className="font-medium">{user?.fullName}</p>
         </div>
         <div>
           <label className="text-xs text-gray-400">City</label>
           <p className="font-medium">{user?.city || "Not set"}</p>
         </div>
      </div>

      {/* 3. Emergency Contact Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400">Contact Name</label>
            <p className="font-medium">{user?.emergencyContact?.contactName || "None"}</p>
          </div>
          {/* ... Add Relationship and Phone Number here */}
        </div>
      </div>
    </div>
  );
}