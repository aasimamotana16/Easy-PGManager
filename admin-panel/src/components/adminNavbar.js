import React, { useState } from 'react';

const AdminNavbar = ({ user, setActiveTab }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="h-20 bg-white border-b border-slate-50 px-10 flex items-center justify-end gap-6 relative">
      <div className="text-right">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{user.fullName}</h4>
        <p className="text-[9px] font-bold text-[#5ba4a4] uppercase tracking-tighter">{user.role}</p>
        <p className="text-[9px] text-slate-400 font-medium">{user.email}</p>
      </div>
      
      {/* Settings & Profile Trigger */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`p-2 rounded-xl transition-all ${isDropdownOpen ? 'bg-slate-100 text-[#5ba4a4]' : 'text-slate-300 hover:text-[#5ba4a4]'}`}
        >
          <span className="text-xl">⚙️</span>
        </button>

        {/* Professional Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-50 py-4 z-20 overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-50 mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Details</p>
              </div>
              <button 
                onClick={() => handleNavigation('settings')}
                className="w-full text-left px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#5ba4a4] transition-colors flex items-center gap-3"
              >
                <span>👤</span> Profile Settings
              </button>
              <button 
                className="w-full text-left px-6 py-3 text-sm font-bold text-red-400 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Avatar Display */}
      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {user.profilePic ? (
          <img src={user.profilePic} alt="Admin" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#5ba4a4]">SA</div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;