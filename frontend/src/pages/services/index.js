import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import PGListings from "./pgListing";
import HostelListings from "./hostelListing";
import Filters from "./servicesFilter";

import { services, pgdetails, hosteldetails } from "../../config/staticData";
import { useState, useMemo, useCallback } from "react";

export default function Services() {
  const [filters, setFilters] = useState({
    lookingFor: "Any",
    occupancy: "Any",
    minPrice: "",
    maxPrice: "",
    rentCycle: "Any",
    amenities: [],
    sortBy: "",
  });

  const handleFilterChange = (key, value) => {
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

  const applyFilters = useCallback((list) => {
    if (!list) return [];
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
      if (filters.minPrice && item.rent < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && item.rent > parseInt(filters.maxPrice)) return false;
      if (filters.amenities.length > 0) {
        for (let amenity of filters.amenities) {
          if (!item.amenities.includes(amenity)) return false;
        }
      }
      return true;
    });
  }, [filters]);

  const sortedList = useMemo(() => {
    const sortList = (list) => {
      if (!list) return [];
      if (filters.sortBy === "priceAsc") return [...list].sort((a, b) => a.rent - b.rent);
      if (filters.sortBy === "priceDesc") return [...list].sort((a, b) => b.rent - a.rent);
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-8">
          Our Services
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-center max-w-3xl mx-auto mb-20">
          EasyPG Manager helps you discover, filter, and manage PGs & Hostels effortlessly.
        </p>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mb-28">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>

        {/* Filters */}
        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
        />

        {/* PG Listings */}
        <PGListings list={sortedList.pg} />

        {/* Hostel Listings */}
        <HostelListings list={sortedList.hostel} />
      </div>

      <Footer />
    </div>
  );
}
