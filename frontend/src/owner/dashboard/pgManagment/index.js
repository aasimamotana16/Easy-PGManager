import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";

const steps = [
  { id: 1, title: "Add Property" },
  { id: 2, title: "Add Rooms" },
  { id: 3, title: "Submit Approval" },
];

const PgManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-1">PG Management</h2>
      <p className="text-gray-600 mb-10">
        Manage your PG properties smoothly with the steps below.
      </p>

      {/* Steps */}
      <div className="flex items-center mb-10">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  index === 0 ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                {step.id}
              </div>
              <span className="mt-2 text-gray-700 text-sm">{step.title}</span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`flex-1 h-1 mt-5 ${
                  index === 0 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Property Card */}
        <div className="border rounded-lg p-6 flex flex-col items-center shadow-sm">
          <h3 className="text-lg font-medium mb-2">Add New Property</h3>
          <p className="text-gray-600 mb-4 text-center">
            Enter your PG property details to get started.
          </p>
          <CButton
            className="bg-amber text-white px-4 py-2 rounded-md hover:bg-amber hover:text-white transition"
            onClick={() =>
              navigate("/owner/dashboard/pgManagment/addProperty")
            }
          >
            Add New Property
          </CButton>
        </div>

        {/* Manage Rooms Card */}
        <div className="border rounded-lg p-6 flex flex-col items-center shadow-sm">
          <h3 className="text-lg font-medium mb-2">Manage Rooms</h3>
          <p className="text-gray-600 mb-4 text-center">
            Add rooms, details, and upload photos to attract tenants.
          </p>
          <CButton
            className="bg-amber text-white px-4 py-2 rounded-md hover:bg-amber hover:text-white transition"
            onClick={() =>
              navigate("/owner/dashboard/pgManagment/roomManagement")
            }
          >
            Manage Rooms
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default PgManagement;
