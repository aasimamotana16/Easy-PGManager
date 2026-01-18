// src/pages/findMypg/index.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import Filters from "./servicesFilter";
import PGListings from "./pgListing";

//import { pgdetails } from "../../config/staticData";

export default function FindMyPG() {
  const locationObj = useLocation();

  // ✅ City from query param
  const city = new URLSearchParams(locationObj.search).get("city");
  
  // 👇 PASTE THE NEW CODE HERE (Line 18ish) [cite: 2026-01-06]
  const [pgList, setPgList] = useState([]); 

  useEffect(() => {
    fetch("http://localhost:5000/api/pg/all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPgList(json.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);
  // 👆 END OF NEW CODE

  const [filters, setFilters] = useState({
    lookingFor: "Any",
    occupancy: "Any",
    minPrice: "",
    maxPrice: "",
    rentCycle: "Any",
    amenities: [],
    sortBy: "",
  });

  /* ================= FILTER HANDLERS ================= */

  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      resetFilters();
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const resetFilters = () => {
    setFilters({
      lookingFor: "Any",
      occupancy: "Any",
      minPrice: "",
      maxPrice: "",
      rentCycle: "Any",
      amenities: [],
      sortBy: "",
    });
  };

  /* ================= APPLY FILTERS ================= */

  const applyFilters = useCallback(
    (list) => {
      if (!Array.isArray(list)) return [];

      return list.filter((item) => {
        // 📍 Location filter
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
    let list = applyFilters(pgList);

    if (filters.sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.rent - b.rent);
    }

    if (filters.sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.rent - a.rent);
    }

    return list;
  }, [applyFilters, filters.sortBy]);

  /* ================= RENDER ================= */

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ================= HEADING ================= */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          {city ? `PGs in ${city}` : "Find My Perfect PG"}
        </h1>

        {/* ================= FILTERS ================= */}
        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
        />

        {/* ================= PG LISTINGS ================= */}
        <PGListings list={filteredPGs} />

        {/* ================= NO DATA ================= */}
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
