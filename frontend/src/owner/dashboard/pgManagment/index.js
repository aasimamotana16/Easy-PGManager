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
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          PG Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your PG properties, rooms, and approvals
        </p>
      </div>

      {/* ADD NEW PROPERTY – IMPROVED */}
      <div className="bg-white p-8 rounded-md shadow flex flex-col items-center text-center max-w-4xl mx-auto">
        <FaHome size={42} className="text-orange-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Add New Property
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Add a new PG to start managing rooms, tenants, and bookings.
        </p>
        <CButton
          variant="contained"
          size="lg"
          onClick={() =>
            navigate("/owner/dashboard/pgManagment/addProperty")
          }
        >
          Add Property
        </CButton>
      </div>

      {/* MY UPLOADED PGs */}
      <div className="bg-white p-6 rounded-md shadow">
        <h3 className="text-xl font-semibold">
          My Uploaded PGs
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          View and manage all your PG properties
        </p>

        {/* WIDER CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {myPgs.map((pg) => (
            <div
              key={pg.id}
              className="border rounded-xl bg-white overflow-hidden flex flex-col"
            >
              <img
                src={pg.image}
                alt={pg.name}
                className="h-45 w-full object-cover"
              />

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">
                    {pg.name}
                  </h4>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
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

                <p className="text-sm text-gray-500">
                  {pg.location}
                </p>

                <p className="text-sm text-gray-600 mt-2 mb-5">
                  Total Rooms: {pg.rooms} | Total Beds: {pg.beds}
                </p>

                {/* ACTION BUTTONS */}
                <div className="mt-auto flex gap-3">
                  <CButton
                    variant="outlined"
                    size="sm"
                    className="flex-1 h-9 flex items-center justify-center"
                    onClick={() =>
                      navigate(`/owner/dashboard/pg/${pg.id}`)
                    }
                  >
                    <FaRegEye size={16} />
                  </CButton>

                  <CButton
                    variant="outlined"
                    size="sm"
                    className="flex-1 h-9 flex items-center justify-center"
                  >
                    <FaEdit size={16} />
                  </CButton>

                  <CButton
                    variant="contained"
                    size="sm"
                    className="flex-1 h-9 whitespace-nowrap"
                    onClick={() =>
                      navigate(
                        `/owner/dashboard/pgManagment/roomManagement`
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
