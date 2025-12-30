import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";

const RoomManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto my-6 px-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-amber-600">Room Management</h2>
        <CButton onClick={() => navigate("/owner/dashboard/pgManagment/addRooms")}>
          + Add New Room
        </CButton>
      </div>

      <CFormCard className="border border-gray-400 text-center py-10">
        <p className="text-gray-600 text-lg">No rooms added yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Add rooms to complete your property setup
        </p>
        <div className="mt-6">
          <CButton onClick={() => navigate("/owner/dashboard/pgManagment/addRooms")}>
            Add First Room
          </CButton>
        </div>
      </CFormCard>
    </div>
  );
};

export default RoomManagement;
