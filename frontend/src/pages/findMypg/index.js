import { useState, useMemo, useCallback } from "react";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import Filters from "./servicesFilter";
import PGListings from "./pgListing";
import HostelListings from "./hostelListing";

import { pgdetails, hosteldetails } from "../../config/staticData";

export default function FindMyPG() {
  const [filters, setFilters] = useState({
    lookingFor: "Any",
    occupancy: "Any",
    minPrice: "",
    maxPrice: "",
    rentCycle: "Any",
    amenities: [],
    sortBy: "",
  });

  // handle filter change
  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      resetFilters();
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // toggle amenities
  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // reset filters
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

  // apply filters
  const applyFilters = useCallback(
    (list) => {
      if (!list || list.length === 0) return [];

      return list.filter((item) => {
        if (
          filters.lookingFor !== "Any" &&
          item.gender &&
          item.gender !== filters.lookingFor
        )
          return false;

        if (
          filters.occupancy !== "Any" &&
          item.occupancy &&
          item.occupancy !== filters.occupancy
        )
          return false;

        if (
          filters.rentCycle !== "Any" &&
          item.rentCycle &&
          item.rentCycle !== filters.rentCycle
        )
          return false;

        if (
          filters.minPrice &&
          Number(item.rent) < Number(filters.minPrice)
        )
          return false;

        if (
          filters.maxPrice &&
          Number(item.rent) > Number(filters.maxPrice)
        )
          return false;

        if (
          filters.amenities.length > 0 &&
          (!item.amenities ||
            !filters.amenities.every((a) =>
              item.amenities.includes(a)
            ))
        )
          return false;

        return true;
      });
    },
    [filters]
  );

  // filter + sort
  const filteredData = useMemo(() => {
    const sortList = (list) => {
      if (filters.sortBy === "priceAsc")
        return [...list].sort((a, b) => a.rent - b.rent);

      if (filters.sortBy === "priceDesc")
        return [...list].sort((a, b) => b.rent - a.rent);

      return list;
    };

    return {
      pg: sortList(applyFilters(pgdetails)),
      hostel: sortList(applyFilters(hosteldetails)),
    };
  }, [applyFilters, filters.sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12">
          Find My PG
        </h1>

        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
        />

        <PGListings list={filteredData.pg} />
        <HostelListings list={filteredData.hostel} />

        {filteredData.pg.length === 0 &&
          filteredData.hostel.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              No PG or Hostel matches your filters
            </p>
          )}
      </div>

      <Footer />
    </div>
  );
}
