import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import ServiceCard from "../../components/sCard";
import ListingCard from "../../components/listingCard";
import CButton from "../../components/cButton";
import CInput from "../../components/cInput";

import {
  services,
  pgdetails,
  hosteldetails,
  genderOptions,
  occupancyOptions,
  rentCycleOptions,
  amenitiesList,
} from "../../config/staticData";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

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

  const applyFilters = (list) => {
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
  };

  const sortedList = useMemo(() => {
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
  }, [filters]);

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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10">
          Filter Options
        </h2>

        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl space-y-12">

          {/* Basic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <CInput
              type="select"
              label="Looking For"
              value={filters.lookingFor}
              onChange={(e) =>
                handleFilterChange("lookingFor", e.target.value)
              }
              options={genderOptions}
            />

            <CInput
              type="select"
              label="Occupancy"
              value={filters.occupancy}
              onChange={(e) =>
                handleFilterChange("occupancy", e.target.value)
              }
              options={occupancyOptions}
            />
          </div>

          {/* Price + Rent Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <label className="block text-lg font-semibold mb-3">
                Price Range (₹)
              </label>
              <div className="flex gap-5">
                <CInput
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
                <CInput
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <CInput
              type="select"
              label="Rent Cycle"
              value={filters.rentCycle}
              onChange={(e) =>
                handleFilterChange("rentCycle", e.target.value)
              }
              options={rentCycleOptions}
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-lg font-semibold mb-5">
              Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => {
                const selected = filters.amenities.includes(amenity);
                return (
                  <CButton
                    key={amenity}
                    size="sm"
                    variant={selected ? "contained" : "outlined"}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </CButton>
                );
              })}
            </div>
          </div>

          {/* Sort + Reset */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t">
            <CInput
              type="select"
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange("sortBy", e.target.value)
              }
              options={[
                { label: "Default", value: "" },
                { label: "Price: Low → High", value: "priceAsc" },
                { label: "Price: High → Low", value: "priceDesc" },
              ]}
            />

            <CButton
              variant="contained"
              size="md"
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                setFilters({
                  lookingFor: "Any",
                  occupancy: "Any",
                  minPrice: "",
                  maxPrice: "",
                  rentCycle: "Any",
                  amenities: [],
                  sortBy: "",
                })
              }
            >
              Reset Filters
            </CButton>
          </div>
        </div>

        {/* PG Listings */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-24 mb-10">
          Available PGs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {sortedList.pg.map((pg) => (
            <Link
              key={pg.id}
              to={`/pg/${pg.id}`}
              className="hover:scale-[1.03] transition"
            >
              <ListingCard {...pg} />
            </Link>
          ))}
        </div>

        {/* Hostel Listings */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-24 mb-10">
          Available Hostels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {sortedList.hostel.map((hostel) => (
            <Link
              key={hostel.id}
              to={`/pg/${hostel.id}`}
              className="hover:scale-[1.03] transition"
            >
              <ListingCard {...hostel} />
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
