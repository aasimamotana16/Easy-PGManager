// src/pages/findMypg/index.jsx
import { useState, useMemo, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import Filters from "./servicesFilter";
import PGListings from "./pgListing";
import HostelListings from "./hostelListing";

import { pgdetails, hosteldetails } from "../../config/staticData";

export default function FindMyPG() {
  const locationObj = useLocation();
  const { type } = useParams(); // pgListing | hostelListing

  // ✅ Get city from query param (used to filter `location` field in data)
  const city = new URLSearchParams(locationObj.search).get("city");

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
        // ✅ LOCATION FILTER (case-insensitive)
        if (city && item.location && item.location.toLowerCase() !== city.toLowerCase())
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

  /* ================= SORT + FILTER DATA ================= */

  const filteredData = useMemo(() => {
    const sortList = (list) => {
      if (filters.sortBy === "priceAsc") return [...list].sort((a, b) => a.rent - b.rent);
      if (filters.sortBy === "priceDesc") return [...list].sort((a, b) => b.rent - a.rent);
      return list;
    };

    return {
      pg: sortList(applyFilters(pgdetails)),
      hostel: sortList(applyFilters(hosteldetails)),
    };
  }, [applyFilters, filters.sortBy]);

  /* ================= RENDER ================= */

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ================= DYNAMIC HEADING ================= */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          {city
            ? type === "pgListing"
              ? `PGs in ${city}`
              : type === "hostelListing"
              ? `Hostels in ${city}`
              : `PGs & Hostels in ${city}`
            : "Find My Perfect Stay"}
        </h1>

        {/* ================= FILTERS ================= */}
        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
        />

        {/* ================= LISTINGS ================= */}
        {!type && (
          <>
            <PGListings list={filteredData.pg} />
            <HostelListings list={filteredData.hostel} />
          </>
        )}

        {type === "pgListing" && <PGListings list={filteredData.pg} />}
        {type === "hostelListing" && <HostelListings list={filteredData.hostel} />}

        {/* ================= NO DATA MESSAGE ================= */}
        {((type === "pgListing" && filteredData.pg.length === 0) ||
          (type === "hostelListing" && filteredData.hostel.length === 0) ||
          (!type && filteredData.pg.length === 0 && filteredData.hostel.length === 0)) && (
          <p className="text-center text-gray-500 mt-12">
            No listings found for selected filters
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
