import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import { FaHome, FaRegEye, FaEdit } from "react-icons/fa";

const myPgs = [
  {
    id: 1,
    name: "Green View PG",
    location: "Koramangala, Bangalore",
    status: "Draft",
    rooms: 10,
    beds: 20,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: 2,
    name: "Royal Stay PG",
    location: "Indiranagar, Bangalore",
    status: "Pending",
    rooms: 8,
    beds: 16,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  },
  {
    id: 3,
    name: "City Living PG",
    location: "Whitefield, Bangalore",
    status: "Approved",
    rooms: 12,
    beds: 24,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
  },
];

const PgManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-100 min-h-screen space-y-8">

      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-2xl font-bold text-primary">
          PG Management
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-500">
          Manage your PG properties, rooms, and approvals
        </p>
      </div>

      {/* ADD NEW PROPERTY */}
      <div className="bg-white p-6 sm:p-8 rounded-md shadow flex flex-col items-center text-center max-w-4xl mx-auto">
        <FaHome size={42} className="text-orange-500 mb-4" />
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">
          Add New Property
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md">
          Add a new PG to start managing rooms, tenants, and bookings.
        </p>
        <CButton
          size="lg"
          onClick={() =>
            navigate("/owner/dashboard/pgManagment/addProperty")
          }
        >
          Add Property
        </CButton>
      </div>

      {/* MY UPLOADED PGs */}
      <div className="bg-white p-4 sm:p-6 rounded-md shadow">
        <h3 className="text-base sm:text-lg md:text-2xl font-semibold">
          My Uploaded PGs
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-6">
          View and manage all your PG properties
        </p>

        {/* 
          MOBILE + MD: 1 column (vertical scroll)
          LG+: 2 column grid
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myPgs.map((pg) => (
            <div
              key={pg.id}
              className="border rounded-xl bg-white overflow-hidden flex flex-col"
            >
              <img
                src={pg.image}
                alt={pg.name}
                className="h-48 sm:h-56 w-full object-cover"
              />

              <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm sm:text-base md:text-2xl lg:text-lg font-semibold">
                    {pg.name}
                  </h4>
                  <span
                    className={`text-xs md:text-lg lg:text-sm px-3 py-1 rounded-md font-medium ${
                      pg.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : pg.status === "Pending"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-200 text-purple-700"
                    }`}
                  >
                    {pg.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm md:text-lg text-gray-500">
                  {pg.location}
                </p>

                <p className="text-xs sm:text-sm  md:text-lg text-gray-600">
                  Total Rooms: {pg.rooms} | Total Beds: {pg.beds}
                </p>

                {/* ACTION BUTTONS */}
                <div className="mt-auto flex items-center gap-3 pt-4">
                  <button
                    onClick={() =>
                      navigate(`/owner/dashboard/pg/${pg.id}`)
                    }
                    className="text-gray-600 hover:text-primary"
                    title="View PG"
                  >
                    <FaRegEye size={26} />
                  </button>

                  <button
                    className="text-gray-600 hover:text-primary"
                    title="Edit PG"
                  >
                    <FaEdit size={26} />
                  </button>

                  <CButton
                    size="sm"
                    className="ml-auto md:text-lg "
                    onClick={() =>
                      navigate(
                        "/owner/dashboard/pgManagment/roomManagement"
                      )
                    }
                  >
                    Manage Rooms
                  </CButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PgManagement;
