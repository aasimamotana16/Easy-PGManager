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
    <div className="p-3 sm:p-4 md:p-6 bg-gray-100 min-h-screen space-y-6 md:space-y-8">

      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
          PG Management
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-500">
          Manage your PG properties, rooms, and approvals
        </p>
      </div>

      {/* ADD NEW PROPERTY */}
      <div className="bg-white p-5 sm:p-8 rounded-md shadow border border-t-4 border-primary flex flex-col items-center text-center max-w-4xl mx-auto">
        <FaHome size={42} className="text-orange-500 mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          Add New Property
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-6 max-w-md">
          Add a new PG to start managing rooms, tenants, and bookings.
        </p>
        <CButton
          className="w-full sm:w-auto px-10"
          size="lg"
          onClick={() =>
            navigate("/owner/dashboard/pgManagment/addProperty")
          }
        >
          Add Property
        </CButton>
      </div>

      {/* MY UPLOADED PGs */}
      <div className="bg-white p-4 sm:p-6 border border-t-4 border-primary rounded-md shadow">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            My Uploaded PGs
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">
            View and manage all your PG properties
          </p>
        </div>

        {/* MOBILE: 1 column
          LG+: 2 column grid
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {myPgs.map((pg) => (
            <div
              key={pg.id}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="aspect-video w-full overflow-hidden">
                 <img
                    src={pg.image}
                    alt={pg.name}
                    className="h-full w-full object-cover"
                  />
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 line-clamp-1">
                    {pg.name}
                  </h4>
                  <span
                    className={`whitespace-nowrap text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-bold ${
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

                <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 italic">
                  {pg.location}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-medium text-gray-600">
                  <span>Rooms: <b className="text-gray-900">{pg.rooms}</b></span>
                  <span className="text-gray-300">|</span>
                  <span>Beds: <b className="text-gray-900">{pg.beds}</b></span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        navigate(`/owner/dashboard/pg/${pg.id}`)
                      }
                      className="text-blue-500 hover:text-blue-800 transition-colors"
                      title="View PG"
                    >
                      <FaRegEye className="text-xl sm:text-2xl" />
                    </button>

                    <button
                      className="text-gray-500 hover:text-primary transition-colors"
                      title="Edit PG"
                    >
                      <FaEdit className="text-xl sm:text-2xl" />
                    </button>

                    <button
                      onClick={() => handleDeletePg(pg.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete PG"
                    >
                      <FaTrash className="text-lg sm:text-xl" />
                    </button>
                  </div>

                  <CButton
                    size="sm"
                    className="ml-auto text-xs sm:text-sm px-4"
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
        
        {myPgs.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-400">No properties found. Add your first PG above!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PgManagement;