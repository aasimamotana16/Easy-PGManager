import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";

// Import the full listings pages (these should fetch data internally)
import PGListings from "../../../pages/findMypg/pgListing";
import HostelListings from "../../../pages/findMypg/hostelListing";

const ExplorePage = () => {
  const navigate = useNavigate();

  const handleBook = (id) => {
    navigate(`/book/${id}`); // Navigate to booking page with selected PG/Hostel ID
  };

  return (
    <div className="min-h-screen bg-dashboard-gradient p-6 space-y-8">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Explore PGs & Hostels
      </h1>

      {/* PGs Section */}
      <div>
        <h2 className="text-xl font-semibold text-primaryDark mb-4">
          Available PGs
        </h2>
        <PGListings onBook={handleBook} />
      </div>

      {/* Hostels Section */}
      <div>
        <h2 className="text-xl font-semibold text-primaryDark mb-4">
          Available Hostels
        </h2>
        <HostelListings onBook={handleBook} />
      </div>
    </div>
  );
};

export default ExplorePage;
