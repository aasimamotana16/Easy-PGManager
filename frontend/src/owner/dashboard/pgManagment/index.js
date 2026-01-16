import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import { FaHome, FaBed } from "react-icons/fa"; // icons for cards

const steps = [
  { id: 1, title: "Add Property" },
  { id: 2, title: "Add Rooms" },
  { id: 3, title: "Submit Approval" },
];

const PgManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-dashboard-gradient rounded-2xl min-h-screen">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-primary mb-2 text-center">
        PG Management
      </h2>
      <p className="text-dark mb-10 text-center">
        Manage your PG properties smoothly with the steps below.
      </p>

      {/* Steps - centered */}
      <div className="flex items-center justify-center mb-10 max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                  index === 0
                    ? "bg-primary text-dark shadow-md"
                    : "bg-white text-dark"
                }`}
              >
                {step.id}
              </div>
              <span className="mt-2 text-primary text-sm font-medium">
                {step.title}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`flex-1 h-1 mt-6 rounded-full transition-colors ${
                  index === 0 ? "bg-amber-500" : "bg-white"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Property Card */}
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
          {/* Icon */}
          <div className="text-primary mb-3">
            <FaHome size={40} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 text-center">
            Add New Property
          </h3>
          <p className="text-gray-700 mb-4 text-center">
            Enter your PG property details to get started.
          </p>
          <CButton
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-amber-600 transition"
            onClick={() =>
              navigate("/owner/dashboard/pgManagment/addProperty")
            }
          >
            Add Property
          </CButton>
        </div>

        {/* Manage Rooms Card */}
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
          {/* Icon */}
          <div className="text-primary mb-3">
            <FaBed size={40} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 text-center">
            Manage Rooms
          </h3>
          <p className="text-gray-700 mb-4 text-center">
            Add rooms, details, and upload photos to attract tenants.
            Review and submit your PG for approval when ready.
          </p>
          <CButton
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-amber-600 transition"
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
