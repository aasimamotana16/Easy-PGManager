import React from "react";

const ExtraInfoCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="text-gray-700 space-y-1">{children}</div>
    </div>
  );
};

export default ExtraInfoCard;
