import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CButton from "../../../components/cButton";
import { FaHome, FaRegEye, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const PgManagement = () => {
  const navigate = useNavigate();
  const [myPgs, setMyPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch PGs from backend
  const fetchMyPgs = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get("http://localhost:5000/api/owner/my-pgs", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedPgs = response.data.data.map(pg => ({
          id: pg._id,
          name: pg.pgName,
          location: pg.location,
          status: pg.status.charAt(0).toUpperCase() + pg.status.slice(1),
          rooms: pg.totalRooms || 0,
          beds: pg.liveListings || 0,
          image: pg.mainImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        }));
        setMyPgs(transformedPgs);
      }
    } catch (error) {
      console.error("Error fetching PGs:", error);
      // Keep static data as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPgs();
  }, []);

  // Delete PG function
  const handleDeletePg = async (pgId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("userToken");
        await axios.delete(`http://localhost:5000/api/owner/pg/${pgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Remove from local state immediately
        setMyPgs(prevPgs => prevPgs.filter(pg => pg.id !== pgId));

        Swal.fire("Deleted!", "Your PG has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting PG:", error);
      Swal.fire("Error!", "Failed to delete PG.", "error");
    }
  };

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

                  <button
                    onClick={() => handleDeletePg(pg.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete PG"
                  >
                    <FaTrash size={26} />
                  </button>

                  <CButton
                    size="sm"
                    className="ml-auto md:text-lg "
                    onClick={() =>
                      navigate(
                        `/owner/dashboard/pgManagment/roomManagement/${pg.id}`
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
