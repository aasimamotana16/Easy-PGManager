// src/pages/findMypg/index.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import Filters from "./servicesFilter";
import PGListings from "./pgListing";

const DEFAULT_FILTERS = {
  forCategory: "Any",
  occupancy: "Any",
  minBudget: "",
  maxBudget: "",
  rentCycle: "Any",
  amenities: [],
  sortBy: "",
};

export default function FindMyPG() {
  const locationObj = useLocation();
  const city = new URLSearchParams(locationObj.search).get("city");

  const [pgList, setPgList] = useState([]);

  /* ================= FETCH PGs ================= */

  useEffect(() => {
    fetch("http://localhost:5000/api/pg/all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPgList(json.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  /* ================= FILTER STATES ================= */

  // What user is editing
  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);

  // What is actually applied
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

  /* ================= APPLY FILTERS (BUTTON) ================= */

 /* ================= APPLY FILTERS (BACKEND CONNECTED) ================= */

const applyFiltersClick = async () => {
  try {
    const queryParams = new URLSearchParams({
      city: city || "Any",
      lookingFor: tempFilters.lookingFor,
      occupancy: tempFilters.occupancy,
      minBudget: tempFilters.minPrice,
      maxBudget: tempFilters.maxPrice,
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
  }
};

  /* ================= FILTER LOGIC ================= */

  const applyFilters = useCallback(
    (list) => {
      if (!Array.isArray(list)) return [];

      return list.filter((item) => {
        if (
          city &&
          item.location &&
          item.location.toLowerCase() !== city.toLowerCase()
        )
          return false;

        if (filters.lookingFor !== "Any" && item.gender !== filters.lookingFor)
          return false;

        if (filters.occupancy !== "Any" && item.occupancy !== filters.occupancy)
          return false;

        if (filters.rentCycle !== "Any" && item.rentCycle !== filters.rentCycle)
          return false;

        if (filters.minPrice && Number(item.rent) < Number(filters.minPrice))
          return false;

        if (filters.maxPrice && Number(item.rent) > Number(filters.maxPrice))
          return false;

        if (
          filters.amenities.length > 0 &&
          !filters.amenities.every((a) => item.amenities?.includes(a))
        )
          return false;

        return true;
      });
    },
    [filters, city]
  );

  /* ================= SORT + FILTER ================= */

  const filteredPGs = useMemo(() => {
    // Change this line 👇 to use pgList directly
     let list = [...pgList];
    //let list = applyFilters(pgList);

    if (filters.sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.rent - b.rent);
    }

    if (filters.sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.rent - a.rent);
    }

    return list;
  }, [ filters.sortBy, pgList]);

  /* ================= RENDER ================= */

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          {city ? `PGs in ${city}` : "Find My Perfect PG"}
        </h1>

        <Filters
          filters={tempFilters}          // 👈 inputs use tempFilters
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
          applyFilters={applyFiltersClick}
        />

        <PGListings list={filteredPGs} />

        {filteredPGs.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            No PGs found for selected filters
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
