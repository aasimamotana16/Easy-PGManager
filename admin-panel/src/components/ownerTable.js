import React from 'react';

const OwnerTable = ({ owners, onDeleteOwner, onEditOwner }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr className="text-slate-400 text-xs uppercase font-semibold">
            <th className="px-6 py-4">Owner ID</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">Properties</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {owners.map((owner) => (
            <tr key={owner._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-700">{owner.ownerId}</td>
              <td className="px-6 py-4 text-slate-900">{owner.ownerName}</td>
              <td className="px-6 py-4 text-slate-500">{owner.ownerEmail}</td>
              <td className="px-6 py-4 text-slate-500">{owner.phoneNumber}</td>
              <td className="px-6 py-4 text-slate-500">{owner.propertyCount} Properties</td>
              <td className="px-6 py-4">
                <span className="bg-[#6eb195] text-white px-3 py-1 rounded text-[11px] font-bold">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 flex justify-center space-x-2">
                <button 
                  onClick={() => onEditOwner(owner)}
                  className="bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-600"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDeleteOwner(owner._id)}
                  className="bg-[#e53e3e] text-white px-3 py-1 rounded text-xs flex items-center space-x-1 hover:bg-red-700"
                >
                  <span>🗑️</span> <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerTable;