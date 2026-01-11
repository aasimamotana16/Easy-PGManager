import React from 'react';

const DataTable = ({ title, columns, data, onAddClick }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button 
          onClick={onAddClick}
          className="bg-[#5ba4a4] text-white px-4 py-2 rounded-lg hover:bg-[#4a8a8a] transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Add {title.slice(0, -1)}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100">
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                  {Object.values(item).map((val, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 text-sm text-slate-600">{val}</td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-[#5ba4a4] mr-3">Edit</button>
                    <button className="text-slate-400 hover:text-red-500">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-400">
                  No data available yet. (Connecting to backend soon...)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;