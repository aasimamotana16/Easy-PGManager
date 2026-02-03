import React from "react";

const StatsCard = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Adding '?' here stops the 'undefined' error immediately */}
      {stats?.map((item, i) => (
        <div key={i} className="bg-blue-50 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-blue-700">{item.label}</h4>
          <p className="text-xl font-bold text-blue-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;