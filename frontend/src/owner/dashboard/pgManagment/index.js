import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import { FaHome, FaBed } from "react-icons/fa";

const steps = [
  { id: 1, title: "Add Property" },
  { id: 2, title: "Add Rooms" },
  { id: 3, title: "Submit Approval" },
];

const PgManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">

      {/* HEADER (Same style as Dashboard / Earnings / Support) */}
      <div className="bg-white p-6 rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold text-primary">
          PG Management
        </h2>
        <p className="text-gray-500 mt-1">
          Manage your PG properties smoothly with the steps below
        </p>
      </div>

      {/* STEPS INDICATOR */}
      <div className="bg-white p-6 rounded-2xl shadow max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index === 0
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.id}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {step.title}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ADD PROPERTY */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <div className="text-orange-500 mb-4">
            <FaHome size={36} />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Add New Property
          </h3>

          <p className="text-gray-500 mb-4">
            Enter your PG property details to get started.
          </p>

          <CButton
            className="bg-primary text-white px-6 py-2 rounded-md"
            onClick={() =>
              navigate("/owner/dashboard/pgManagment/addProperty")
            }
          >
            Add Property
          </CButton>
        </div>

        {/* MANAGE ROOMS */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <div className="text-orange-500 mb-4">
            <FaBed size={36} />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Manage Rooms
          </h3>

          <p className="text-gray-500 mb-4">
            Add rooms, upload photos, and submit your PG for approval.
          </p>

          <CButton
            className="bg-primary text-white px-6 py-2 rounded-md"
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
