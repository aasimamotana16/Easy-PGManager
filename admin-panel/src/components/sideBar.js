import React from 'react';

const SideBar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'propertyOwners', label: 'Owners', icon: '👤' },
    { id: 'tenants', label: 'Tenants', icon: '🏠' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[#5ba4a4]">EasyPG Manager</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            // IMPORTANT: use arrow function to prevent infinite loops
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id 
                ? 'bg-[#5ba4a4] text-white shadow-lg shadow-teal-100' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;