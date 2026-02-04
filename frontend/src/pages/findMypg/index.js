import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // 1. Import your Loader

import Filters from "./servicesFilter";
import PGListings from "./pgListing";

const DEFAULT_FILTERS = {
  lookingFor: "Any",
  occupancy: "Any",
  minPrice: "",
  maxPrice: "",
  rentCycle: "Any",
  amenities: [],
  sortBy: "",
};

export default function FindMyPG() {
  const locationObj = useLocation();
  const city = new URLSearchParams(locationObj.search).get("city");

  const [pgList, setPgList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 2. Initial state true

  /* ================= FETCH PGs (Initial) ================= */
  useEffect(() => {
    setIsLoading(true); // Start loading
    fetch("http://localhost:5000/api/pg/all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPgList(json.data);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => {
        // Adding a slight delay for smooth UX like your other pages
        setTimeout(() => setIsLoading(false), 600);
      });
  }, []);

  /* ================= FILTER STATES ================= */
  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* ================= FILTER HANDLERS ================= */
  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      resetFilters();
      return;
    }
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setTempFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const resetFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  /* ================= APPLY FILTERS (BACKEND CONNECTED) ================= */
  const applyFiltersClick = async () => {
    setIsLoading(true); // 3. Start loader when user applies filters
    try {
      const queryParams = new URLSearchParams({
        city: city || "Any",
        lookingFor: tempFilters.lookingFor,
        occupancy: tempFilters.occupancy,
        minPrice: tempFilters.minPrice,
        maxPrice: tempFilters.maxPrice,
        rentCycle: tempFilters.rentCycle,
        amenities: tempFilters.amenities.join(","),
      }).toString();

      const response = await fetch(`http://localhost:5000/api/pg/search?${queryParams}`);
      const json = await response.json();

      if (json.success) {
        setPgList(json.data);
        setFilters(tempFilters);
      }
    } catch (err) {
      console.error("Filter request failed:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 600); // Stop loader
    }
  };

  /* ================= SORT + FILTER LOGIC ================= */
  const filteredPGs = useMemo(() => {
    let list = [...pgList];

    if (filters.sortBy === "priceAsc") {
      list = [...list].sort((a, b) => Number(a.rent) - Number(b.rent));
    }

    if (filters.sortBy === "priceDesc") {
      list = [...list].sort((a, b) => Number(b.rent) - Number(a.rent));
    }

    return list;
  }, [filters.sortBy, pgList]);

  /* ================= RENDER ================= */

  // 4. Return Loader if isLoading is true
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          {city ? `PGs in ${city}` : "Find My Perfect PG"}
        </h1>

        <Filters
          filters={tempFilters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
          applyFilters={applyFiltersClick}
        />

        {/* Listings Section */}
        <div className="mt-10">
            <PGListings list={filteredPGs} />

            {filteredPGs.length === 0 && (
            <div className="text-center py-20">
                <p className="text-xl text-gray-500">
                    No PGs found matching your requirements.
                </p>
                <button 
                    onClick={resetFilters}
                    className="mt-4 text-orange-600 font-semibold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}