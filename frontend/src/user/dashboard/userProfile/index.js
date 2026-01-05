import React, { useState } from "react";

// Mock user data
const userData = {
  profile: {
    name: "Asima Motana",
    role: "Student / Tenant",
    email: "asima@gmail.com",
    phone: "+91 98765 43210",
    city: "Ahmedabad",
    state: "Gujarat",
    profilePicture: null, // default null
    profileCompletion: 80,
  },
  payments: [
    {
      card: "**** **** **** 4589",
      expiry: "08/27",
      default: true,
    },
  ],
};

const UserProfile = () => {
  const [openSection, setOpenSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(userData.profile);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toggle subpages
  const toggleSection = (section) =>
    setOpenSection(openSection === section ? null : section);

  // Handle file selection for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ ...profile, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete profile picture with confirmation
  const handleDeletePicture = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProfile({ ...profile, profilePicture: null });
    setShowDeleteModal(false);
  };

  const cancelDelete = () => setShowDeleteModal(false);

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-lg">User</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.role}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDeletePicture}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition"
            >
              Delete
            </button>

            {/* Upload button */}
            <label className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm cursor-pointer hover:opacity-90 transition">
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* PROFILE COMPLETION */}
        <div className="mb-10 flex items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#F97316"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${
                  2 * Math.PI * 36 * (1 - profile.profileCompletion / 100)
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {profile.profileCompletion}%
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION SECTION */}
        <Section
          title="Personal Information"
          isOpen={openSection === "personal"}
          onClick={() => toggleSection("personal")}
        >
          {!isEditing ? (
            <>
              <Info label="Full Name" value={profile.name} />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="City" value={profile.city} />
              <Info label="State" value={profile.state} />

              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 px-6 py-2 rounded-lg bg-orange-500 text-white text-sm"
              >
                Edit Information
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" value={profile.name} />
                <Input label="Email Address" value={profile.email} />
                <Input label="Phone Number" value={profile.phone} />
                <Input label="City" value={profile.city} />
                <Input label="State" value={profile.state} />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-orange-500 text-white rounded-lg">
                  Save
                </button>
              </div>
            </>
          )}
        </Section>

        {/* PAYMENT METHODS SECTION */}
        <Section
          title="Payment Methods"
          isOpen={openSection === "payment"}
          onClick={() => toggleSection("payment")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.payments.map((p, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-5 relative flex flex-col gap-1"
              >
                <p className="text-gray-500 text-sm">Saved Card</p>
                <p className="font-medium">{p.card}</p>
                <p className="text-xs text-gray-400">Expires {p.expiry}</p>
                {p.default && (
                  <span className="absolute top-2 right-2 text-green-500 text-xs font-medium">
                    Default
                  </span>
                )}
              </div>
            ))}
            <div className="border-2 border-dashed rounded-xl p-5 flex items-center justify-center text-orange-500 font-medium cursor-pointer hover:bg-orange-50">
              + Add New Payment Method
            </div>
          </div>
        </Section>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
              <h3 className="text-lg font-semibold mb-4">
                Are you sure you want to delete your profile picture?
              </h3>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */
const Section = ({ title, isOpen, onClick, children }) => (
  <div className="border rounded-xl mb-6 overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center p-5 font-medium"
    >
      {title}
      <span className="text-xl">{isOpen ? "−" : "+"}</span>
    </button>
    {isOpen && <div className="px-5 pb-6 pt-2 border-t">{children}</div>}
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const Input = ({ label, value }) => (
  <div>
    <label className="block text-sm text-gray-500 mb-2">{label}</label>
    <input
      defaultValue={value}
      className="w-full px-4 py-3 rounded-xl bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
);

export default UserProfile;
