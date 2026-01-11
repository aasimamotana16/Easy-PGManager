import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SideBar from './sideBar';
import AdminNavbar from './adminNavbar';
import DashBoard from '../pages/DashBoard';

const sectionSchema = {
  propertyOwners: {
    title: 'Property Owners',
    fields: [
      { name: 'name', label: 'Owner Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phoneNumber', label: 'Phone', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] }
    ]
  },
  tenants: {
    title: 'Active Tenants',
    fields: [
      { name: 'name', label: 'Tenant', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phoneNumber', label: 'Phone', type: 'text' },
      { name: 'roomNumber', label: 'Room No', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'PENDING'] }
    ]
  },
  bookings: {
    title: 'Bookings',
    fields: [
      { name: 'name', label: 'Customer', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phoneNumber', label: 'Phone', type: 'text' },
      { name: 'date', label: 'Check-In', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['CONFIRMED', 'PENDING'] }
    ]
  },
  payments: { // FIXED: Populated this section
    title: 'Payment History',
    fields: [
      { name: 'name', label: 'Payer', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'text' },
      { name: 'method', label: 'Method', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['PAID', 'PENDING'] }
    ]
  }
};

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const fileInputRef = useRef(null);

  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Super Admin',
    email: 'admin@easypg.com',
    phone: '+91 98765 43210',
    role: 'OWNER',
    profilePic: null, //
    lastUpdated: '1/11/2026' //
  });

  // --- Handlers (Defined to fix image_083d07.png & image_08a664.png) ---
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm(`Delete entry ${id}?`)) console.log("Deleted");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAdminProfile(prev => ({ ...prev, profilePic: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- Profile Settings View ---
  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Profile Settings</h2>
        <p className="text-slate-400 font-medium">Manage credentials and profile image.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current.click()}
            className="w-32 h-32 bg-slate-100 rounded-full mb-6 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-xl hover:scale-105 transition-all"
          >
            {adminProfile.profilePic ? (
              <img src={adminProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
          <h3 className="text-2xl font-black text-slate-800">{adminProfile.fullName}</h3>
          <p className="text-slate-400 font-bold text-[10px] mb-4 uppercase tracking-tighter">{adminProfile.email}</p>
          <span className="px-5 py-1 bg-[#5ba4a4] text-white text-[10px] font-black rounded-full uppercase tracking-widest">{adminProfile.role}</span>
        </div>

        <form className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50 grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
            <input type="text" defaultValue={adminProfile.fullName} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#5ba4a4]" />
          </div>
          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
            <input type="text" defaultValue={adminProfile.phone} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#5ba4a4]" />
          </div>
          <button type="button" className="col-span-2 mt-4 bg-[#5ba4a4] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Update Profile</button>
        </form>
      </div>
    </motion.div>
  );

  // ... imports at the top (framer-motion, SideBar, etc.)

const AdminLayout = () => {
  // 1. All your state variables go here
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Super Admin',
    email: 'admin@easypg.com',
    role: 'OWNER',
    // ... other profile data
  });

  // 2. All your helper functions (renderSettings, renderTable) go here
  const renderSettings = () => { /* ... */ };
  const renderTable = () => { /* ... */ };

  // 3. THIS IS THE RETURN BLOCK YOU ADDED:
  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      {/* Pass setActiveTab to SideBar to fix navigation crash */}
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Navbar handles the settings dropdown and profile navigation */}
        <AdminNavbar user={adminProfile} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashBoard key="dashboard" />}
            {/* This ensures your profile view shows up when 'Settings' is clicked */}
            {activeTab === 'settings' && renderSettings()} 
            {/* This renders Owners, Tenants, or Payments based on the sidebar */}
            {sectionSchema[activeTab] && renderTable()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};


  // --- Table View ---
 const renderTable = () => {
  const config = sectionSchema[activeTab];
  if (!config) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{config.title}</h2>
          <p className="text-slate-400 font-medium">Management for {activeTab}.</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-[#5ba4a4] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-transform">
          + Add New
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              {/* Maps headers exactly from schema */}
              {config.fields.map((f) => (
                <th key={f.name} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {f.label}
                </th>
              ))}
              <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="hover:bg-slate-50/50 transition-colors">
              {/* 1. Dynamic Data Cells: Must match the number of headers */}
              {config.fields.map((field) => (
                <td key={field.name} className="px-8 py-6">
                  {field.name === 'status' ? (
                    <span className="px-3 py-1 bg-teal-50 text-[#5ba4a4] text-[10px] font-black rounded-full uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-600">
                      {/* logic to display sample data based on field name */}
                      {field.name === 'amount' || field.name === 'phone' ? '₹14,500' : 'Sample Data'}
                    </span>
                  )}
                </td>
              ))}

              {/* 2. Actions Cell: Aligned to the right */}
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => openModal('edit')} 
                    className="text-[10px] font-black text-slate-300 hover:text-[#5ba4a4] uppercase transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(102)} 
                    className="text-[10px] font-black text-slate-300 hover:text-red-400 uppercase transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      {/* FIXED: Passing setActiveTab to handle navigation */}
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} user={adminProfile} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* AdminNavbar now receives the full adminProfile object */}
        <AdminNavbar user={adminProfile} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashBoard key="db" />}
            {activeTab === 'settings' && renderSettings()}
            {sectionSchema[activeTab] && renderTable()}
          </AnimatePresence>
        </main>
      </div>

      {/* CRUD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10">
              <h3 className="text-2xl font-black text-slate-800 mb-8">{modalType === 'add' ? '✨ Add' : '📝 Edit'} {activeTab}</h3>
              <form className="grid grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                {sectionSchema[activeTab]?.fields.map((field) => (
                  <div key={field.name} className="col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{field.label}</label>
                    <input type={field.type} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" required />
                  </div>
                ))}
                <div className="col-span-2 flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-bold">Cancel</button>
                  <button type="submit" className="bg-[#5ba4a4] text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-transform">Save Details</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;