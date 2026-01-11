import React from 'react';

const DashBoard = () => {
  // Stat cards data
  const stats = [
    { label: 'Total Owners', value: '12', icon: '🏠', color: 'bg-blue-50' },
    { label: 'Total Tenants', value: '45', icon: '👥', color: 'bg-green-50' },
    { label: 'Pending Payments', value: '₹12,500', icon: '💳', color: 'bg-red-50' },
    { label: 'Active Complaints', value: '3', icon: '⚠️', color: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-xl border border-slate-100 ${stat.color} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future Charts/Activity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 h-64 flex items-center justify-center">
        <p className="text-slate-400 italic">Activity chart coming soon (Connecting to Backend...)</p>
      </div>
    </div>
  );
};

export default DashBoard;